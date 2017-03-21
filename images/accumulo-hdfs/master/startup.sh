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
zookeeper_servers_str=$( IFS=$','; echo "${zookeeper_server_list[*]}" )
sed -i -e "s/localhost:2181/${zookeeper_servers_str}/g" ${ACCUMULO_HOME}/conf/accumulo-site.xml

# Initiate data dir, input instance_name/pwd/pwd_confirm
# Will abort if directory has already been initiated
printf 'smash\nsmash\nsmash\n' | accumulo init

${ACCUMULO_HOME}/bin/start-server.sh ${host_name} gc
${ACCUMULO_HOME}/bin/start-server.sh ${host_name} tracer
${ACCUMULO_HOME}/bin/start-server.sh ${host_name} monitor
${ACCUMULO_HOME}/bin/start-server.sh ${host_name} master


# Keep process alive
tail -f /dev/null

