// src/controllers/usersController.js
const db = require('../db');

exports.listUsers = async (req, res, next) => {
  try {
    const [rows] = await db.query('SELECT id, name, phone, language_pref AS lang, created_at FROM users ORDER BY id DESC LIMIT 100');
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const userId = Number(req.params.id);
    const [rows] = await db.query('SELECT id, name, phone, language_pref AS lang, meta_json FROM users WHERE id = ?', [userId]);
    if (!rows.length) return res.status(404).json({ error: 'user_not_found' });
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};
