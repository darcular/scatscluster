
source setip.sh

echo "spark.driver.port ${SPARK_DRIVER_PORT}" > ${SPARK_CONF_FILE}
echo "spark.fileserver.port ${SPARK_FILESERVER_PORT}" >> ${SPARK_CONF_FILE}
echo "spark.broadcast.port ${SPARK_BROADCAST_PORT}" >> ${SPARK_CONF_FILE}
echo "spark.replClassServer.port ${SPARK_REPLCLASSSERVER_PORT}" >> ${SPARK_CONF_FILE}
echo "spark.blockManager.port ${SPARK_BLOCKMANAGER_PORT}" >> ${SPARK_CONF_FILE}
echo "spark.executor.port ${SPARK_EXECUTOR_PORT}" >> ${SPARK_CONF_FILE}
echo "spark.ui.port ${SPARK_UI_PORT}" >> ${SPARK_CONF_FILE}
echo "spark.master.rest.port 6066" >> ${SPARK_CONF_FILE}
echo "spark.broadcast.factory org.apache.spark.broadcast.HttpBroadcastFactory" >> ${SPARK_CONF_FILE}
echo "spark.eventLog.enabled true" >> ${SPARK_CONF_FILE}
echo "spark.eventLog.dir file://${SPARK_EVENT_HOME}/" >> ${SPARK_CONF_FILE}
echo "spark.history.fs.logDirectory file://${SPARK_LOG_HOME}/" >> ${SPARK_CONF_FILE}
echo "spark.driver.host ${SPARK_MASTER_IP}" >> ${SPARK_CONF_FILE}
echo "spark.httpBroadcast.uri http://${SPARK_MASTER_IP}:${SPARK_BROADCAST_PORT}" >> ${SPARK_CONF_FILE}
echo "spark.repl.class.uri http://${SPARK_MASTER_IP}:${SPARK_REPLCLASSSERVER_PORT}" >> ${SPARK_CONF_FILE}
echo "spark.io.compression.codec lzf" >> ${SPARK_CONF_FILE}

export SPARK_HISTORY_OPTS="-Dspark.history.ui.port=${SPARK_HISTORY_WEBUI_PORT} \
  -Dspark.history.fs.logDirectory=file://${SPARK_EVENT_HOME}/ \
  -Dspark.io.compression.codec=lzf -Dspark.eventLog.enabled=true \
  -Dspark.eventLog.dir=file://${SPARK_EVENT_HOME}/"

start-master.sh
start-history-server.sh

