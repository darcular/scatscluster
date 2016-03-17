#
# Creates a SSH Docker image with Java 8 on
#

FROM ubuntu:14.04

# Installs dev tools
RUN apt-get update
RUN apt-get install -y software-properties-common python3-software-properties \
  openssh-server openssh-client \
  curl tar sudo telnet

# installs Java 8
RUN apt-get install -y default-jre-headless
ENV PATH ${PATH}:${JAVA_HOME}

COPY sshconf/* /etc/ssh/
COPY dotssh/* /root/.ssh/
RUN chmod -R 600 /etc/ssh
RUN chmod -R 600 /root/.ssh

ENTRYPOINT service ssh start && tail -f /dev/null

EXPOSE 22

