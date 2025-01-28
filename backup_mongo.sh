#!/bin/bash

# Define the backup directory
BACKUP_DIR="C:/data/db/mongo_backup"
TIMESTAMP=$(date +'%Y%m%d_%H%M%S')

# Create a directory with the timestamp for the backup
BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"
mkdir -p "$BACKUP_PATH"

# Define the MongoDB replica set connection string
MONGO_URI="mongodb://localhost:27017,localhost:27018,localhost:27019/mydb?replicaSet=rs0"

# Take a backup of the MongoDB replica set using mongodump
echo "Starting MongoDB backup..."
mongodump --uri="$MONGO_URI" --out "$BACKUP_PATH"

# Check if the backup was successful
if [ $? -eq 0 ]; then
    echo "Backup completed successfully. Backup stored at $BACKUP_PATH"
else
    echo "Backup failed."
    exit 1
fi
