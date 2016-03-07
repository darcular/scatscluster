export SPARK_LOCAL_IP=`hostname -I | cut -f 1 -d\ `
export SPARK_PUBLIC_DNS=${SPARK_LOCAL_IP}

# FIXME: thid depends on the name of the cluster
export SPARK_MASTER_IP=scats-1-master

export STANDALONE_SPARK_MASTER_HOST=${SPARK_MASTER_IP}
export SPARK_DRIVER_IP=${SPARK_MASTER_IP}

