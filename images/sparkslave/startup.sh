export SPARK_LOCAL_IP=127.0.0.1
export SPARK_PUBLIC_DNS=`getip.sh dockerhost`
export SPARK_MASTER_IP=sparkmaster

export SPARK_HISTORY_OPTS="-Dspark.history.ui.port=${SPARK_HISTORY_WEBUI_PORT} -Dspark.history.fs.logDirectory=file:///tmp/spark-events/ -Dspark.io.compression.codec=lzf -Dspark.eventLog.enabled=true -Dspark.eventLog.dir=file:///tmp/spark-events/"

echo "spark.driver.port ${SPARK_DRIVER_PORT}" > ${SPARK_HOME}/conf/spark-defaults.conf
echo "spark.fileserver.port ${SPARK_FILESERVER_PORT}" >> ${SPARK_HOME}/conf/spark-defaults.conf
echo "spark.broadcast.port ${SPARK_BROADCAST_PORT}" >> ${SPARK_HOME}/conf/spark-defaults.conf
echo "spark.replClassServer.port ${SPARK_REPLCLASSSERVER_PORT}" >> ${SPARK_HOME}/conf/spark-defaults.conf
echo "spark.blockManager.port ${SPARK_BLOCKMANAGER_PORT}" >> ${SPARK_HOME}/conf/spark-defaults.conf
echo "spark.executor.port ${SPARK_EXECUTOR_PORT}" >> ${SPARK_HOME}/conf/spark-defaults.conf
echo "spark.ui.port ${SPARK_UI_PORT}" >> ${SPARK_HOME}/conf/spark-defaults.conf
echo "spark.master.rest.port 6066" >> ${SPARK_HOME}/conf/spark-defaults.conf
echo "spark.broadcast.factory org.apache.spark.broadcast.HttpBroadcastFactory" >> ${SPARK_HOME}/conf/spark-defaults.conf
echo "spark.eventLog.enabled true" >> ${SPARK_HOME}/conf/spark-defaults.conf
echo "spark.eventLog.dir file:///${SPARK_HOME}/logs/" >> ${SPARK_HOME}/conf/spark-defaults.conf
echo "spark.eventLog.dir file:///tmp/spark-events/" >> ${SPARK_HOME}/conf/spark-defaults.conf
echo "spark.driver.host sparkmaster" >> ${SPARK_HOME}/conf/spark-defaults.conf

start-slave.sh spark://${SPARK_MASTER_IP}:${SPARK_MASTER_PORT}
start-history-server.sh
