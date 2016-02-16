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
COPY spark-env.sh ${SPARK_HOME}/conf 

ENTRYPOINT start-slave.sh spark://scats-1-master:7077 && tail -f /dev/null

EXPOSE 22 4040 7078 8081 
