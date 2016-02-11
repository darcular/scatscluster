#!/bin/bash

#
# Script to start HDFS and YARN
#

${HADOOP_PREFIX}/etc/hadoop/hadoop-env.sh

rm /tmp/*.pid

# Installs  libraries if any - (resource urls added comma separated to the ACP system variable)
cd ${HADOOP_PREFIX}/share/hadoop/common ; for cp in ${ACP//,/ }; do  echo == $cp; curl -LO $cp ; done; cd -

# Alters the core-site configuration
sed s/HOSTNAME/${HOSTNAME}/ ${HADOOP_PREFIX}/etc/hadoop/core-site.xml.template > ${HADOOP_PREFIX}/etc/hadoop/core-site.xml

# Starts DFS, YARN
service sshd start
start-dfs.sh
start-yarn.sh

if [[ $1 == "-d" ]]; then
  while true; do sleep 1000; done
fi

if [[ $1 == "-bash" ]]; then
  /bin/bash
fi
