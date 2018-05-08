FROM 115.146.95.30:5000/clusternode:0.3.0

ENV HADOOP_VERSION=2.7.4
ENV ACCUMULO_VERSION=1.8.1
ENV GEOMESA_VERSION=1.3.2

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

# Copy setting files into image from project for hadoop
# yarn-site.xml and mapred-site.xml may need to be added depends on use case
# Since slave instances are started by other docker daemons, master instance
# do NOT need to set slaves's identities (Let slaves call master)
COPY hadoop-conf/hdfs-site.xml ${HADOOP_CONF_DIR}/hdfs-site.xml
COPY hadoop-conf/core-site.xml ${HADOOP_CONF_DIR}/core-site.xml
# name node are initiated in startup.sh

#
# ================== Install Accumulo =================
#

# Download accumulo-1.6.5 and place to /opt/accumulo
RUN curl -s https://archive.apache.org/dist/accumulo/${ACCUMULO_VERSION}/accumulo-${ACCUMULO_VERSION}-bin.tar.gz \
    | tar -xz -C /opt
RUN cd /opt && ln -s ./accumulo-${ACCUMULO_VERSION} accumulo

# Set environment
ENV ACCUMULO_HOME /opt/accumulo
ENV PATH ${PATH}:${ACCUMULO_HOME}/bin

RUN cp ${ACCUMULO_HOME}/conf/examples/3GB/standalone/* ${ACCUMULO_HOME}/conf/
COPY accumulo-conf/1.8/masters ${ACCUMULO_HOME}/conf/masters
COPY accumulo-conf/1.8/accumulo-env.sh ${ACCUMULO_HOME}/conf/accumulo-env.sh
COPY accumulo-conf/1.8/accumulo-site.xml ${ACCUMULO_HOME}/conf/accumulo-site.xml
COPY accumulo-conf/1.8/generic_logger.xml ${ACCUMULO_HOME}/conf/generic_logger.xml

#
# ================== Install GeoMesa CML Tool =================
#

# Fixme: GeoMesa's component jar is downloaded from yikai's personal http-file-server.
RUN curl -s http://115.146.95.30/geomesa-${GEOMESA_VERSION}/dist/geomesa-accumulo_2.11-${GEOMESA_VERSION}-bin.tar.gz \
                         | tar -xz -C /opt
RUN cd /opt && ln -s ./geomesa-accumulo_2.11-${GEOMESA_VERSION} geomesa-tool

ENV GEOMESA_HOME /opt/geomesa-tool
ENV PATH $PATH:${GEOMESA_HOME}/bin
# Todo If needed, use install-jai.sh and install-jline.sh to install dependencies for shape file support and raster ingest


#
# ================== Install Startup Script =================
#

# Copy startup script into image
COPY startup.sh /opt/startup.sh
RUN chmod +x /opt/*.sh

# Note: Use Exec form ENTRYPOINT[..] to ease importing run-time arguments
ENTRYPOINT ["/opt/startup.sh"]
#STOPSIGNAL SIGTERM
# EXPOSE ports are NOT necessary in host mode
EXPOSE 50020 50090 50070 50010 50075 8031 8032 8033 8040 8042 49707 22 8088 8030 9000

#
# ================== End of file ===================
#