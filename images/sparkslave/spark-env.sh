SPARK_LOCAL_IP=`grep sparkslave /etc/hosts | head -1 | cut -f 1`
SPARK_PUBLIC_DNS=`grep dockerhost /etc/hosts | cut -f 1`
SPARK_MASTER_IP=`grep scats-1-master /etc/hosts | cut -f 1`
SPARK_WORKER_PORT=7078
SPARK_WORKER_MEMORY=4G
SPARK_MASTER_WEBUI_PORT=8080
SPARK_WORKER_WEBUI_PORT=8081


