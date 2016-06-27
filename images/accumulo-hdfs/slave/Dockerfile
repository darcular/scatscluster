FROM 115.146.95.30:5000/clusternode:0.3.0

ENV HADOOP_VERSION=2.6.4
ENV ZOOKEEPER_VERSION=3.4.8
ENV ACCUMULO_VERSION=1.6.5
ENV GEOMESA_VERSION=1.2.2

#
# ================== Install Hadoop =================
#

# Download hadoop-2.6.4 and place to /opt/hadoop
RUN curl -s http://apache.mirror.serversaustralia.com.au/hadoop/common/hadoop-${HADOOP_VERSION}/hadoop-${HADOOP_VERSION}.tar.gz \
    | tar -xz -C /opt
RUN cd /opt && ln -s ./hadoop-${HADOOP_VERSION} hadoop

# Set environment for hadoop
ENV JAVA_HOME /usr/lib/jvm/java-8-openjdk-amd64
ENV HADOOP_HOME /opt/hadoop
ENV HADOOP_CONF_DIR ${HADOOP_HOME}/etc/hadoop
ENV PATH ${PATH}:${HADOOP_HOME}/bin:${HADOOP_HOME}/sbin

# Copy setting files into image from project
# yarn-site.xml and mapred-site.xml may need to be added depends on use case
# Since slave instances are started by other docker daemons, master instance
# do NOT need to set slaves's identities (Let slaves call master)
COPY hadoop-conf/hdfs-site.xml ${HADOOP_CONF_DIR}/hdfs-site.xml
COPY hadoop-conf/core-site.xml ${HADOOP_CONF_DIR}/core-site.xml

#
# ================== Install Zookeeper =================
#

# Download zookeeper-3.4.8 and place to /opt/zookeeper
RUN curl -s http://apache.mirror.serversaustralia.com.au/zookeeper/zookeeper-${ZOOKEEPER_VERSION}/zookeeper-${ZOOKEEPER_VERSION}.tar.gz \
    | tar -xz -C /opt
RUN cd /opt && ln -s ./zookeeper-${ZOOKEEPER_VERSION} zookeeper

# Set environment for zoopkeeper
ENV ZOOKEEPER_HOME /opt/zookeeper
ENV PATH ${PATH}:${ZOOKEEPER_HOME}/bin
ENV ZOOKEEPER_DATA_DIR=/mnt/zookeeper/data

# Copy setting file's tamplate
COPY zookeeper-conf/zoo_sample.cfg ${ZOOKEEPER_HOME}/conf/zoo_sample.cfg
RUN sed -i '/^dataDir=.*/c\dataDir='${ZOOKEEPER_DATA_DIR} ${ZOOKEEPER_HOME}/conf/zoo_sample.cfg

#
# ================== Install Accumulo =================
#

# Download accumulo-1.6.5 and place to /opt/accumulo
RUN curl -s http://apache.mirror.serversaustralia.com.au/accumulo/${ACCUMULO_VERSION}/accumulo-${ACCUMULO_VERSION}-bin.tar.gz \
    | tar -xz -C /opt
RUN cd /opt && ln -s ./accumulo-${ACCUMULO_VERSION} accumulo

# Set environment
ENV ACCUMULO_HOME /opt/accumulo
ENV PATH ${PATH}:${ACCUMULO_HOME}/bin

RUN cp ${ACCUMULO_HOME}/conf/examples/2GB/standalone/* ${ACCUMULO_HOME}/conf/
COPY accumulo-conf/masters ${ACCUMULO_HOME}/conf/masters
COPY accumulo-conf/accumulo-env.sh ${ACCUMULO_HOME}/conf/accumulo-env.sh
COPY accumulo-conf/accumulo-site.xml ${ACCUMULO_HOME}/conf/accumulo-site.xml

#
# ================== Install GeoMesa =================
#

RUN cd $ACCUMULO_HOME/lib/ext && curl -O -s http://115.146.95.30/geomesa-1.2.3/dist/accumulo/geomesa-accumulo-distributed-runtime-1.2.3.jar


# Download geomesa-1.2.2 and place to /opt/geomesa
#RUN curl -s https://repo.locationtech.org/content/repositories/geomesa-releases/org/locationtech/geomesa/geomesa-dist/${GEOMESA_VERSION}/geomesa-dist-${GEOMESA_VERSION}-bin.tar.gz \
#    | tar -xz -C /opt
#RUN cd /opt && ln -s ./geomesa-${GEOMESA_VERSION} geomesa

#
# ================== Install Startup Script =================
#

# Copy startup script into image
COPY startup.sh /opt/startup.sh
RUN chmod +x /opt/*.sh

# Note: Use Exec form ENTRYPOINT[..] to ease importing run-time arguments

ENTRYPOINT ["/opt/startup.sh"]

# EXPOSE ports are NOT necessary in host mode
EXPOSE 50020 50090 50070 50010 50075 8031 8032 8033 8040 8042 49707 22 8088 8030 9000

#
# ================== End of file ===================
#