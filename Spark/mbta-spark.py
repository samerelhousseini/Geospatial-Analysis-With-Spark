from pyspark.sql import SparkSession
from pyspark.sql.functions import explode
from pyspark.sql.functions import split
from pyspark.streaming.kafka import KafkaUtils
import pyspark.sql
import json
import geopandas as gpd
import yaml
import pyarrow as pa
import pyarrow.parquet as pq
import geomesa_pyspark
from pyspark.sql.functions import desc , asc
from pyspark.sql.functions import window, last

import time
from timeloop import Timeloop
from datetime import timedelta
from pyspark.sql.functions import window

from pyspark.sql.types import StructField , StructType , StringType , LongType, FloatType,\
                DateType, ShortType, ArrayType, DoubleType, IntegerType
from pyspark.sql.functions import from_json, col, size, concat, lit, array


spark = SparkSession \
    .builder \
    .appName("AppKafka") \
    .config("spark.mongodb.input.uri","mongodb://localhost/")\
    .config("spark.mongodb.output.uri","mongodb://localhost/")\
    .getOrCreate()


sc = spark.sparkContext
sc.setLogLevel("ERROR")

df = spark \
    .readStream \
    .format("kafka") \
    .option("kafka.bootstrap.servers", 'localhost:9092')\
    .option("subscribe", "mbta_msgs").load()

sc = spark.sparkContext
spark.sparkContext.setLogLevel('ERROR')
spark.conf.set("spark.sql.execution.arrow.enabled", "true")
spark.conf.set("spark.sql.shuffle.partitions", 8)
#geomesa_pyspark.init_sql(spark)


try:
  ss
except NameError:
  print("well, it WASN'T defined after all!")
else:
  ss.stop()

def sq(name):
    for s in spark.streams.active:
        if s.name == name:
            s.stop()

try:
    ss
except NameError:
    print("well, it WASN'T defined after all!")
else:
    print("Stopping Stream Query!")
    ss.stop()

try:
    css
except NameError:
    print("well, it WASN'T defined after all!")
else:
    print("Stopping Stream Query!")
    css.stop()
    


valueDf = df.selectExpr('timestamp', 'CAST(value AS STRING)')


second_stage = StructType((
    StructField("id", StringType(), True),
    StructField("type", StringType(), True),
    StructField("attributes", StringType(), True),
    StructField("links", StringType(), True),
    StructField("relationships", StringType(), True)))

first_stage = StructType((
    StructField("event", StringType(), True),
    StructField("data", StringType(), True)))

first_stage_reset = ArrayType(second_stage)


firstStageDf = valueDf.select('timestamp', from_json(col("value"), first_stage))\
                        .withColumnRenamed('jsontostructs(value)', 'proc')

flatFirstStageDf = firstStageDf.selectExpr('timestamp', 'proc.event', 'proc.data') 


resetStageDf  = flatFirstStageDf.where(col('event') == 'reset')
updateStageDf = flatFirstStageDf.where(col('event') == 'update')
removeStageDf = flatFirstStageDf.where(col('event') == 'remove')

secondStageResetDf = resetStageDf.select(col('timestamp'),col('event'),from_json(col("data"),first_stage_reset))\
                                 .withColumnRenamed('jsontostructs(data)', 'proc')\
                                 .withColumn('exploded', explode(col('proc')))\
                                 .select('timestamp', 'event', 'exploded').drop('data')\
                                 .withColumnRenamed('exploded', 'proc')

secondStageUpdateDf = updateStageDf.select(col('timestamp'), col('event'), from_json(col("data"), second_stage))\
                                 .withColumnRenamed('jsontostructs(data)', 'proc')

secondStageRemoveDf = updateStageDf.select(col('timestamp'), col('event'), from_json(col("data"), second_stage))\
                                 .withColumnRenamed('jsontostructs(data)', 'proc')

secondStageDf = secondStageResetDf.union(secondStageUpdateDf).union(secondStageRemoveDf)


flatSecondStageDf = secondStageDf.selectExpr('timestamp', 'event', 
                                             'proc.id as _id', 'proc.type', 'proc.attributes', 
                                             'proc.links', 'proc.relationships') 

