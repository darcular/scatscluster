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

ENV SPARK_MASTER_PORT=7077
ENV SPARK_MASTER_WEBUI_PORT=8080
ENV SPARK_HISTORY_WEBUI_PORT=18080

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

COPY getip.sh ${SPARK_HOME}/bin
COPY startup.sh ${SPARK_HOME}/sbin
COPY shutdown.sh ${SPARK_HOME}/sbin
RUN chmod a+x ${SPARK_HOME}/bin/*.sh 
RUN chmod a+x ${SPARK_HOME}/sbin/*.sh 
RUN mkdir /tmp/spark-events

ENTRYPOINT startup.sh && tail -f /dev/null

EXPOSE 22 4040 7078 8081 18080 7079 7080 7081 7082 7083
