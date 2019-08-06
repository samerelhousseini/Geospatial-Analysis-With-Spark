# Real-Time Geospatial Analytics and Visualization with Apache Spark Structured Streaming

## Introduction
This code is for a data processing pipeline that implements an End-to-End Real-Time Geospatial Analytics and Visualization multi-component full-stack solution.

## Objective

This multi-component full-stack solution was built as a demo, and a show of capabilities of what could be done with modern open-source technologies, especially Apache Spark. The client is a Department of Transportation, and is interested in visualizing real-time locations of buses and taxis, and would like to know if real-time analytics could be computed using the streaming data, instead of going through the traditional analytics / data warehouse process. 

## Technologies 

Apache Spark Structured Streaming, Apache Kafka, MongoDB Change Streams, Node.js, React, Uber's Deck.gl and React-Vis, and using the Massachusetts Bay Transportation Authority's (MBTA) APIs.


## Data Source

In this instance, I chose the MBTA to be the data source, but GTFS-Realtime data sources could be used as well. You can click [here](https://api-v3.mbta.com/) to get an API Access Key, and the service overview and documentation could be found [here](https://www.mbta.com/developers/v3-api).

## Architecture of Data Processing Pipeline 

An architecture diagram would go a long way to explain the data flow in this solution:

![Data Processing Pipeline Architecture](Architecture.png)

## Components

* **Apache Spark:** v2.4.3
* **Apache Kafka:** v2.2.1
* **MongoDB:** v4.0.3
* **Node:** v12.2.0
* **React:** v16.8.6
* **Deck.gl:** v7.1.10
* **React-Vis:** v1.11.7




## Future Work

The following changes could be added to the project, some are easily implemented, others need more work:

* Node doesn't serve the HTML/JS files for now, but code could be easily added to do so
* No security was built-in for communications between 

## Implementation


## License

The contents of this repository are covered under the MIT License.