#!/bin/bash

host_name=$(hostname)

# SIGTERM-handler
term_handler() {
    echo "term_handler trapped"
    ${KAFKA_HOME}/bin/kafka-server-stop.sh
#    ${KAFKA_HOME}/bin/zookeeper-server-stop.sh

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
    zookeeper_member+="server.$i=${array[0]}:2888:3888"$'\n'

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

#${KAFKA_HOME}/bin/zookeeper-server-start.sh -daemon ${KAFKA_HOME}/config/zookeeper.properties

# ============= Start Kafka =============
sleep 30s
${KAFKA_HOME}/bin/kafka-server-start.sh -daemon ${KAFKA_HOME}/config/server.properties

# Keep process alive
tail -f /dev/null & wait ${!}