#
# Creates a Master Spark 2.0.0 Docker image for SMASH
#

# FROM docker.eresearch.unimelb.edu.au/clusternode:0.2.0
# FROM cuttlefish.eresearch.unimelb.edu.au/clusternode:0.3.0
FROM 115.146.95.30:5000/clusternode:0.3.0

ENV SPARK_VERSION=2.0.0

# ============== Install Application Binary ==============
# Installs Spark
RUN curl -s http://archive.apache.org/dist/spark/spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop2.6.tgz | \
    tar -xz -C /usr/local/
RUN cd /usr/local && ln -s ./spark-${SPARK_VERSION}-bin-hadoop2.6 spark
ENV SPARK_HOME=/usr/local/spark
ENV PATH=${PATH}:${SPARK_HOME}/bin:${SPARK_HOME}/sbin

# Installs R
RUN apt-get update -y
RUN apt-get install r-base -y

# ============== Setting Entrypoint ==============
# Copy shell files for configuration and startup
COPY reset_conf.sh ${SPARK_HOME}/sbin
COPY startup.sh ${SPARK_HOME}/sbin
RUN chmod a+x ${SPARK_HOME}/bin/*.sh 
RUN chmod a+x ${SPARK_HOME}/sbin/*.sh

ENTRYPOINT ${SPARK_HOME}/sbin/startup.sh && tail -f /dev/null

EXPOSE 22 4040 6066 7077 8080 18080 7079 7080 7081 7082 7083
