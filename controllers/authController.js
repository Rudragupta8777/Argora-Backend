const admin = require('../config/firebase');
const User = require('../models/User');

const authController = {
    async authenticate(req, res) {
        try {
            const { idToken } = req.body;
            
            if (!idToken) {
                return res.status(400).json({ error: 'ID token is required' });
            }

            // Verify Firebase token
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            const { uid, email, name } = decodedToken;

            // Find or create user
            let user = await User.findOne({ firebaseUid: uid });
            
            if (!user) {
                user = new User({
                    firebaseUid: uid,
                    email: email,
                    name: name || 'User',
                    preferences: {
                        riskProfile: 'balanced',
                        alertThreshold: 5
                    }
                });
                await user.save();
            }

            // You might want to create a JWT token for your own API
            const token = generateAPIToken(user);

            res.json({
                success: true,
                token,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    preferences: user.preferences
                }
            });

        } catch (error) {
            console.error('Authentication error:', error);
            res.status(401).json({ error: 'Authentication failed' });
        }
    },

    async getProfile(req, res) {
        try {
            const user = await User.findById(req.user.id);
            res.json({
                success: true,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    preferences: user.preferences,
                    goals: user.goals,
                    financialHealthScore: user.financialHealthScore
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    },

    async updateProfile(req, res) {
        try {
            const { preferences, goals } = req.body;
            const user = await User.findByIdAndUpdate(
                req.user.id,
                { 
                    $set: { 
                        preferences: preferences,
                        goals: goals,
                        updatedAt: new Date()
                    } 
                },
                { new: true }
            );

            res.json({
                success: true,
                user: {
                    preferences: user.preferences,
                    goals: user.goals
                }
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update profile' });
        }
    }
};

function generateAPIToken(user) {
    // Implement JWT token generation for your API
    const jwt = require('jsonwebtoken');
    return jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
}

module.exports = authController;