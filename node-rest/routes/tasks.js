const express = require('express');
const tasksRouter = express.Router();
const { jwtCheck } = require('../auth');
const db = require('../db');

// Protect all /tasks routes
tasksRouter.use(jwtCheck);

// GET /tasks (user: own tasks)
tasksRouter.get('/', async (req, res) => {
  try {
    // Debug logs for inspection
    console.log("req.auth:", req.auth);
    console.log("Query params:", req.query);

    const userId = req.auth.sub;

    const collection = await db.getCollection('tasks');
    const tasks = await collection.find({ userId }).toArray();
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Tasks error', details: err.message });
  }
});


// POST /tasks - Create a new task for the current user
tasksRouter.post('/', async (req, res) => {
  const userId = req.auth.sub;
  const { title, status = "pending" } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Task title is required" });
  }

  const newTask = {
    userId,
    title,
    status,
    createdAt: new Date(),
  };

  try {
    const collection = await db.getCollection('tasks');
    const result = await collection.insertOne(newTask);
    res.status(201).json({ ...newTask, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});


module.exports = tasksRouter;
