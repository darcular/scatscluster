#!/usr/bin/env bash

# -----------------------------------------------------------------------------
# Start Script for GeoServer Using tomcat
#
# -----------------------------------------------------------------------------

# Check GEOSERVER_DATA_DIR, use default if not provided
if [ -z ${GEOSERVER_DATA_DIR} ]; then
    if [ ! -r ${GEOSERVER_HOME}/data ]; then
        mkdir -p ${GEOSERVER_HOME}/data
    fi
	export GEOSERVER_DATA_DIR=${GEOSERVER_HOME}/data
fi

echo "GEOSERVER DATA DIR is $GEOSERVER_DATA_DIR"
export CATALINA_OPTS="-Xmx8g -Duser.timezone=UTC -server -Djava.awt.headless=true"
catalina.sh run
