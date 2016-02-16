# scatscluster

Grunt tasks to define and deploy the cluster used for SCATS traffic data analysis.

## Usage

### List of cluster nodes

`grunt clouddity:listnodes`


## Test of the cluster with SparkR

* Install Spark 1.6.x, set SPARK_HOME environment variable 
* Install R 3.1.x
* Deploy the cluster on NeCTAR
* Set the Spark Master node IP address in the SPARK_MASTER_IP environment variable
* Set the SPARK_LOCAL_IP  environment variable to 127.0.0.1
export SPARK_MASTER_IP=115.146.95.216
export SPARK_LOCAL_IP=127.0.0.1
* Start R, and executes:
library("SparkR", lib.loc=file.path(Sys.getenv("SPARK_HOME"), "R/lib")); 
sc <- sparkR.init(master=paste("spark://", Sys.getenv("SPARK_MASTER_IP"), ":7077", sep=""), appName="TestApp");
sqlContext <- sparkRSQL.init(sc);

