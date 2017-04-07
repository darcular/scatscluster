#!/bin/bash
source ${SPARK_HOME}/sbin/reset_conf.sh

# Launch Spark Master and History daemons
${SPARK_HOME}/sbin/start-master.sh
${SPARK_HOME}/sbin/start-history-server.sh