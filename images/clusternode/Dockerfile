#
# Creates a SSH, password-less Docker image with Java 8 on
#

FROM ubuntu:14.04

#ENV JAVA_HOME /usr/java/default
ENV JAVA_HOME /usr/lib/jvm/java-8-oracle
ENV PATH ${PATH}:${JAVA_HOME}

# Installs dev tools
RUN apt-get install -y software-properties-common python3-software-properties \
  openssh-server openssh-client \
  curl tar sudo telnet

RUN \
  echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | debconf-set-selections && \
  add-apt-repository -y ppa:webupd8team/java && \
  apt-get update && \
  apt-get install -y oracle-java8-installer && \
  rm -rf /var/lib/apt/lists/* && \
  rm -rf /var/cache/oracle-jdk8-installer

COPY sshconf/* /etc/ssh/
COPY dotssh/* /root/.ssh/
RUN chmod -R 600 /etc/ssh
RUN chmod -R 600 /root/.ssh

ENTRYPOINT service ssh start && bash

EXPOSE 22

