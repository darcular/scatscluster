FROM 115.146.95.30:5000/clusternode:0.3.0

ENV GEOSERVER_VERSION 2.8.4

ENV HADOOP_VERSION=2.6.4
ENV ZOOKEEPER_VERSION=3.4.8
ENV ACCUMULO_VERSION=1.6.5
ENV GEOMESA_VERSION=1.2.3

# Install Tomcat 8
RUN curl -s http://apache.mirror.serversaustralia.com.au/tomcat/tomcat-8/v8.0.36/bin/apache-tomcat-8.0.36.tar.gz \
    | tar -xz -C /opt
RUN cd /opt && ln -s ./apache-tomcat-8.0.36 tomcat
ENV TOMCAT_HOME /opt/tomcat

# Install GeoServer war into GEOSERVER_HOME and remove un-used tmp fils and webapps
RUN curl -O http://jaist.dl.sourceforge.net/project/geoserver/GeoServer/${GEOSERVER_VERSION}/geoserver-${GEOSERVER_VERSION}-war.zip \
    && unzip geoserver-${GEOSERVER_VERSION}-war.zip geoserver.war \
    && mkdir -p ${TOMCAT_HOME}/webapps/geoserver \
    && unzip -q geoserver.war -d ${TOMCAT_HOME}/webapps/geoserver \
    && rm geoserver-${GEOSERVER_VERSION}-war.zip \
    && rm geoserver.war \
    && rm -r ${TOMCAT_HOME}/webapps/ROOT \
    && rm -r ${TOMCAT_HOME}/webapps/manager \
    && rm -r ${TOMCAT_HOME}/webapps/examples \
    && rm -r ${TOMCAT_HOME}/webapps/docs \
    && rm -r ${TOMCAT_HOME}/webapps/host-manager

ENV PATH ${PATH}:${TOMCAT_HOME}/bin
ENV GEOSERVER_HOME ${TOMCAT_HOME}/webapps/geoserver
ENV GEOSERVER_PLUGIN_LIB ${GEOSERVER_HOME}/WEB-INF/lib/
ENV GEOSERVER_DATA_DIR ${GEOSERVER_HOME}/data

# Install GeoMesa-Accumulo-GeoServer plugin
RUN curl -s http://115.146.95.30/geomesa-${GEOMESA_VERSION}/dist/gs-plugins/geomesa-accumulo-gs-plugin-${GEOMESA_VERSION}-install.tar.gz \
    | tar -xz -C ${GEOSERVER_PLUGIN_LIB}

# Install dependencies for hadoop, zookeeper, Accumulo
COPY install-hadoop-accumulo.sh /opt/install-hadoop-accumulo.sh
RUN chmod +x /opt/install-hadoop-accumulo.sh
RUN /opt/install-hadoop-accumulo.sh ${GEOSERVER_PLUGIN_LIB}

## Install WPS extension
RUN curl -O http://heanet.dl.sourceforge.net/project/geoserver/GeoServer/${GEOSERVER_VERSION}/extensions/geoserver-${GEOSERVER_VERSION}-wps-plugin.zip \
    && unzip geoserver-${GEOSERVER_VERSION}-wps-plugin.zip -d ${GEOSERVER_PLUGIN_LIB} \
    && rm geoserver-${GEOSERVER_VERSION}-wps-plugin.zip

## Install importer extension
RUN curl -O http://tenet.dl.sourceforge.net/project/geoserver/GeoServer/${GEOSERVER_VERSION}/extensions/geoserver-${GEOSERVER_VERSION}-importer-plugin.zip \
    && unzip -n geoserver-${GEOSERVER_VERSION}-importer-plugin.zip -d ${GEOSERVER_PLUGIN_LIB} \
    && rm geoserver-${GEOSERVER_VERSION}-importer-plugin.zip

## Install GeoMesa-Web-Data
#RUN curl -s http://115.146.95.30/geomesa-1.2.3/dist/webservices/geomesa-web-data-1.2.3-install.tar.gz \
#    | tar -xz -C ${GEOSERVER_PLUGIN_LIB}
#
## Install Spark-Geomesa-assemble
#RUN curl -s -O http://115.146.95.30/geomesa-1.2.3/dist/spark/spark-1.2.3-geomesa-assembly.jar \
#    && mv spark-1.2.3-geomesa-assembly.jar ${GEOSERVER_PLUGIN_LIB}

COPY tomcat-run.sh /opt/tomcat-run.sh
RUN chmod +x /opt/tomcat-run.sh

ENTRYPOINT ["/opt/tomcat-run.sh"]

