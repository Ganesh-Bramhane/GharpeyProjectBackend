const express = require('express');
const router = express.Router();
const convController = require('../controllers/conversationsController');

// Get chat history for a phone number
router.get('/:phone', convController.getConversationsForUser);

// Send message to a phone number
router.post('/:phone/send', convController.sendMessageToUser);

module.exports = router;
