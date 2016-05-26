#
# Creates a distributed Hadoop 2.6.0 (and YARN) Docker image 
# It is taken from https://github.com/sequenceiq/docker-hadoop-ubuntu, but
# then vastly modified
#

#FROM docker.eresearch.unimelb.edu.au/clusternode:0.2.0
FROM cuttlefish.eresearch.unimelb.edu.au/clusternode:0.3.0

ENV HADOOP_PREFIX /usr/local/hadoop
ENV HADOOP_HDFS_HOME ${HADOOP_PREFIX}
ENV HADOOP_MAPRED_HOME ${HADOOP_PREFIX}
ENV HADOOP_YARN_HOME ${HADOOP_PREFIX}
ENV HADOOP_CONF_DIR ${HADOOP_PREFIX}/etc/hadoop
ENV HADOOP_LOG_DIR ${HADOOP_PREFIX}/logs

# FIXME: this is hardcoded in hdfs-site.xml
ENV HADOOP_NAME_DIR /var/hdfs
ENV YARN_CONF_DIR ${HADOOP_PREFIX}/etc/hadoop
ENV PATH ${PATH}:${HADOOP_PREFIX}/bin:${HADOOP_PREFIX}/sbin

# Installs Hadoop 2.6.0
RUN curl -s http://www.eu.apache.org/dist/hadoop/common/hadoop-2.6.0/hadoop-2.6.0.tar.gz \
    | tar -xz -C /usr/local/
RUN cd /usr/local && ln -s ./hadoop-2.6.0 hadoop

#RUN sed -i '/^export JAVA_HOME/ s:.*:export JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64/\nexport \
#    HADOOP_PREFIX=/usr/local/hadoop\nexport HADOOP_PREFIX=/usr/local/hadoop\n:' \
#    ${HADOOP_PREFIX}/etc/hadoop/hadoop-env.sh
#RUN sed -i '/^export HADOOP_CONF_DIR/ s:.*:export HADOOP_CONF_DIR=/usr/local/hadoop/etc/hadoop/:' \
#    ${HADOOP_PREFIX}/etc/hadoop/hadoop-env.sh

RUN mkdir ${HADOOP_PREFIX}/input
RUN cp ${HADOOP_PREFIX}/etc/hadoop/*.xml ${HADOOP_PREFIX}/input

# FIXME: hostnames are hardcoded
#COPY core-site.xml.template ${HADOOP_PREFIX}/etc/hadoop/core-site.xml.template
COPY hdfs-site.xml ${HADOOP_PREFIX}/etc/hadoop/hdfs-site.xml
COPY core-site.xml ${HADOOP_PREFIX}/etc/hadoop/core-site.xml

COPY mapred-site.xml ${HADOOP_PREFIX}/etc/hadoop/mapred-site.xml
COPY yarn-site.xml ${HADOOP_PREFIX}/etc/hadoop/yarn-site.xml

# Fixes the libhadoop.so
RUN rm  /usr/local/hadoop/lib/native/*
RUN curl -Ls http://dl.bintray.com/sequenceiq/sequenceiq-bin/hadoop-native-64-2.6.0.tar | \
    tar -x -C /usr/local/hadoop/lib/native/

# Adds the startup/shutdown scripts
COPY startup.sh /etc/startup.sh
COPY shutdown.sh /etc/shutdown.sh
#RUN chown root:root /etc/*.sh
RUN chmod a+x /etc/*.sh

# Work-around Docker.io build error
RUN ls -la /usr/local/hadoop/etc/hadoop/*-env.sh
RUN chmod +x /usr/local/hadoop/etc/hadoop/*-env.sh
RUN ls -la /usr/local/hadoop/etc/hadoop/*-env.sh

# Fixes the 254 error code
RUN sed  -i "/^[^#]*UsePAM/ s/.*/#&/"  /etc/ssh/sshd_config
RUN echo "UsePAM no" >> /etc/ssh/sshd_config
RUN echo "Port 2122" >> /etc/ssh/sshd_config

#RUN service ssh start && $HADOOP_PREFIX/etc/hadoop/hadoop-env.sh && $HADOOP_PREFIX/sbin/start-dfs.sh && $HADOOP_PREFIX/bin/hdfs dfs -mkdir -p /user/root
#RUN service ssh start && $HADOOP_PREFIX/etc/hadoop/hadoop-env.sh && $HADOOP_PREFIX/sbin/start-dfs.sh && $HADOOP_PREFIX/bin/hdfs dfs -put $HADOOP_PREFIX/etc/hadoop/ input

# Initializes the Hadoop file system
RUN mkdir ${HADOOP_NAME_DIR}
#RUN $HADOOP_PREFIX/sbin/hadoop-daemon.sh --config $HADOOP_CONF_DIR --script hdfs start datanode

# FIXME: hostnames are hardcoded
#COPY slaves ${HADOOP_CONF_DIR}/

RUN ${HADOOP_PREFIX}/bin/hdfs namenode -format

#RUN service ssh start && \
#    ${HADOOP_PREFIX}/etc/hadoop/hadoop-env.sh && \
#    start-dfs.sh && \
#    hdfs dfs -mkdir -p /user/root && \
#    hdfs dfs -put ${HADOOP_PREFIX}/etc/hadoop/ input

# Starts HDFS datanode, namenode, and YARN
ENTRYPOINT /etc/startup.sh && tail -f /dev/null

# NOTE: test
# hadoop jar ${HADOOP_PREFIX}/share/hadoop/mapreduce/hadoop-mapreduce-examples-2.6.0.jar grep input output 'dfs[a-z.]+'
# hdfs dfs -cat output/*

EXPOSE 50020 50090 50070 50010 50075 8031 8032 8033 8040 8042 49707 22 8088 8030 9000
