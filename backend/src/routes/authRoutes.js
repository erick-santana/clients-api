const express = require('express');
const { login, verifyAuth } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Rota para login (não protegida)
router.post('/login', login);

// Rota para verificar token (protegida)
router.get('/verify', authenticateToken, verifyAuth);

module.exports = router;
