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
    for svc in datanode secondarynamenode namenode; do
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
accumulo_zookeeper_list=()
for element in "${nodes_array[@]}"
do
    IFS=: read -r -a array <<< ${element}
    zookeeper_member+="server.$i=${array[0]}:2888:3888"$'\n'

    # prepare ZK list for accumulo
    if ([[ ${array[0]} == *master* ]] || [[ ${array[0]} == *slave* ]])
    then
        accumulo_zookeeper_list+=(${array[0]}:2181)
    fi
    # Generate unique ID for each host by traverse the all host address in an identical order
    if [ ${host_name} == ${array[0]} ]
    then
        myid=${i}
    fi
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

# ============= Start hadoop master =============
# Data can survive from container's destroy if
# /tmp/hadoop-root/dfs is mounted to a host directory

# Check if name node has been initiated (avoid overwritten)
nameDir=$(hdfs getconf -confKey dfs.namenode.name.dir | sed "s/^file:\/\///")
if [ -d ${nameDir} ]
then
    echo "hdfs name node has been initiated"
else
    hdfs namenode -format
fi

# TODO: Provide choice for formatting hdfs during container's creation
# Start name node
hadoop-daemon.sh --config ${HADOOP_CONF_DIR} --script hdfs start namenode
# Start secondary node
# Fixme: better start secondary name node in another node
hadoop-daemon.sh --config ${HADOOP_CONF_DIR} --script hdfs start secondarynamenode
# Start data node
hadoop-daemon.sh --config ${HADOOP_CONF_DIR} --script hdfs start datanode
# Wait until hdfs is ready (running)
until hdfs dfsadmin -safemode wait | grep "Safe mode is OFF"
do
    sleep 5s
done

# ============= Start accumulo master =============

# Update instance.zookeeper.host
zookeeper_servers_str=$( IFS=$','; echo "${accumulo_zookeeper_list[*]}" )
sed -i -e "s/localhost:2181/${zookeeper_servers_str}/g" ${ACCUMULO_HOME}/conf/accumulo-site.xml

# Initiate data dir, input instance_name/pwd/pwd_confirm
# Will abort if directory has already been initiated
printf 'smash\nsmash\nsmash\n' | accumulo init

${ACCUMULO_HOME}/bin/start-server.sh ${host_name} gc
${ACCUMULO_HOME}/bin/start-server.sh ${host_name} tracer
${ACCUMULO_HOME}/bin/start-server.sh ${host_name} monitor
${ACCUMULO_HOME}/bin/start-server.sh ${host_name} master

# Keep process alive
tail -f /dev/null & wait ${!}


