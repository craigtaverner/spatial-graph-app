# spatial-graph-app

A Neo4j Desktop Graph App with Spatial Layout.

_Note: This repo has moved to a private repo location due to the use of some
commercial code from yWorks. If you want access to the code please contact
Neo4j_

## Graph Hack 2018

This app was build for the Graph Hack 2018 _Bussword Bingo_, aiming to use the following buzzwords:

* Graph Apps
* Neo4j Desktop
* Spatial
* React
* APOC
* Graph Algorithms  - routing?
* OpenStreetMap

## Sample data

To demonstrate the capabilities of the app we have included a sample graph.
This is a graph of intersections in New York City and a calculated routing
graph between all intersections. There are known bugs in the routing graph
and the desktop app will help visualize the graph in order to help find and
identify the modeling mistakes.

To import the data copyt the sample app to your database import directory
and run `LOAD CSV`:

    cp data/routingData.csv` $PATH_TO_NEO4J/import

Run the Cypher query in a Neo4j client (browser or cypher-shell):

    LOAD CSV WITH HEADERS FROM 'file:///routingGraph.csv' AS line
    MERGE (a:Routable {location:point({latitude:toFloat(line['p_lat']), longitude:toFloat(line['p_lon'])})})
    MERGE (b:Routable {location:point({latitude:toFloat(line['x_lat']), longitude:toFloat(line['x_lon'])})})
    CREATE (a)-[:ROUTE]->(b);

This query will be faster if you first make an index:

    CREATE INDEX ON :Routable(location);

