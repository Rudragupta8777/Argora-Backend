const Alert = require('../models/Alert');
const AlertService = require('../services/alertService');

const alertController = {
    async getAlerts(req, res) {
        try {
            const { limit = 20, unreadOnly = false } = req.query;
            
            let query = { userId: req.user.id };
            if (unreadOnly) {
                query.isRead = false;
            }

            const alerts = await Alert.find(query)
                .sort({ createdAt: -1 })
                .limit(parseInt(limit));

            res.json({
                success: true,
                alerts: alerts,
                unreadCount: await Alert.countDocuments({ 
                    userId: req.user.id, 
                    isRead: false 
                })
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch alerts' });
        }
    },

    async markAsRead(req, res) {
        try {
            const { alertId } = req.params;
            
            await Alert.findByIdAndUpdate(alertId, { 
                isRead: true 
            });

            res.json({
                success: true,
                message: 'Alert marked as read'
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update alert' });
        }
    },

    async markAllAsRead(req, res) {
        try {
            await Alert.updateMany(
                { userId: req.user.id, isRead: false },
                { isRead: true }
            );

            res.json({
                success: true,
                message: 'All alerts marked as read'
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update alerts' });
        }
    },

    async triggerAlertCheck(req, res) {
        try {
            const alerts = await AlertService.checkPortfolioAlerts(req.user.id);

            res.json({
                success: true,
                alertsGenerated: alerts.length,
                alerts: alerts
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to check alerts' });
        }
    }
};

module.exports = alertController;