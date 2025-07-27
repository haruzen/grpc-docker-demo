require('dotenv').config();
const { getDb } = require('./db');

(async () => {
  try {
    const db = await getDb();
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
    process.exit(0);
  } catch (e) {
    console.error("Failed to connect or list collections:", e);
    process.exit(1);
  }
})();
