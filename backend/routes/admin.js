const express = require('express');
const router = express.Router();
const { db } = require('../db');

// NOTE: This simple scaffold uses a naive admin check via ?admin=true query or body flag.
// In real project, replace with proper auth + roles.
function checkAdmin(req, res, next) {
  // Priority: Authorization header (Bearer token using ADMIN_TOKEN env), then query/body flag for convenience.
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : null;
  const envToken = process.env.ADMIN_TOKEN || null;
  const isAdminToken = token && envToken && token === envToken;

  const isAdminFlag = req.query.admin === 'true' || req.body && req.body.admin === true;

  if (!isAdminToken && !isAdminFlag) return res.status(401).json({ error: 'admin_required' });
  next();
}

// POST /admin/drops -> create
router.post('/drops', checkAdmin, (req, res) => {
  const { title, description, is_active } = req.body;
  if (!title) return res.status(400).json({ error: 'title required' });
  const now = Math.floor(Date.now() / 1000);
  try {
    const insert = db.prepare('INSERT INTO drops(title, description, is_active, claim_open, created_at) VALUES(?,?,?,?,?)');
    const info = insert.run(title, description || '', is_active ? 1 : 1, 0, now);
    const drop = db.prepare('SELECT * FROM drops WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ drop });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// PUT /admin/drops/:id -> update
router.put('/drops/:id', checkAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { title, description, is_active, claim_open } = req.body;
  try {
    const upd = db.prepare('UPDATE drops SET title = COALESCE(?, title), description = COALESCE(?, description), is_active = COALESCE(?, is_active), claim_open = COALESCE(?, claim_open) WHERE id = ?');
    const info = upd.run(title, description, typeof is_active === 'boolean' ? (is_active ? 1 : 0) : undefined, typeof claim_open === 'boolean' ? (claim_open ? 1 : 0) : undefined, id);
    if (info.changes === 0) return res.status(404).json({ error: 'drop_not_found' });
    const drop = db.prepare('SELECT * FROM drops WHERE id = ?').get(id);
    res.json({ drop });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// DELETE /admin/drops/:id
router.delete('/drops/:id', checkAdmin, (req, res) => {
  const id = Number(req.params.id);
  try {
    const del = db.prepare('DELETE FROM drops WHERE id = ?');
    const info = del.run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'drop_not_found' });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// GET /admin/drops -> list all drops
router.get('/drops', checkAdmin, (req, res) => {
  try {
    const drops = db.prepare('SELECT * FROM drops ORDER BY created_at DESC').all();
    res.json({ drops });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
