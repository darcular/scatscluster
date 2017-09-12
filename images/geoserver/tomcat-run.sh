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

export GEOSERVER_DATA_DIR=/mnt/data
if [ ! -d $GEOSERVER_DATA_DIR ]; then
    mkdir -p $GEOSERVER_DATA_DIR
fi
echo "GEOSERVER DATA DIR is $GEOSERVER_DATA_DIR"

export CATALINA_OPTS="$CATALINA_OPTS -Xms4096m"
export CATALINA_OPTS="$CATALINA_OPTS -Xmx10240m"
export CATALINA_OPTS="$CATALINA_OPTS -XX:SoftRefLRUPolicyMSPerMB=36000"
export CATALINA_OPTS="$CATALINA_OPTS -XX:+UseParallelGC"
export CATALINA_OPTS="$CATALINA_OPTS -Duser.timezone=UTC"
export CATALINA_OPTS="$CATALINA_OPTS -Djava.awt.headless=true"
export CATALINA_OPTS="$CATALINA_OPTS -Djava.security.egd=file:/dev/./urandom"

# Fixme: Need a better way to detect if the table in Accumulo is ready to query.
# test the master node only is not enough. Suggest install GeoMesa CLI in this image
# and use it for testing the readiness
#until </dev/tcp/scats-1-master/9999
#do
#  sleep 2s
#done
catalina.sh start

#catalina.sh run

# Keep process alive
tail -f /dev/null & wait ${!}
