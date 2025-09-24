const express = require('express');
const router = express.Router();
const portfolioController = require('../controllers/portfolioController');
const authMiddleware = require('../middleware/auth');
const validationMiddleware = require('../middleware/validation');

router.get('/', authMiddleware.authenticateToken, portfolioController.getPortfolio);
router.post('/holdings', authMiddleware.authenticateToken, validationMiddleware.validateHolding, portfolioController.addHolding);
router.put('/holdings/:holdingId', authMiddleware.authenticateToken, portfolioController.updateHolding);
router.delete('/holdings/:holdingId', authMiddleware.authenticateToken, portfolioController.deleteHolding);
router.post('/upload', authMiddleware.authenticateToken, portfolioController.uploadCSV);

module.exports = router;