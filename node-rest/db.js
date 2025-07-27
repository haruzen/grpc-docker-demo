// db.js
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/cross-language-microservices';
const dbName = process.env.MONGO_DBNAME || 'cross-language-microservices';

let client;
let db;
let isConnecting = false;

async function connect() {
  // Prevent double-connect
  if (db) return db;
  if (isConnecting) {
    // If already connecting, wait for that to finish (race condition prevention)
    while (isConnecting) {
      await new Promise(resolve => setTimeout(resolve, 20));
    }
    return db;
  }

  isConnecting = true;
  try {
    client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect();
    db = client.db(dbName);
    console.log(`[MongoDB] Connected to database: ${dbName}`);
    return db;
  } catch (err) {
    console.error('[MongoDB] Connection error:', err);
    throw err;
  } finally {
    isConnecting = false;
  }
}

async function getDb() {
  if (db) return db;
  return connect();
}

async function getCollection(name) {
  const database = await getDb();
  return database.collection(name);
}

module.exports = {
  getDb,
  getCollection
};
