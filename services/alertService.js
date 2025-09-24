const Alert = require('../models/Alert');
const PortfolioService = require('./portfolioService');
const AIService = require('./aiService');

class AlertService {
    async checkPortfolioAlerts(userId) {
        try {
            const analysis = await PortfolioService.getPortfolioAnalysis(userId);
            const alerts = [];

            // Check for significant changes
            const significantChanges = await this.checkSignificantChanges(userId, analysis);
            alerts.push(...significantChanges);

            // Check for anomalies
            const anomalies = await this.checkAnomalies(userId, analysis);
            alerts.push(...anomalies);

            // Check goal progress
            const goalAlerts = await this.checkGoalAlerts(userId, analysis);
            alerts.push(...goalAlerts);

            // Save alerts to database
            if (alerts.length > 0) {
                await Alert.insertMany(alerts.map(alert => ({ ...alert, userId })));
            }

            return alerts;
        } catch (error) {
            throw error;
        }
    }

    async checkSignificantChanges(userId, currentAnalysis) {
        const alerts = [];
        // FOR TESTING: We will always create one sample alert

        alerts.push({
            type: 'health_score_change',
            severity: 'medium',
            title: 'Test: Health Score Dropped',
            message: 'This is a sample alert generated for testing purposes.',
            relatedMetric: 'health_score',
            oldValue: 80,
            newValue: 75,
            changePercent: -5
        });

        console.log('Forcing the creation of a test alert.');
        return alerts;
    }

    async checkAnomalies(userId, analysis) {
        try {
            const portfolio = await Portfolio.findOne({ userId });
            const historicalData = await this.getHistoricalData(userId);

            const anomalies = await AIService.detectAnomalies(
                portfolio.holdings, 
                historicalData
            );

            return anomalies.map(anomaly => ({
                type: 'volatility_spike',
                severity: this.mapSeverity(anomaly.confidence),
                title: `Unusual activity detected in ${anomaly.asset}`,
                message: anomaly.description,
                relatedAsset: anomaly.asset,
                metadata: anomaly
            }));
        } catch (error) {
            return [];
        }
    }

    async checkGoalAlerts(userId, analysis) {
        // This would check user's goals against current portfolio state
        // For now, returning empty array
        return [];
    }

    async getPreviousAnalysis(userId) {
        // This would retrieve the previous analysis from database
        // For now, returning null
        return null;
    }

    async getHistoricalData(userId) {
        // This would retrieve historical portfolio data
        // For now, returning empty array
        return [];
    }

    mapSeverity(confidence) {
        if (confidence > 0.8) return 'high';
        if (confidence > 0.6) return 'medium';
        return 'low';
    }
}

module.exports = new AlertService();