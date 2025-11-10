const express = require('express');
const router = express.Router();
const { db } = require('../db');
const { customAlphabet } = require('nanoid');

const nano = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ', 8);

// GET /drops -> active drops
router.get('/', (req, res) => {
  try {
    const drops = db.prepare('SELECT id, title, description, is_active, claim_open, created_at FROM drops WHERE is_active = 1').all();
    res.json({ drops });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'internal_error' });
  }
});

// POST /drops/:id/join
router.post('/:id/join', (req, res) => {
  const dropId = Number(req.params.id);
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });

  const now = Math.floor(Date.now() / 1000);

  try {
    const insert = db.prepare('INSERT OR IGNORE INTO waitlist(drop_id, user_id, joined_at, priority_score) VALUES(?,?,?,?)');
    // simple priority_score placeholder: lower is better
    const score = now % 1000;
    const info = insert.run(dropId, user_id, now, score);

    if (info.changes === 0) {
      return res.status(200).json({ ok: true, message: 'already_joined' });
    }

    return res.status(201).json({ ok: true, message: 'joined' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// POST /drops/:id/leave
router.post('/:id/leave', (req, res) => {
  const dropId = Number(req.params.id);
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });

  try {
    const del = db.prepare('DELETE FROM waitlist WHERE drop_id = ? AND user_id = ?');
    const info = del.run(dropId, user_id);
    if (info.changes === 0) return res.status(404).json({ error: 'not_in_waitlist' });
    return res.json({ ok: true, message: 'left' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

// POST /drops/:id/claim
router.post('/:id/claim', (req, res) => {
  const dropId = Number(req.params.id);
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'user_id required' });

  const now = Math.floor(Date.now() / 1000);

  try {
    // check claim window
    const drop = db.prepare('SELECT id, claim_open FROM drops WHERE id = ?').get(dropId);
    if (!drop) return res.status(404).json({ error: 'drop_not_found' });
    if (!drop.claim_open) return res.status(403).json({ error: 'claim_window_closed' });

    // idempotent: if user already has a claim, return it
    const existing = db.prepare('SELECT claim_code, claimed_at FROM claims WHERE drop_id = ? AND user_id = ?').get(dropId, user_id);
    if (existing) return res.json({ ok: true, claim_code: existing.claim_code, claimed_at: existing.claimed_at });

    // determine next eligible: check waitlist ordered by priority_score then joined_at
    const next = db.prepare('SELECT user_id FROM waitlist WHERE drop_id = ? ORDER BY priority_score ASC, joined_at ASC LIMIT 1').get(dropId);
    if (!next) return res.status(409).json({ error: 'no_waitlist' });

    if (next.user_id !== user_id) return res.status(403).json({ error: 'not_your_turn' });

    const claimCode = nano();
    const insert = db.prepare('INSERT INTO claims(drop_id, user_id, claim_code, claimed_at) VALUES(?,?,?,?)');
    insert.run(dropId, user_id, claimCode, now);

    // remove from waitlist
    db.prepare('DELETE FROM waitlist WHERE drop_id = ? AND user_id = ?').run(dropId, user_id);

    return res.json({ ok: true, claim_code: claimCode, claimed_at: now });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'internal_error' });
  }
});

module.exports = router;
