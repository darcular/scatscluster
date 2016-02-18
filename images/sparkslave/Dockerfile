#
# Creates a Slave Spark 1.6.0 Docker image
#

FROM docker.eresearch.unimelb.edu.au/clusternode:0.1.0

# Installs Spark
RUN curl -s http://apache.mirror.digitalpacific.com.au/spark/spark-1.6.0/spark-1.6.0-bin-hadoop2.6.tgz | \
    tar -xz -C /usr/local/
RUN cd /usr/local && ln -s ./spark-1.6.0-bin-hadoop2.6 spark

ENV SPARK_HOME /usr/local/spark
ENV PATH ${PATH}:${SPARK_HOME}/bin:${SPARK_HOME}/sbin:

#ENV SPARK_LOCAL_IP=sparkslave
#ENV SPARK_PUBLIC_DNS=dockerhost

#ENV SPARK_LOCAL_IP_CMD="grep sparkslave /etc/hosts | head -1 | cut -f 1"
#ENV SPARK_PUBLIC_DNS_CMD="grep dockerhost /etc/hosts | cut -f 1"

#ENV SPARK_MASTER_IP_CMD="grep scats-1-master /etc/hosts | cut -f 1"

#ENV SPARK_MASTER_IP=scats-1-master
ENV SPARK_MASTER_PORT=7077
ENV SPARK_MASTER_WEBUI_PORT=8080

#ENV SPARK_WORKER_IP_CMD="grep sparkslave /etc/hosts | cut -f 1"

#ENV SPARK_WORKER_IP=sparkslave
ENV SPARK_WORKER_PORT=7078
ENV SPARK_WORKER_MEMORY=5G
ENV SPARK_WORKER_WEBUI_PORT=8081

ENV SPARK_DRIVER_PORT=7079
ENV SPARK_FILESERVER_PORT=7080
ENV SPARK_BROADCAST_PORT=7081
ENV SPARK_REPLCLASSSERVER_PORT=7082
ENV SPARK_BLOCKMANAGER_PORT=7083
ENV SPARK_EXECUTOR_PORT=7084
ENV SPARK_UI_PORT=4040

#ENV SPARK_WORKER_OPTS="-Dspark.driver.port=${SPARK_DRIVER_PORT} \
# -Dspark.fileserver.port=${SPARK_FILESERVER_PORT} \ 
# -Dspark.broadcast.port=${SPARK_BROADCAST_PORT} \
# -Dspark.replClassServer.port=${SPARK_REPLCLASSSERVER_PORT} \ 
# -Dspark.blockManager.port=${SPARK_BLOCKMANAGER_PORT} \
# -Dspark.executor.port=${SPARK_EXECUTOR_PORT} \ 
# -Dspark.ui.port=${SPARK_UI_PORT} \
# -Dspark.broadcast.factory=org.apache.spark.broadcast.HttpBroadcastFactory"
#COPY spark-env.sh ${SPARK_HOME}/conf 

COPY getip.sh ${SPARK_HOME}/bin
COPY spark-defaults.conf ${SPARK_HOME}/conf
COPY bootstrap.sh ${SPARK_HOME}/sbin
RUN chmod a+x ${SPARK_HOME}/bin/*.sh 
RUN chmod a+x ${SPARK_HOME}/sbin/*.sh 

ENTRYPOINT bootstrap.sh && tail -f /dev/null

EXPOSE 22 4040 7078 8081 7079 7080 7081 7082 7083
