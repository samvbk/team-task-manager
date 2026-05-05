const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const { getUsers } = require('../controllers/user.controller');

const router = express.Router();

router.get('/', authenticate, getUsers);

module.exports = router;
