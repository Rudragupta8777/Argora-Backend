const express = require('express');
const router = express.Router();
const simulationController = require('../controllers/simulationController');
const authMiddleware = require('../middleware/auth');

router.post('/what-if', authMiddleware.authenticateToken, simulationController.runWhatIf);
router.get('/templates', authMiddleware.authenticateToken, simulationController.getScenarioTemplates);

module.exports = router;