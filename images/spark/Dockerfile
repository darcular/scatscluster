#
# Creates a distributed Spark 1.5.1 Docker image
# It is taken from from https://github.com/sequenceiq/docker-spark, but
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

# Installs Java 8
RUN curl -LO 'http://download.oracle.com/otn-pub/java/jdk/8u73-b02/jdk-8u73-linux-x64.rpm' \
    -H 'Cookie: oraclelicense=accept-securebackup-cookie'

RUN rpm -i jdk-8u73-linux-x64.rpm
RUN rm jdk-8u73-linux-x64.rpm

# Installs Spark
RUN curl -s http://apache.mirror.digitalpacific.com.au/spark/spark-1.6.0/spark-1.6.0-bin-hadoop2.6.tgz | \
    tar -xz -C /usr/local/
RUN cd /usr/local && ln -s ./spark-1.6.0-bin-hadoop2.6 spark

ENV SPARK_PREFIX /usr/local/spark
ENV PATH ${PATH}:${JAVA_HOME}/bin:${SPARK_HOME}/bin:
ENV JAVA_HOME /usr/java/default

# Installs Spark 1.6.0 for Hadoop 2.6.0
RUN curl -s http://apache.mirror.digitalpacific.com.au/spark/spark-1.6.0/spark-1.6.0-bin-hadoop2.6.tgz | \
    tar -xz -C /usr/local/
RUN cd /usr/local && ln -s ./spark-1.6.0-bin-hadoop2.6 spark
RUN mkdir ${SPARK_HOME}/yarn-remote-client
ADD yarn-remote-client ${SPARK_HOME}/yarn-remote-client

# Configures Spark
RUN echo spark.yarn.jar hdfs:///spark/spark-assembly-1.6.0-hadoop2.6.0.jar > ${SPARK_HOME}/conf/spark-defaults.conf
RUN cp ${SPARK_HOME}/conf/metrics.properties.template $SPARK_HOME/conf/metrics.properties

# Update boot script
COPY bootstrap.sh /etc/bootstrap.sh
RUN chown root.root /etc/bootstrap.sh; chmod 700 /etc/bootstrap.sh

EXPOSE 22 8032 8088 9000 50070

ENTRYPOINT ["/etc/bootstrap.sh"]
