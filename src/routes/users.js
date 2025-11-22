const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

// List all users
router.get('/', usersController.listUsers);

// Get single user
router.get('/:id', usersController.getUserById);

// CREATE USER  ← THIS MUST BE PRESENT
router.post('/', usersController.createUser);

module.exports = router;
