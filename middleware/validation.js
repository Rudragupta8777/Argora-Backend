const { body, validationResult } = require('express-validator');

const validationMiddleware = {
    validateHolding: [
        body('holding.assetType').isIn(['stock', 'mutual_fund', 'etf', 'crypto', 'bond', 'fd', 'real_estate', 'gold', 'other']),
        body('holding.name').notEmpty(),
        body('holding.ticker').notEmpty(),
        body('holding.quantity').isFloat({ min: 0 }),
        body('holding.avgBuyPrice').isFloat({ min: 0 }),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            next();
        }
    ],

    validateSimulation: [
        body('scenario').optional().isString(),
        body('parameters').isObject(),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            next();
        }
    ],

    validateMessage: [
        body('message').notEmpty().isLength({ max: 1000 }),
        body('conversationId').optional().isMongoId(),
        (req, res, next) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }
            next();
        }
    ]
};

module.exports = validationMiddleware;