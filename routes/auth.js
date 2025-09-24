const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

router.post('/login', authController.authenticate);
router.get('/profile', authMiddleware.authenticateToken, authController.getProfile);
router.put('/profile', authMiddleware.authenticateToken, authController.updateProfile);

module.exports = router;