#!/usr/bin/env bash

#
# Script for setup Spark Environment in its config files
# Notes: Global Env will be override by the settings in spark-env.sh.
#

# ============= Settings Start =============
# Directory/File Path
SPARK_LOG_HOME=${SPARK_HOME}/logs
SPARK_EVENT_HOME=/tmp/spark-events
SPARK_ENV_FILE=${SPARK_HOME}/conf/spark-env.sh

# Master-Daemon settings for Standalone mode
# Fixme: Hard code hostname
SPARK_MASTER_HOST="smash-1-master"
SPARK_MASTER_PORT=7077
SPARK_MASTER_WEBUI_PORT=8080

# Worker-Daemon settings for Standalone mode
SPARK_WORKER_PORT=7078
SPARK_WORKER_WEBUI_PORT=8081
SPARK_WORKER_MEMORY="10G"
SPARK_WORKER_CORES=3
SPARK_WORKER_OPTS="\"-Dspark.worker.cleanup.enabled=true \
   -Dspark.worker.cleanup.interval=1800 \
   -Dspark.worker.cleanup.appDataTtl=43200\""

# History-Daemon settings for Standalone mode
SPARK_HISTORY_WEBUI_PORT=18080
SPARK_HISTORY_OPTS="\"-Dspark.history.ui.port=${SPARK_HISTORY_WEBUI_PORT} \
  -Dspark.eventLog.enabled=true \
  -Dspark.eventLog.dir=file://${SPARK_EVENT_HOME}/ \
  -Dspark.history.fs.logDirectory=file://${SPARK_EVENT_HOME}/ \
  -Dspark.history.fs.cleaner.enabled=true \
  -Dspark.history.fs.cleaner.maxAge=2d\""

# ============= Settings End ==============

# Write settings into a fresh spark-env.sh which will be loaded by
# running ${SPARK_HOME}/sbin/start-master.sh
cp ${SPARK_HOME}/conf/spark-env.sh.template ${SPARK_ENV_FILE}
echo "SPARK_MASTER_HOST=${SPARK_MASTER_HOST}" >> ${SPARK_ENV_FILE}
echo "SPARK_MASTER_PORT=${SPARK_MASTER_PORT}" >> ${SPARK_ENV_FILE}
echo "SPARK_MASTER_WEBUI_PORT=${SPARK_MASTER_WEBUI_PORT}" >> ${SPARK_ENV_FILE}
echo "SPARK_WORKER_PORT=${SPARK_WORKER_PORT}" >> ${SPARK_ENV_FILE}
echo "SPARK_WORKER_WEBUI_PORT=${SPARK_WORKER_WEBUI_PORT}" >> ${SPARK_ENV_FILE}
echo "SPARK_WORKER_MEMORY=${SPARK_WORKER_MEMORY}" >> ${SPARK_ENV_FILE}
echo "SPARK_WORKER_CORES=${SPARK_WORKER_CORES}" >> ${SPARK_ENV_FILE}
echo "SPARK_WORKER_OPTS=${SPARK_WORKER_OPTS}" >> ${SPARK_ENV_FILE}
echo "SPARK_HISTORY_OPTS=${SPARK_HISTORY_OPTS}" >> ${SPARK_ENV_FILE}

# Initiate directories for logs and events
if [ ! -d ${SPARK_LOG_HOME} ]; then
  mkdir ${SPARK_LOG_HOME}
fi

if [ ! -d ${SPARK_EVENT_HOME} ]; then
  mkdir ${SPARK_EVENT_HOME}
fi




