#
# Adapted from 
# https://github.com/sequenceiq/docker-spark/blob/master/Dockerfile and
# https://hub.docker.com/r/amrabed/hadoop/

FROM ubuntu

# Set environment variables
ENV JAVA_HOME /usr/lib/jvm/java-8-oracle
ENV USER hduser
ENV GROUP hadoop
ENV HOME /home/hduser
ENV HADOOP_BASE /usr/local
ENV HADOOP hadoop
ENV HADOOP_PREFIX ${HADOOP_BASE}/${HADOOP}
ENV HADOOP_COMMON_HOME ${HADOOP_PREFIX}
ENV HADOOP_HDFS_HOME ${HADOOP_PREFIX}
ENV HADOOP_MAPRED_HOME ${HADOOP_PREFIX}
ENV HADOOP_YARN_HOME ${HADOOP_PREFIX}
ENV HADOOP_CONF_DIR ${HADOOP_PREFIX}/etc/hadoop
ENV YARN_CONF_DIR ${HADOOP_CONF_DIR}
ENV SPARK_HOME ${HADOOP_BASE}/spark
ENV PATH ${PATH}:${HADOOP_PREFIX}/bin:${HADOOP_PREFIX}/sbin:${SPARK_HOME}/bin:${HADOOP_PREFIX}/bin
ENV DEBIAN_FRONTEND noninteractive

# Add user and user group for Hadoop
RUN groupadd ${GROUP} && useradd --create-home --gid ${GROUP} ${USER} && mkdir ${HOME}/.ssh

# Install OpenSSH
RUN apt-get install -y openssh-server

# Copy the  Hadoop user SSH keys to allow SSH communications between nodes
COPY id_rsa ${HOME}/.ssh
COPY id_rsa.pub ${HOME}/.ssh
COPY id_rsa.pub ${HOME}/.ssh/authorized_keys

# Disallow host checking
RUN echo 'Host *\n  UserKnownHostsFile /dev/null\n  StrictHostKeyChecking no' > ~/.ssh/config

# Install Oracle java 8
RUN apt-get install -y software-properties-common && \
    add-apt-repository -y ppa:webupd8team/java && \
    apt-get update && \
    echo debconf shared/accepted-oracle-license-v1-1 select true | sudo debconf-set-selections && \
    echo debconf shared/accepted-oracle-license-v1-1 seen true | sudo debconf-set-selections && \
    apt-get install -y oracle-java8-installer 

# Install Hadoop 2.6.0
WORKDIR /usr/local
RUN apt-get install -y curl && \
    curl -s http://www.us.apache.org/dist/hadoop/common/hadoop-2.6.0/hadoop-2.6.0.tar.gz | tar -xz && \
    mv hadoop-2.6.0 hadoop

# Configure Hadoop for running a MapReduce job on YARN in a pseudo-distributed mode
WORKDIR ${HADOOP}
RUN sed -i '/^export JAVA_HOME/ s:.*:export JAVA_HOME=/usr/lib/jvm/java-8-oracle\nexport HADOOP_PREFIX=/usr/local/hadoop\n:' etc/hadoop/hadoop-env.sh && \
    sed -i '/<\/configuration>/i\\t<property>\n\t\t<name>fs.defaultFS<\/name>\n\t\t<value>hdfs://localhost:9000<\/value>\n\t</property>' etc/hadoop/core-site.xml && \
    sed -i '/<\/configuration>/i\\t<property>\n\t\t<name>dfs.replication</name>\n\t\t<value>1</value>\n\t</property>' etc/hadoop/hdfs-site.xml  && \
    sed -i '/<\/configuration>/i\\t<property>\n\t\t<name>yarn.nodemanager.aux-services</name>\n\t\t<value>mapreduce_shuffle</value>\n\t</property>' etc/hadoop/yarn-site.xml && \
    sed '/<\/configuration>/i\\t<property>\n\t\t<name>mapreduce.framework.name</name>\n\t\t<value>yarn</value>\n\t</property>' etc/hadoop/mapred-site.xml.template > etc/hadoop/mapred-site.xml

RUN hdfs namenode -format && \
    service ssh start && \
    start-dfs.sh && \
    hdfs dfs -mkdir -p /user/root && \
    hdfs dfs -put etc/hadoop input

# By default, run a sample MapReduce job on YARN in a pseudo-distributed mode
#CMD service ssh start && \
#    start-dfs.sh && hdfs dfsadmin -safemode leave && \
#    start-yarn.sh && \
#    hadoop jar share/hadoop/mapreduce/hadoop-mapreduce-examples-2.6.0.jar grep input output 'dfs[a-z.]+' && \
#    hdfs dfs -cat output/* && \
#    stop-yarn.sh

# Install Spark for Hadoop 2.6.0
RUN curl -s http://d3kbcqa49mib13.cloudfront.net/spark-1.5.1-bin-hadoop2.6.tgz | tar -xz -C /usr/local/
RUN cd /usr/local && ln -s spark-1.5.1-bin-hadoop2.6 spark
RUN mkdir $SPARK_HOME/yarn-remote-client
ADD yarn-remote-client $SPARK_HOME/yarn-remote-client

RUN $BOOTSTRAP && $HADOOP_PREFIX/bin/hadoop dfsadmin -safemode leave && $HADOOP_PREFIX/bin/hdfs dfs -put $SPARK_HOME-1.5.1-bin-hadoop2.6/lib /spark

# update boot script
COPY bootstrap.sh /etc/bootstrap.sh
RUN chown root.root /etc/bootstrap.sh; chmod 700 /etc/bootstrap.sh

EXPOSE 22 8032 8088 9000 50070

ENTRYPOINT ["/etc/bootstrap.sh"]


