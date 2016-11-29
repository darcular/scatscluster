#
# Creates a SSH Docker image with Java 8 on
#

FROM ubuntu:16.04

# Installs dev tools and Java 8
RUN apt-get update && apt-get install -y software-properties-common python3-software-properties \
  openssh-server openssh-client \
  curl tar sudo telnet net-tools vim openjdk-8-jre unzip
  
ENV JAVA_HOME=/usr/lib/jvm/java-8-openjdk-amd64
ENV PATH ${PATH}:${JAVA_HOME}

COPY sshconf/* /etc/ssh/
COPY dotssh/* /root/.ssh/
RUN chmod -R 600 /etc/ssh && chmod -R 600 /root/.ssh

# Setup local specific information for encoding
RUN locale-gen en_AU.utf8
ENV LANG en_AU.utf8
ENV LANGUAGE en_AU.utf8
ENV LC_ALL en_AU.utf8

ENTRYPOINT service ssh start && tail -f /dev/null

EXPOSE 22

