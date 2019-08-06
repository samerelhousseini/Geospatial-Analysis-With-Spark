const express = require("express");
const app = express();
var cors = require('cors')

const MongoClient = require("mongodb").MongoClient;

app.use(cors());


const uri = "mongodb://165.22.76.188/mbta";
const client = new MongoClient(uri, { useNewUrlParser: true });

var collection = "";

client.connect(err => {
  collection = client.db("mbta").collection("vehicles");
  });



//console.log(vehicles)
app.get(
  "/hello", (req, res) =>{ 
    res.send("hello")
  });



app.get(
  "/", (req, res) => {
    collection.find({ 
      "timestamp" : { 
        $lt: new Date(), 
        $gte: new Date(new Date().getTime()- 300000) 
      }}).toArray((err, items) => {
        console.log(err);
        console.log("Number of vehicles", items.length)
      res.send(items)
  })}

);

const PORT = process.env.PORT || 5000;
app.listen(PORT);
