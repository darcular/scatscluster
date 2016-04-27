#
# Creates a Master Spark 1.6.0 Docker image
#

#FROM docker.eresearch.unimelb.edu.au/clusternode:0.2.0
FROM cuttlefish.eresearch.unimelb.edu.au/clusternode:0.3.0

# Installs Spark
RUN curl -s http://apache.mirror.digitalpacific.com.au/spark/spark-1.6.0/spark-1.6.0-bin-hadoop2.6.tgz | \
    tar -xz -C /usr/local/
RUN cd /usr/local && ln -s ./spark-1.6.0-bin-hadoop2.6 spark

# Installs R
RUN apt-get update -y
RUN apt-get install r-base -y
 
ENV SPARK_HOME /usr/local/spark
ENV PATH ${PATH}:${SPARK_HOME}/bin:${SPARK_HOME}/sbin

# Setups ports 
ENV SPARK_MASTER_PORT=7077
ENV SPARK_MASTER_WEBUI_PORT=8080
ENV SPARK_HISTORY_WEBUI_PORT=18080

ENV SPARK_DRIVER_PORT=7079
ENV SPARK_FILESERVER_PORT=7080
ENV SPARK_BROADCAST_PORT=7081
ENV SPARK_REPLCLASSSERVER_PORT=7082
ENV SPARK_BLOCKMANAGER_PORT=7083
ENV SPARK_EXECUTOR_PORT=7084
ENV SPARK_UI_PORT=4040
ENV SPARK_MASTER_REST_PORT=6066

COPY setip.sh ${SPARK_HOME}/sbin
COPY startup.sh ${SPARK_HOME}/sbin
COPY shutdown.sh ${SPARK_HOME}/sbin
RUN chmod a+x ${SPARK_HOME}/bin/*.sh 
RUN chmod a+x ${SPARK_HOME}/sbin/*.sh 

# Setups logs
ENV SPARK_LOG_HOME=${SPARK_HOME}/logs
ENV SPARK_EVENT_HOME=/tmp/spark-events
ENV SPARK_CONF_FILE=${SPARK_HOME}/conf/spark-defaults.conf

RUN mkdir ${SPARK_LOG_HOME}
RUN mkdir ${SPARK_EVENT_HOME}

ENTRYPOINT ${SPARK_HOME}/sbin/startup.sh && tail -f /dev/null

EXPOSE 22 4040 6066 7077 8080 18080 7079 7080 7081 7082 7083
