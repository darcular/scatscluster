#! /bin/bash
#set -x

export USER=root
export ACCUMULO_PID_DIR=${ACCUMULO_HOME}/run
export ACCUMULO_IDENT_STRING=root

host_name=$(hostname)

# SIGTERM-handler
term_handler() {
    echo "term_handler trapped"
#    sleep 2s
    # Stops Accumulo services locally
    for signal in TERM KILL; do
        for svc in tserver gc master monitor tracer; do
            "$ACCUMULO_HOME"/bin/stop-server.sh "$host_name" "$ACCUMULO_HOME/lib/accumulo-start.jar" $svc $signal
        done
    done
    # Stops HDFS services locally
    for svc in datanode secondarynamenode; do
        hadoop-daemon.sh --config ${HADOOP_CONF_DIR} --script hdfs stop ${svc}
    done
    # Stop ZooKeeper locally
    zkServer.sh stop
    exit 143; # 128 + 15 -- SIGTERM
}

trap "term_handler" HUP INT QUIT TERM

# ============= Start zookeeper =============
IFS=, nodes_array=(${CLUSTER_NODES_LIST})
i=1
zookeeper_member=""
for element in "${nodes_array[@]}"
do
    IFS=: read -r -a array <<< ${element}
    # ignore nodes other than master and slave (cause node for geoserver do not have zookeeper)
    if !([[ ${array[0]} == *master* ]] || [[ ${array[0]} == *slave* ]])
    then
        continue
    fi
    if [ ${host_name} == ${array[0]} ]
    then
        myid=${i}
    fi
    zookeeper_member+="server.$i=${array[0]}:2888:3888"$'\n'
    zookeeper_server_list[$i]=${array[0]}:2181
    i=$((i+1))
done

cp ${ZOOKEEPER_HOME}/conf/zoo_sample.cfg ${ZOOKEEPER_HOME}/conf/zoo.cfg
echo ${zookeeper_member} >> ${ZOOKEEPER_HOME}/conf/zoo.cfg
mkdir -p ${ZOOKEEPER_DATA_DIR}
echo ${myid} > ${ZOOKEEPER_DATA_DIR}/myid
# Setup super user authentication for ZK
# root:smash->root:4bP/nXKOqVzdX7ZA75ZY9S2N2yU=
export SERVER_JVMFLAGS=-Dzookeeper.DigestAuthenticationProvider.superDigest=root:4bP/nXKOqVzdX7ZA75ZY9S2N2yU=
zkServer.sh start

# ============= Start hadoop slave =============
hadoop-daemon.sh --config ${HADOOP_CONF_DIR} --script hdfs start datanode
echo "Start waiting for hdfs namenode ready"
# Fixme hard code
until hdfs dfsadmin -fs hdfs://scats-1-master:9000/ -safemode wait | grep "Safe mode is OFF"
do
    sleep 5s
done

# ============= Start accumulo slave =============

# Update instance.zookeeper.host
zookeeper_servers_str=$( IFS=$','; echo "${zookeeper_server_list[*]}" )
sed -i -e "s/localhost:2181/${zookeeper_servers_str}/g" ${ACCUMULO_HOME}/conf/accumulo-site.xml

# Wait until accumulo master instance ready
# Fixme hard code
until </dev/tcp/scats-1-master/9999
do
  sleep 1s
done

${ACCUMULO_HOME}/bin/start-server.sh ${host_name} tserver
# Ensure tserver success to avoid tracer fail
until accumulo admin ping ${host_name}:9997
do
    sleep 2s
done
${ACCUMULO_HOME}/bin/start-server.sh ${host_name} gc
${ACCUMULO_HOME}/bin/start-server.sh ${host_name} tracer


# Keep process alive
tail -f /dev/null & wait ${!}
