const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema({
    assetType: { 
        type: String, 
        required: true,
        enum: ['stock', 'mutual_fund', 'etf', 'crypto', 'bond', 'fd', 'real_estate', 'gold', 'other']
    },
    name: { type: String, required: true },
    ticker: { type: String, required: true },
    exchange: String,
    quantity: { type: Number, required: true },
    avgBuyPrice: { type: Number, required: true },
    currentPrice: { type: Number, default: 0 },
    purchaseDate: { type: Date, required: true },
    currency: { type: String, default: 'INR' },
    sector: String,
    metadata: mongoose.Schema.Types.Mixed
});

const transactionSchema = new mongoose.Schema({
    type: { type: String, enum: ['buy', 'sell', 'dividend'], required: true },
    ticker: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    fees: { type: Number, default: 0 },
    date: { type: Date, required: true },
    notes: String
});

const portfolioSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    holdings: [holdingSchema],
    transactions: [transactionSchema],
    totalValue: { type: Number, default: 0 },
    dailyChange: { type: Number, default: 0 },
    dailyChangePercent: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Portfolio', portfolioSchema);