// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/db-test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 AS result');
    res.json(rows[0]);
  } catch (err) {
    console.error('DB ERROR:', err);
    res.status(500).json({ error: err.code || 'DB error' });
  }
});

// minimal create-incident endpoint
app.post('/api/incidents', async (req, res) => {
  const { userId, type, description, latitude, longitude } = req.body;

  if (!userId || !type) {
    return res.status(400).json({ error: 'userId and type are required' });
  }

  try {
    const [result] = await pool.query(
      `INSERT INTO incidents
       (user_id, type, description, latitude, longitude, status)
       VALUES (?, ?, ?, ?, ?, 'NEW')`,
      [userId, type, description || null, latitude || null, longitude || null]
    );

    res.status(201).json({ id: result.insertId });
  } catch (err) {
    console.error('INCIDENT ERROR:', err);
    res.status(500).json({ error: 'could not create incident' });
  }
});

const PORT = process.env.API_PORT || 4000;
app.listen(PORT, () => console.log(`API running on ${PORT}`));
