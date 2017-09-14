#
# Creates a SSH Docker image with Java 8 on
#

FROM ubuntu:16.04

# Installs dev tools and Java 8
RUN apt-get update && apt-get install -y software-properties-common python3-software-properties \
  openssh-server openssh-client locales \
  curl tar sudo telnet net-tools vim openjdk-8-jre unzip
  
ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
ENV PATH ${PATH}:${JAVA_HOME}

COPY sshconf/* /etc/ssh/
COPY dotssh/* /root/.ssh/
RUN chmod -R 600 /etc/ssh && chmod -R 600 /root/.ssh

# Setup local specific information for encoding
RUN locale-gen "en_AU.UTF-8"
ENV LANG="en_AU.UTF-8"
ENV LANGUAGE="en_AU:en"
ENV LC_ALL="en_AU.UTF-8"

#
# ================== Install Zookeeper =================
#

ENV ZOOKEEPER_VERSION=3.4.10

# Download zookeeper and place to /opt/zookeeper
RUN curl -s http://apache.mirror.serversaustralia.com.au/zookeeper/zookeeper-${ZOOKEEPER_VERSION}/zookeeper-${ZOOKEEPER_VERSION}.tar.gz \
    | tar -xz -C /opt
RUN cd /opt && ln -s ./zookeeper-${ZOOKEEPER_VERSION} zookeeper

# Set environment for zoopkeeper
ENV ZOOKEEPER_HOME /opt/zookeeper
ENV PATH ${PATH}:${ZOOKEEPER_HOME}/bin
ENV ZOOKEEPER_DATA_DIR=/mnt/zookeeper/data

# Copy setting files into image from project for zookeeper
COPY zookeeper-conf/zoo_sample.cfg ${ZOOKEEPER_HOME}/conf/zoo_sample.cfg
RUN sed -i '/^dataDir=.*/c\dataDir='${ZOOKEEPER_DATA_DIR} ${ZOOKEEPER_HOME}/conf/zoo_sample.cfg
# TODO: redirect zookeeper log base. Data dir can be mounted

ENTRYPOINT service ssh start && tail -f /dev/null

EXPOSE 22

