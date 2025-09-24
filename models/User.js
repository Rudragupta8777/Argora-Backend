const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    name: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    deadline: { type: Date, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' }
});

const preferenceSchema = new mongoose.Schema({
    riskProfile: { 
        type: String, 
        enum: ['conservative', 'balanced', 'aggressive'], 
        default: 'balanced' 
    },
    alertThreshold: { type: Number, default: 5 }, // percentage
    preferredIndustries: [String],
    excludedIndustries: [String]
});

const userSchema = new mongoose.Schema({
    firebaseUid: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    phone: String,
    dateOfBirth: Date,
    occupation: String,
    annualIncome: Number,
    baseCurrency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    preferences: preferenceSchema,
    goals: [goalSchema],
    financialHealthScore: { type: Number, default: 0 },
    lastAnalysisDate: Date,
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);