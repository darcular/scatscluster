#!/bin/bash
source ${SPARK_HOME}/sbin/reset_conf.sh

# SIGTERM-handler
term_handler() {
    echo "term_handler trapped"
    ${SPARK_HOME}/sbin/stop-slave.sh
    ${SPARK_HOME}/sbin/stop-history-server.sh

    exit 143; # 128 + 15 -- SIGTERM
}

trap "term_handler" HUP INT QUIT TERM

# Launch Spark Slave and History daemons
${SPARK_HOME}/sbin/start-slave.sh spark://${SPARK_MASTER_HOST}:${SPARK_MASTER_PORT}
${SPARK_HOME}/sbin/start-history-server.sh &

# Keep process alive
tail -f /dev/null & wait ${!}