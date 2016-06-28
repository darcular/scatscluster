FROM 115.146.95.30:5000/clusternode:0.3.0

ENV GEOSERVER_VERSION 2.8.4

ENV HADOOP_VERSION=2.6.4
ENV ZOOKEEPER_VERSION=3.4.8
ENV ACCUMULO_VERSION=1.6.5
ENV GEOMESA_VERSION=1.2.3

# Install geoserver
RUN curl -O http://jaist.dl.sourceforge.net/project/geoserver/GeoServer/${GEOSERVER_VERSION}/geoserver-${GEOSERVER_VERSION}-bin.zip \
    && unzip geoserver-${GEOSERVER_VERSION}-bin.zip -d /opt && rm geoserver-${GEOSERVER_VERSION}-bin.zip
RUN cd /opt && ln -s ./geoserver-${GEOSERVER_VERSION} geoserver

ENV GEOSERVER_HOME /opt/geoserver
ENV GEOSERVER_PLUGIN_LIB ${GEOSERVER_HOME}/webapps/geoserver/WEB-INF/lib/

# Install GeoMesa-Accumulo-GeoServer plugin
RUN curl -s http://115.146.95.30/geomesa-1.2.3/dist/gs-plugins/geomesa-accumulo-gs-plugin-1.2.3-install.tar.gz \
    | tar -xz -C ${GEOSERVER_PLUGIN_LIB}

# Install dependencies for hadoop, zookeeper, Accumulo
COPY install-hadoop-accumulo.sh /opt/install-hadoop-accumulo.sh
RUN chmod +x /opt/install-hadoop-accumulo.sh
RUN /opt/install-hadoop-accumulo.sh ${GEOSERVER_PLUGIN_LIB}

ENV PATH $PATH:${GEOSERVER_HOME}/bin
ENTRYPOINT ["startup.sh"]

