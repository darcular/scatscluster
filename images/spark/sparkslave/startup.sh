#!/bin/bash
source ${SPARK_HOME}/sbin/reset_conf.sh

# Launch Spark Slave and History daemons
${SPARK_HOME}/sbin/start-slave.sh spark://${SPARK_MASTER_HOST}:${SPARK_MASTER_PORT}
${SPARK_HOME}/sbin/start-history-server.sh