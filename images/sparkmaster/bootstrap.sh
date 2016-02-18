export SPARK_LOCAL_IP=`getip.sh sparkmaster` 
export SPARK_PUBLIC_DNS=`getip.sh dockerhost` 
export SPARK_MASTER_IP=`getip.sh sparkmaster` 
start-master.sh