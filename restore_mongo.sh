#!/bin/bash

# Define the backup directory and the most recent backup folder
BACKUP_DIR="C:/data/db/mongo_backup"

# Find the most recent backup directory
LATEST_BACKUP=$(ls -td "$BACKUP_DIR"/backup_* | head -n 1)

if [ -z "$LATEST_BACKUP" ]; then
    echo "No backups found. Exiting."
    exit 1
fi

# Define the MongoDB host and port
MONGO_HOST="localhost"
MONGO_PORT="27017"

# Restore the backup
echo "Restoring MongoDB from the latest backup located at $LATEST_BACKUP..."
mongorestore --host "$MONGO_HOST" --port "$MONGO_PORT" --dir "$LATEST_BACKUP"

if [ $? -eq 0 ]; then
    echo "MongoDB restore completed successfully."
else
    echo "MongoDB restore failed."
    exit 1
fi
