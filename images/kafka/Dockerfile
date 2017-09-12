#
# Creates a Kafka image for SMASH
#

FROM 115.146.95.30:5000/clusternode:0.3.0

ENV KAFKA_VERSION 0.11.0.0
ENV SCALA_VERSION 2.11

# Install Tomcat 8
RUN curl -s http://115.146.95.30/kafka/kafka_2.11-0.11.0.0.tgz \
    | tar -xz -C /opt
RUN cd /opt && ln -s ./kafka_2.11-0.11.0.0 kafka
ENV KAFKA_HOME /opt/kafka



ENV PATH ${PATH}:${KAFKA_HOME}/bin


#TODO Add config files instead of default settings


COPY startup.sh /opt/startup.sh
RUN chmod +x /opt/startup.sh

ENTRYPOINT ["/opt/startup.sh"]

