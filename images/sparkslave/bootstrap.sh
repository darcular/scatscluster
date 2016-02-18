export SPARK_LOCAL_IP=`getip.sh sparkslave`
export SPARK_PUBLIC_DNS=`getip.sh dockerhost`
export SPARK_MASTER_IP=`getip.sh scats-1-master`
export SPARK_WORKER_IP=`getip.sh dockerhost` 
start-slave.sh spark://${SPARK_MASTER_IP}:${SPARK_MASTER_PORT}
