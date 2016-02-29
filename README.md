# scatscluster

Grunt tasks to define and deploy the cluster used for SCATS traffic data analysis.

## Usage

### List of cluster nodes

`grunt clouddity:listnodes`


## Test of the cluster with SparkR

* Install Spark 1.6.x, set SPARK_HOME environment variable 
* Install R 3.1.x
* Deploy the cluster on NeCTAR
* Sets the environment and call the R shell
```
source setip.sh
R
```

* In R, execute:
```
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

```
spark-shell --deploy-mode client --master spark://115.146.93.115:7077 
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

```
export SPARK_LOCAL_IP=${SPARK_MASTER_IP}
/opt/spark-1.6.0-bin-hadoop2.6/bin/spark-submit \
  --master spark://115.146.93.115:6066 \
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
