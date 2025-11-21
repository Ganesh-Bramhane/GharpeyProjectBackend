// src/routes/webhooks.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// Simple verification endpoint for WhatsApp webhook (GET)
router.get('/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }

  res.status(403).send('forbidden');
});

// Incoming messages (POST)
router.post('/whatsapp', async (req, res) => {
  try {
    const payload = req.body;

    await db.query(
      `INSERT INTO conversations (user_id, direction, text, raw_payload_json, created_at)
       VALUES (NULL, 'in', ?, ?, NOW())`,
      [JSON.stringify(payload).slice(0, 10000), JSON.stringify(payload)]
    );

    res.json({ status: 'received' });
  } catch (err) {
    console.error('webhook error', err);
    res.status(500).json({ error: 'internal' });
  }
});

module.exports = router;
