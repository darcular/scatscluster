# scatscluster

Grunt tasks to define and deploy the cluster used for SCATS traffic data analysis.

The Docker images contain Spark, R, and the Spark stand-alone cluster manager.


## Usage


### Nodes provisioning

`grunt launch`


### Docker images building and pushing to repository

`grunt build && grunt push`


### List of cluster nodes

`grunt listnodes`

It should show all the nodes defined in the Gruntfile.


### Docker images pulling to the nodes, and Docker containers creation and start

`grunt pull && grunt run`

FIXME: for some reasons, `driver.host` is not set in the `spark-defaults.conf` file,
hence Spark master has to be re-started:
* SSH to the master node
* Open a shell on the Spark Docker container:
`docker exec -ti <spark docker container id> /bin/bash`
* Executes: `shutdown.sh && startup.sh`


## Test of the cluster with SparkR

* SSH to the master node
* Open a shell on the Spark Docker container:
`docker exec -ti <spark docker container id> /bin/bash`
* Executes: `source setip.sh && R`
* Now that you are in R, execute (of course, it is client deploy mode):
```
library("SparkR", lib.loc=file.path(Sys.getenv("SPARK_HOME"), "R/lib")); 
sc <- sparkR.init(master=paste("spark://", Sys.getenv("SPARK_MASTER_IP"), ":", Sys.getenv("SPARK_MASTER_PORT"), sep=""), appName="TestRApp",
sparkEnvir=list(spark.driver.host=Sys.getenv("SPARK_MASTER_IP")));
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

## Test of the cluster with Spark-shell

Self-contained example (of course, it is client deploy mode):

```
source setip.sh
spark-shell --deploy-mode client \
  --master spark://${SPARK_MASTER_IP}:${SPARK_MASTER_PORT} \
  --total-executor-cores 1 \
  --total-executor-cores 1 \
  --properties-file ${SPARK_HOME}/conf/spark-defaults.conf 
```

```
import org.apache.spark.SparkContext._
import org.apache.spark.graphx.{GraphXUtils, PartitionStrategy}
import org.apache.spark.{SparkContext, SparkConf}
import org.apache.spark.graphx.util.GraphGenerators
import java.io.{PrintWriter, FileOutputStream}

var app = "pagerank"
var niter = 10
var numVertices = 1000
var numEPart: Option[Int] = None
var partitionStrategy: Option[PartitionStrategy] = None
var mu: Double = 4.0
var sigma: Double = 1.3
var degFile: String = ""
var seed: Int = -1

println(s"Creating graph...")
val unpartitionedGraph = GraphGenerators.logNormalGraph(sc, numVertices, numEPart.getOrElse(sc.defaultParallelism), mu, sigma, seed)

// Repartition the graph
val graph = partitionStrategy.foldLeft(unpartitionedGraph)(_.partitionBy(_)).cache()
var startTime = System.currentTimeMillis()
val numEdges = graph.edges.count()
println(s"Done creating graph. Num Vertices = $numVertices, Num Edges = $numEdges")

val loadTime = System.currentTimeMillis() - startTime
startTime = System.currentTimeMillis()

println("Running PageRank")
val totalPR = graph.staticPageRank(niter).vertices.map(_._2).sum()
println(s"Total PageRank = $totalPR")

val runTime = System.currentTimeMillis() - startTime

println(s"Num Vertices = $numVertices")
println(s"Num Edges = $numEdges")
println(s"Creation time = ${loadTime/1000.0} seconds")
println(s"Run time = ${runTime/1000.0} seconds")
```

## Test of the cluster with Spark-submit

Spark-submit self-contained example in cluster mode from a client (not the master)
FIXME: this works, except some executors fail for no obvious reason

```
export SPARK_MASTER_IP=xxx.xxx.xxx.xxx
export SPARK_LOCAL_IP=127.0.0.1
export SPARK_DRIVER_IP=${SPARK_MASTER_IP}
export SPARK_DRIVER_PORT=7079
export STANDALONE_SPARK_MASTER_HOST=${SPARK_MASTER_IP}
${SPARK_HOME}/bin/spark-submit \
  --master spark://${SPARK_MASTER_IP}:6066 \
  --class org.apache.spark.examples.SparkPi \
  --deploy-mode=cluster \
  --verbose \
  --driver-class-path=/usr/local/spark-1.6.0-bin-hadoop2.6/lib/spark-assembly-1.6.0-hadoop2.6.0.jar \
  /usr/local/spark-1.6.0-bin-hadoop2.6/lib/spark-examples-1.6.0-hadoop2.6.0.jar \
  10
```

### Nodes deletion (deletes all nodes in the cluster)

`grunt destroy`


