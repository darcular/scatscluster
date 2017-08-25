#!/bin/bash
source ${SPARK_HOME}/sbin/reset_conf.sh

# SIGTERM-handler
term_handler() {
    echo "term_handler trapped"
    ${SPARK_HOME}/sbin/stop-master.sh
    ${SPARK_HOME}/sbin/stop-history-server.sh

    exit 143; # 128 + 15 -- SIGTERM
}

trap "term_handler" HUP INT QUIT TERM

# Launch Spark Master and History daemons
${SPARK_HOME}/sbin/start-master.sh
${SPARK_HOME}/sbin/start-history-server.sh &

# Keep process alive
tail -f /dev/null & wait ${!}