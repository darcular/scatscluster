#! /bin/bash

export USER=root
host_name=$(hostname)

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
zkServer.sh start

# ============= Start hadoop slave =============
hadoop-daemon.sh --config ${HADOOP_CONF_DIR} --script hdfs start datanode
echo "Start waiting for hdfs namenode ready"
# Fixme hard code
while hdfs dfsadmin -fs hdfs://scats-1-master:9000/ -safemode wait | grep ON
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
tail -f /dev/null