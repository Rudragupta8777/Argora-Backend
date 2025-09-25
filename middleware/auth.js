const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = {
    authenticateToken: async (req, res, next) => {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Expects "Bearer <YOUR_CUSTOM_TOKEN>"

        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }

        try {
            // Verify the token using your JWT_SECRET
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Attach user info to the request object
            // The decoded object will contain { id: user._id, email: user.email }
            req.user = { id: decoded.id }; 
            
            next();
        } catch (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
    }
};

module.exports = authMiddleware;