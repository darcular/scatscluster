#!/bin/bash

#TODO install zookeeper at base image.

# SIGTERM-handler
term_handler() {
    echo "term_handler trapped"
    ${KAFKA_HOME}/bin/kafka-server-stop.sh
    ${KAFKA_HOME}/bin/zookeeper-server-stop.sh

    exit 143; # 128 + 15 -- SIGTERM
}

trap "term_handler" HUP INT QUIT TERM

# Launch Spark Master and History daemons
${KAFKA_HOME}/bin/zookeeper-server-start.sh -daemon ${KAFKA_HOME}/config/zookeeper.properties
sleep 7s
${KAFKA_HOME}/bin/kafka-server-start.sh -daemon ${KAFKA_HOME}/config/server.properties

# Keep process alive
tail -f /dev/null & wait ${!}