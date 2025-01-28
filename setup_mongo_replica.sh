#!/bin/bash

# Define the data directories for each node (Updated for user-accessible paths)
NODE1_DIR="C:/data/db/rs0/node1"
NODE2_DIR="C:/data/db/rs0/node2"
NODE3_DIR="C:/data/db/rs0/node3"

# Create the directories if they do not exist
echo "Checking and creating directories for MongoDB data..."
mkdir -p "$NODE1_DIR" "$NODE2_DIR" "$NODE3_DIR"

# Define the log directories for each node (Updated for user-accessible paths)
NODE1_LOG="C:/data/db/rs0/node1/mongod.log"
NODE2_LOG="C:/data/db/rs0/node2/mongod.log"
NODE3_LOG="C:/data/db/rs0/node3/mongod.log"

# Start MongoDB instances
echo "Starting MongoDB instances..."

# Start Node 1 (Primary)
mongod --port 27017 --dbpath "$NODE1_DIR" --replSet rs0 --bind_ip 127.0.0.1 --logpath "$NODE1_LOG" &
echo "Started MongoDB Node 1 on port 27017"

# Start Node 2 (Secondary)
mongod --port 27018 --dbpath "$NODE2_DIR" --replSet rs0 --bind_ip 127.0.0.1 --logpath "$NODE2_LOG" &
echo "Started MongoDB Node 2 on port 27018"

# Start Node 3 (Secondary)
mongod --port 27019 --dbpath "$NODE3_DIR" --replSet rs0 --bind_ip 127.0.0.1 --logpath "$NODE3_LOG" &
echo "Started MongoDB Node 3 on port 27019"

# Wait for MongoDB instances to initialize
echo "Waiting for MongoDB instances to initialize..."
sleep 5

# Initiate the Replica Set
echo "Initiating the replica set..."
mongosh --eval "rs.initiate()" --port 27017

# Add secondary nodes to the replica set
echo "Adding secondary nodes to the replica set..."
mongosh --eval "rs.add('localhost:27018')" --port 27017
mongosh --eval "rs.add('localhost:27019')" --port 27017

# Display the replica set status
echo "Checking the replica set status..."
mongosh --eval "rs.status()" --port 27017

echo "MongoDB Replica Set setup complete!"

# ! to run the script, open a terminal and run the following command:
# bash setup_mongo_replica.sh
# ! To stop the MongoDB instances, you can use the following command:
# taskkill //F //IM mongod.exe
# To check the status of the MongoDB instances, you can use the following command:
# tasklist | grep mongod

