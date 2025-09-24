const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware.authenticateToken, alertController.getAlerts);
router.patch('/:alertId/read', authMiddleware.authenticateToken, alertController.markAsRead);
router.patch('/read-all', authMiddleware.authenticateToken, alertController.markAllAsRead);
router.post('/check', authMiddleware.authenticateToken, alertController.triggerAlertCheck);

module.exports = router;