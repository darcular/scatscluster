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
* Set thefollowing environment variables:
export SPARK_DRIVER_PORT=7079
export SPARK_HOME=/usr/local/spark
export SPARK_LOCAL_IP=127.0.0.1
export  SPARK_MASTER_IP=115.146.95.194

* Start R, and executes:
library("SparkR", lib.loc=file.path(Sys.getenv("SPARK_HOME"), "R/lib")); 
sc <- sparkR.init(master=paste("spark://", Sys.getenv("SPARK_MASTER_IP"), ":7077", sep=""), appName="TestRApp");
sqlContext <- sparkRSQL.init(sc);
lines <- SparkR:::textFile(sc, file.path(Sys.getenv("SPARK_HOME"), "/licenses/LICENSE-scala.txt"))

words <- SparkR:::flatMap(lines,
                 function(line) {
                   strsplit(line, " ")[[1]]
                 })
wordCount <- SparkR:::lapply(words, function(word) { list(word, 1L) })

counts <- SparkR:::reduceByKey(wordCount, "+", 2L)
output <- SparkR:::collect(counts)

for (wordcount in output) {
  cat(wordcount[[1]], ": ", wordcount[[2]], "\n")
}

```
/opt/spark-1.6.0-bin-hadoop2.6/bin/spark-submit \
  --master spark://115.146.93.91:6066 \
  --class org.apache.spark.examples.SparkPi \
  --deploy-mode=cluster \
  --verbose \
  --conf spark.eventLog.enabled=true \
  --conf spark.history.fs.logDirectory=file:///tmp/spark-events/ \
  --conf spark.io.compression.codec=lzf \
  --driver-class-path=/usr/local/spark-1.6.0-bin-hadoop2.6/lib/spark-assembly-1.6.0-hadoop2.6.0.jar \
  /usr/local/spark-1.6.0-bin-hadoop2.6/lib/spark-examples-1.6.0-hadoop2.6.0.jar \
  10
```
