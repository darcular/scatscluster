#
# Creates a distributed hadoop 2.6.0 Docker image
# It is taken from https://github.com/sequenceiq/hadoop-docker, but
# then vastly modified
#

FROM sequenceiq/pam:centos-6.5

# TODO: puts all the settings in a volume, using EJS to patch them in the
# master and slave modes

# TODO: sets sizing parameters (memory, etc) in hadoop-env.sh and puts it 
# under a volume

# TODO: what about putting logs under /var/log? 

# Sets user root, with passwor docker
USER root
RUN echo root:docker | chpasswd 

# install dev tools
RUN yum install -y curl which tar sudo openssh-server openssh-clients rsync
# update libselinux. see https://github.com/sequenceiq/hadoop-docker/issues/14
RUN yum update -y libselinux

# passwordless ssh with given keys
RUN mkdir /root/.ssh
COPY id_rsa /root/.ssh
COPY id_rsa.pub /root/.ssh
COPY id_rsa.pub /root/.ssh/authorized_keys

# Installs Java 7
RUN curl -LO 'http://download.oracle.com/otn-pub/java/jdk/7u51-b13/jdk-7u51-linux-x64.rpm' \
    -H 'Cookie: oraclelicense=accept-securebackup-cookie'
RUN rpm -i jdk-7u51-linux-x64.rpm
RUN rm jdk-7u51-linux-x64.rpm

ENV JAVA_HOME /usr/java/default
ENV PATH ${PATH}:${JAVA_HOME}/bin:${HADOOP_PREFIX}/bin:${HADOOP_PREFIX}/sbin

# Installs Hadoop
RUN curl -s http://www.eu.apache.org/dist/hadoop/common/hadoop-2.6.0/hadoop-2.6.0.tar.gz | tar -xz -C /usr/local/
RUN cd /usr/local && ln -s ./hadoop-2.6.0 hadoop

ENV HADOOP_PREFIX /usr/local/hadoop
ENV HADOOP_COMMON_HOME /usr/local/hadoop
ENV HADOOP_HDFS_HOME /usr/local/hadoop
ENV HADOOP_MAPRED_HOME /usr/local/hadoop
ENV HADOOP_YARN_HOME /usr/local/hadoop
ENV HADOOP_CONF_DIR /usr/local/hadoop/etc/hadoop
ENV YARN_CONF_DIR ${HADOOP_PREFIX}/etc/hadoop

RUN sed -i '/^export JAVA_HOME/ s:.*:export JAVA_HOME=/usr/java/default\nexport \
    HADOOP_PREFIX=/usr/local/hadoop\nexport HADOOP_HOME=/usr/local/hadoop\n:' \
    ${HADOOP_PREFIX}/etc/hadoop/hadoop-env.sh
RUN sed -i '/^export HADOOP_CONF_DIR/ s:.*:export HADOOP_CONF_DIR=/usr/local/hadoop/etc/hadoop/:' \
    ${HADOOP_PREFIX}/etc/hadoop/hadoop-env.sh
#RUN . ${HADOOP_PREFIX}/etc/hadoop/hadoop-env.sh

RUN mkdir ${HADOOP_PREFIX}/input
RUN cp ${HADOOP_PREFIX}/etc/hadoop/*.xml ${HADOOP_PREFIX}/input

# FIXME: Pseudo distributed
ADD core-site.xml.template ${HADOOP_PREFIX}/etc/hadoop/core-site.xml.template
RUN sed s/HOSTNAME/`hostname`/ /usr/local/hadoop/etc/hadoop/core-site.xml.template \
    > /usr/local/hadoop/etc/hadoop/core-site.xml
ADD hdfs-site.xml ${HADOOP_PREFIX}/etc/hadoop/hdfs-site.xml

ADD mapred-site.xml ${HADOOP_PREFIX}/etc/hadoop/mapred-site.xml
ADD yarn-site.xml ${HADOOP_PREFIX}/etc/hadoop/yarn-site.xml

RUN ${HADOOP_PREFIX}/bin/hdfs namenode -format

# Fixing the libhadoop.so
RUN rm  /usr/local/hadoop/lib/native/*
RUN curl -Ls http://dl.bintray.com/sequenceiq/sequenceiq-bin/hadoop-native-64-2.6.0.tar | \
    tar -x -C /usr/local/hadoop/lib/native/

ADD ssh_config /root/.ssh/config
RUN chmod 600 /root/.ssh/config
RUN chown root:root /root/.ssh/config

ADD bootstrap.sh /etc/bootstrap.sh
RUN chown root:root /etc/bootstrap.sh
RUN chmod 700 /etc/bootstrap.sh

ENV BOOTSTRAP /etc/bootstrap.sh

# Work-around Docker.io build error
RUN ls -la /usr/local/hadoop/etc/hadoop/*-env.sh
RUN chmod +x /usr/local/hadoop/etc/hadoop/*-env.sh
RUN ls -la /usr/local/hadoop/etc/hadoop/*-env.sh

# Fixes the 254 error code
RUN sed  -i "/^[^#]*UsePAM/ s/.*/#&/"  /etc/ssh/sshd_config
RUN echo "UsePAM no" >> /etc/ssh/sshd_config
RUN echo "Port 2122" >> /etc/ssh/sshd_config
 
RUN service sshd start && \
    ${HADOOP_PREFIX}/etc/hadoop/hadoop-env.sh && \
    start-dfs.sh && \
    hdfs dfs -mkdir -p /user/root && \
    hdfs dfs -put ${HADOOP_PREFIX}/etc/hadoop/ input
#RUN service sshd start 
#RUN ${HADOOP_PREFIX}/etc/hadoop/hadoop-env.sh 
#RUN ${HADOOP_PREFIX}/sbin/start-dfs.sh 
#RUN ${HADOOP_PREFIX}/bin/hdfs dfs -mkdir -p /user/root
#RUN ${HADOOP_PREFIX}/bin/hdfs dfs -put ${HADOOP_PREFIX}/etc/hadoop/ input
#RUN service sshd start && ${HADOOP_PREFIX}/etc/hadoop/hadoop-env.sh && \
#    ${HADOOP_PREFIX}/sbin/start-dfs.sh && ${HADOOP_PREFIX}/bin/hdfs dfs -put ${HADOOP_PREFIX}/etc/hadoop/ input

#CMD ["${HADOOP_PREFIX}/sbin/start-yarn.sh"]

# Starts HDFS dattanode, namenode, and YARN
CMD ["/etc/bootstrap.sh", "-d"]

# NOTE: test
# hadoop jar share/hadoop/mapreduce/hadoop-mapreduce-examples-2.6.0.jar grep input output 'dfs[a-z.]+'
# hdfs dfs -cat output/*

EXPOSE 50020 50090 50070 50010 50075 8031 8032 8033 8040 8042 49707 22 8088 8030 9000