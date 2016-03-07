#!/bin/bash

#
# Script to stop HDFS and YARN
#

$HADOOP_PREFIX/etc/hadoop/hadoop-env.sh

HADOOP_SECURE_DN_USER=hdfs 
$HADOOP_YARN_HOME/sbin/yarn-daemon.sh --config $HADOOP_CONF_DIR stop nodemanager
$HADOOP_PREFIX/sbin/hadoop-daemon.sh --config $HADOOP_CONF_DIR --script hdfs stop datanode

