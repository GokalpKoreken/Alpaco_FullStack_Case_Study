const express = require('express');
const router = express.Router();
const { db } = require('../db');

// POST /auth/signup
// Body: { email }
router.post('/signup', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email required' });

  const now = Math.floor(Date.now() / 1000);

  try {
    const insert = db.prepare('INSERT OR IGNORE INTO users(email, created_at) VALUES(?,?)');
    insert.run(email.toLowerCase(), now);
    const user = db.prepare('SELECT id, email, created_at FROM users WHERE email = ?').get(email.toLowerCase());
    return res.status(201).json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
