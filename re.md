Here is the equivalent content for your blog post in **.mdx** format, which allows you to combine Markdown with React components for interactive content. This can be useful if you're building a website using a framework like Next.js with MDX support.

---
title: "Setting Up a MongoDB Replica Set Locally on Windows"
date: "2024-12-06"
author: "Your Name"
---

# Setting Up a MongoDB Replica Set Locally on Windows

In this guide, we will walk through the process of setting up a **MongoDB replica set** on a local machine using Windows. A replica set is a group of MongoDB instances that maintain the same data set, providing redundancy and high availability.

## Prerequisites

- MongoDB installed on your local machine.
- Basic knowledge of MongoDB and its commands.
- PowerShell or Command Prompt on Windows.

## Steps to Set Up the Replica Set

### 1. **Create Directories for MongoDB Data**

Before you start MongoDB instances, you need to create directories for each node's data storage. You can create the necessary directories for the three nodes as follows:

```powershell
mkdir C:\data\rs0\node1
mkdir C:\data\rs0\node2
mkdir C:\data\rs0\node3
```

### 2. **Start MongoDB Instances**

Open **PowerShell** or **Command Prompt** and start three instances of MongoDB with the `--replSet` option. This allows MongoDB to operate in a replica set.

#### **Start the First MongoDB Instance (Primary Node)**

Run the following command in PowerShell or Command Prompt:

```powershell
.\mongod.exe --port 27017 --dbpath C:\data\rs0\node1 --replSet rs0 --bind_ip 127.0.0.1 --logpath C:\data\rs0\node1\mongod.log
```

#### **Start the Second MongoDB Instance (Secondary Node)**

In another terminal window, run the following command:

```powershell
.\mongod.exe --port 27018 --dbpath C:\data\rs0\node2 --replSet rs0 --bind_ip 127.0.0.1 --logpath C:\data\rs0\node2\mongod.log
```

#### **Start the Third MongoDB Instance (Secondary Node)**

In a third terminal window, run:

```powershell
.\mongod.exe --port 27019 --dbpath C:\data\rs0\node3 --replSet rs0 --bind_ip 127.0.0.1 --logpath C:\data\rs0\node3\mongod.log
```

### 3. **Initiate the Replica Set**

Once the MongoDB instances are running, you need to initiate the replica set. To do this, connect to the primary node (port `27017`) using `mongosh` (MongoDB Shell).

Run the following command to start the shell:

```powershell
.\mongosh --port 27017
```

In the MongoDB shell, initiate the replica set:

```js
rs.initiate()
```

### 4. **Add Secondary Nodes to the Replica Set**

Now that the primary node is initialized, add the secondary nodes (running on ports `27018` and `27019`) to the replica set.

```js
rs.add("localhost:27018")
rs.add("localhost:27019")
```

### 5. **Check the Status of the Replica Set**

To verify that the replica set is functioning properly, run the following command in the MongoDB shell:

```js
rs.status()
```

This will display the status of your replica set, showing which node is the primary and which are secondary.

### 6. **Create a Database Connection URL**

With the replica set up, you need to connect your application to MongoDB. For Prisma or any other application, you can use a connection string like the following:

```plaintext
DATABASE_URL="mongodb://localhost:27017,localhost:27018,localhost:27019/mydb?replicaSet=rs0"
```

Replace `mydb` with the name of the database you want to use. This connection string ensures that your application can connect to the replica set.

---

Conclusion
==========

You've successfully set up a MongoDB replica set on your local machine! This setup provides redundancy and high availability for your MongoDB instances. By following these steps, you can ensure that your database is fault-tolerant and can handle fail over scenarios if needed.

If you encounter any issues during the setup or have further questions, feel free to reach out or leave a comment below!

Key MDX Features Used
=====================

1. **YAML Front Matter**: Metadata such as `title`, `date`, and `author` to organize your blog post.
2. **Markdown**: Standard Markdown syntax for formatting text, headings, lists, and code blocks.
3. **Code Blocks**: Use of fenced code blocks (with syntax highlighting) to show commands for setting up MongoDB and adding code snippets.

````markdown
## Customization

If you need any specific customization or further assistance, let me know!