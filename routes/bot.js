const express = require('express');
const router = express.Router();
const botController = require('../controllers/botController');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');

router.post('/message', authMiddleware.authenticateToken, validationMiddleware.validateMessage, botController.sendMessage);
router.post('/simulate', authMiddleware.authenticateToken, botController.runSimulation);
router.get('/benchmark', authMiddleware.authenticateToken, botController.getBenchmark);
router.get('/conversations', authMiddleware.authenticateToken, botController.getConversations);

module.exports = router;