// src/routes/conversations.js
const express = require('express');
const router = express.Router();
const convController = require('../controllers/conversationsController');

// GET /conversations/:userId
router.get('/:userId', convController.getConversationsForUser);

// POST /conversations/:userId/send
router.post('/:userId/send', convController.sendMessageToUser);

module.exports = router;
