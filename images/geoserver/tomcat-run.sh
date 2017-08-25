#!/usr/bin/env bash

# -----------------------------------------------------------------------------
# Start Script for GeoServer Using tomcat
#
# -----------------------------------------------------------------------------

pid=0
# SIGTERM-handler
term_handler() {
    echo "term_handler trapped"
    catalina.sh stop
    exit 143; # 128 + 15 -- SIGTERM
}

trap "term_handler" HUP INT QUIT TERM

# Check GEOSERVER_DATA_DIR, use default if not provided
if [ -z ${GEOSERVER_DATA_DIR} ]; then
    if [ ! -r ${GEOSERVER_HOME}/data ]; then
        mkdir -p ${GEOSERVER_HOME}/data
    fi
	export GEOSERVER_DATA_DIR=${GEOSERVER_HOME}/data
fi

echo "GEOSERVER DATA DIR is $GEOSERVER_DATA_DIR"

export CATALINA_OPTS="$CATALINA_OPTS -Xms4096m"
export CATALINA_OPTS="$CATALINA_OPTS -Xmx10240m"
export CATALINA_OPTS="$CATALINA_OPTS -XX:SoftRefLRUPolicyMSPerMB=36000"
export CATALINA_OPTS="$CATALINA_OPTS -XX:+UseParallelGC"
export CATALINA_OPTS="$CATALINA_OPTS -Duser.timezone=UTC"
export CATALINA_OPTS="$CATALINA_OPTS -Djava.awt.headless=true"
export CATALINA_OPTS="$CATALINA_OPTS -Djava.security.egd=file:/dev/./urandom"

catalina.sh start &
#pid="$!"

# Keep process alive
tail -f /dev/null & wait ${!}
