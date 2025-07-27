// where you put admin APIs
const express = require('express');
const adminRouter = express.Router();
const { jwtCheck } = require('../auth');
const db = require('../db');
const { isAdmin } = require('../utils');

// Middleware: All routes below require JWT auth
adminRouter.use(jwtCheck); // <--- now all routes below are protected!

adminRouter.get('/', async (req, res) => {
  try {
    // Debug logs for inspection
    console.log("req.auth:", req.auth);
    console.log("Query params:", req.query);

    // Authorization: Check if the current user is an admin
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Admins only' });
    }

    // Parse query params
    const { userId, status, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (userId) filter.userId = userId;
    if (status) filter.status = status;

    // Pagination: skip & limit
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Get collection and run the query
    const collection = await db.getCollection('tasks');
    //console.log('Collection type:', typeof collection, collection); // For debug

    const tasks = await collection
      .find(filter)
      .skip(skip)
      .limit(parseInt(limit, 10))
      .toArray();

    res.json(tasks);
  } catch (err) {
    console.error("ADMIN TASKS ERROR:", err);
    res.status(500).json({
      error: 'Database error',
      details: err.message,
      stack: err.stack,
    });
  }
});

module.exports = adminRouter;