third_stage_attr = StructType((
    StructField("bearing", DoubleType(), True),
     StructField("current_status", StringType(), True),
     StructField("current_stop_sequence", IntegerType(), True),
     StructField("label", StringType(), True),
     StructField("latitude", DoubleType(), True),
     StructField("longitude", DoubleType(), True),
     StructField("speed", DoubleType(), True),
    StructField("updated_at", DateType(), True)))

third_stage_rel = StructType((
    StructField("route", StringType(), True),
    StructField("stop", StringType(), True),
    StructField("trip", StringType(), True)))


thirdStageDf = flatSecondStageDf.select(col('timestamp'), col('event'), col('_id'), col('type'),
                                       from_json(col('attributes'), third_stage_attr),
                                       from_json(col("relationships"), third_stage_rel))\
            .withColumnRenamed('jsontostructs(attributes)', 'attrs')\
            .withColumnRenamed('jsontostructs(relationships)', 'rels')

flatThirdStageDf = thirdStageDf.selectExpr('timestamp', 'event', '_id', 'type', 
                                           'attrs.bearing', 'attrs.current_status',
                                           'attrs.current_stop_sequence', 'attrs.label', 'attrs.latitude',
                                           'attrs.longitude', 'attrs.speed', 'attrs.updated_at',
                                           'rels.route', 'rels.stop', 'rels.trip')



fourth_stage_data = StructType([
    StructField("data", StringType(), True)])

fourth_stage_id = StructType([
    StructField("id", StringType(), True)])


fourthStageDf = flatThirdStageDf.select('*',
                                        from_json(col('route'), fourth_stage_data),
                                        from_json(col('stop'), fourth_stage_data),
                                        from_json(col('trip'), fourth_stage_data))\
            .withColumnRenamed('jsontostructs(route)', 'routeproc')\
            .withColumnRenamed('jsontostructs(stop)', 'stopproc')\
            .withColumnRenamed('jsontostructs(trip)', 'tripproc')\
            .drop('route').drop('stop').drop('trip')


flatFourthStage = fourthStageDf.select('*',
                                        from_json(col('routeproc.data'), fourth_stage_id),
                                        from_json(col('stopproc.data'), fourth_stage_id),
                                        from_json(col('tripproc.data'), fourth_stage_id))\
           .withColumnRenamed('jsontostructs(routeproc.data)', 'route')\
           .withColumnRenamed('jsontostructs(stopproc.data)', 'stop')\
           .withColumnRenamed('jsontostructs(tripproc.data)', 'trip')\
           .drop('routeproc').drop('stopproc').drop('tripproc')




finalFourthStage = flatFourthStage.selectExpr('timestamp', 'event', '_id', 'type', 'bearing', 
                                          'current_status', 'current_stop_sequence', 'label',
                                          'latitude', 'longitude', 'speed',
                                          'updated_at', 'route.id as route', 
                                          'stop.id as stop', 'trip.id as trip')\
                                  .withColumn('coordinates', array(col("longitude"), col("latitude")))



finalStage = finalFourthStage.select(col('timestamp'), col('event'), col('_id'), col('type'), 
                                     col('bearing'), 
                                     col('current_status'), col('current_stop_sequence'), 
                                     col('label'),
                                     col('latitude'), col('longitude'), col('coordinates'), 
                                     col('speed'),
                                     col('updated_at'), col('route'), 
                                     col('stop'), col('trip'))



def foreach_batch_function(dfb, epoch_id):
    dfb.write.format("com.mongodb.spark.sql.DefaultSource")\
        .mode("append")\
        .option("database","mbta")\
        .option("collection", "vehicles").save()
  
mss = finalStage.writeStream.outputMode("update").foreachBatch(foreach_batch_function).start() 

csss = finalStage.groupBy('current_status', window(col("timestamp"),"30 seconds", "15 seconds"))\
  .count()\
  .withColumnRenamed('current_status', '_id')\
  .writeStream\
  .queryName('mbta_msgs_stats')\
  .outputMode("complete")\
   .format("memory")\
   .start()


tl = Timeloop()

@tl.job(interval=timedelta(seconds=15))
def print_stats():
    df = spark.sql("""select * from mbta_msgs_stats 
                      where window = (select last(window) from 
                            (select * from mbta_msgs_stats where window.end < CURRENT_TIMESTAMP order by window))""")
    df.write.format("com.mongodb.spark.sql.DefaultSource")\
        .mode("append")\
        .option("database","mbta")\
        .option("collection", "event_stats").save()
    

tl.start(block=True)



mss.awaitTermination()