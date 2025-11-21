// src/routes/users.js
const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// GET /users
router.get('/', usersController.listUsers);

// GET /users/:id
router.get('/:id', usersController.getUserById);

module.exports = router;
