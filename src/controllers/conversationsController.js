// src/controllers/conversationsController.js
const db = require('../db');

// Read messages for a user (latest 200)
exports.getConversationsForUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const [rows] = await db.query(
      `SELECT id, direction, text, raw_payload_json, intent_id, sentiment, created_at 
       FROM conversations WHERE user_id = ? ORDER BY created_at ASC LIMIT 1000`,
      [userId]
    );
    // map to frontend-friendly shape
    const messages = rows.map(r => ({
      id: r.id,
      from: r.direction === 'out' ? 'me' : 'them',
      text: r.text,
      ts: r.created_at,
      raw: r.raw_payload_json,
      intent_id: r.intent_id,
      sentiment: r.sentiment
    }));
    res.json(messages);
  } catch (err) {
    next(err);
  }
};

// Send message to user (store notification + placeholder send logic)
exports.sendMessageToUser = async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    const { text } = req.body;
    if (!text) return res.status(400).json({ error: 'text_required' });

    // store in conversations (direction = out)
    const [result] = await db.query(
      `INSERT INTO conversations (user_id, direction, text, raw_payload_json, created_at) VALUES (?, 'out', ?, ?, NOW())`,
      [userId, text, JSON.stringify({ via: 'api' })]
    );

    const insertId = result.insertId;

    // append to notifications table (simulating outbound send)
    await db.query(
      `INSERT INTO notifications (user_id, workflow_instance_id, channel, channel_payload, status, provider_msg_id, created_at)
       VALUES (?, NULL, 'whatsapp', ?, 'queued', NULL, NOW())`,
      [userId, JSON.stringify({ text })]
    );

    // For now, return the conversation row we just created
    const [rows] = await db.query('SELECT id, text, created_at FROM conversations WHERE id = ?', [insertId]);
    const row = rows[0];

    res.json({
      id: row.id,
      from: 'me',
      text: row.text,
      ts: row.created_at
    });
  } catch (err) {
    next(err);
  }
};
