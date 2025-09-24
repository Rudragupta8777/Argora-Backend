const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: ['price_drop', 'volatility_spike', 'health_score_change', 'goal_alert', 'rebalance'],
        required: true 
    },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'], required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    relatedAsset: String,
    relatedMetric: String,
    oldValue: Number,
    newValue: Number,
    changePercent: Number,
    isRead: { type: Boolean, default: false },
    actionTaken: { type: Boolean, default: false },
    metadata: mongoose.Schema.Types.Mixed,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alert', alertSchema);