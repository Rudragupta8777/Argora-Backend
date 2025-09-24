const Portfolio = require('../models/Portfolio');
const PortfolioService = require('../services/portfolioService');

const portfolioController = {
    async getPortfolio(req, res) {
        try {
            const portfolio = await Portfolio.findOne({ userId: req.user.id });
            
            if (!portfolio) {
                return res.json({
                    success: true,
                    portfolio: null,
                    message: 'No portfolio found'
                });
            }

            const analysis = await PortfolioService.getPortfolioAnalysis(req.user.id);

            res.json({
                success: true,
                portfolio: {
                    holdings: portfolio.holdings,
                    totalValue: portfolio.totalValue,
                    lastUpdated: portfolio.lastUpdated
                },
                analysis: analysis
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch portfolio' });
        }
    },

    async addHolding(req, res) {
        try {
            const { holding } = req.body;
            
            let portfolio = await Portfolio.findOne({ userId: req.user.id });
            
            if (!portfolio) {
                portfolio = new Portfolio({ userId: req.user.id, holdings: [] });
            }

            portfolio.holdings.push({
                ...holding,
                purchaseDate: holding.purchaseDate || new Date()
            });

            await portfolio.save();
            await PortfolioService.updatePortfolioValue(req.user.id);

            res.json({
                success: true,
                message: 'Holding added successfully',
                holding: holding
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to add holding' });
        }
    },

    async updateHolding(req, res) {
        try {
            const { holdingId } = req.params;
            const { updates } = req.body;

            const portfolio = await Portfolio.findOne({ userId: req.user.id });
            if (!portfolio) {
                return res.status(404).json({ error: 'Portfolio not found' });
            }

            const holding = portfolio.holdings.id(holdingId);
            if (!holding) {
                return res.status(404).json({ error: 'Holding not found' });
            }

            Object.assign(holding, updates, { updatedAt: new Date() });
            await portfolio.save();
            await PortfolioService.updatePortfolioValue(req.user.id);

            res.json({
                success: true,
                message: 'Holding updated successfully'
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to update holding' });
        }
    },

    async deleteHolding(req, res) {
        try {
            const { holdingId } = req.params;

            const portfolio = await Portfolio.findOne({ userId: req.user.id });
            if (!portfolio) {
                return res.status(404).json({ error: 'Portfolio not found' });
            }

            portfolio.holdings.id(holdingId).deleteOne();
            await portfolio.save();
            await PortfolioService.updatePortfolioValue(req.user.id);

            res.json({
                success: true,
                message: 'Holding deleted successfully'
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to delete holding' });
        }
    },

    async uploadCSV(req, res) {
        try {
            const { holdings } = req.body;

            // Add a check to prevent crashes
            if (!holdings || !Array.isArray(holdings)) {
                return res.status(400).json({ error: 'Request body must contain a "holdings" array.' });
            }

            let portfolio = await Portfolio.findOne({ userId: req.user.id });
            if (!portfolio) {
                portfolio = new Portfolio({ userId: req.user.id, holdings: [] });
            }

            // Map over the incoming holdings to add a default purchaseDate if it's missing
            const holdingsWithDate = holdings.map(h => ({
                ...h,
                purchaseDate: h.purchaseDate || new Date() 
            }));

            portfolio.holdings.push(...holdingsWithDate);
            await portfolio.save();
            await PortfolioService.updatePortfolioValue(req.user.id);

            res.json({
                success: true,
                message: 'Portfolio uploaded successfully',
                count: holdings.length
            });
        } catch (error) {
            console.error('Upload Portfolio Error:', error); // Log the actual error for better debugging
            res.status(500).json({ error: 'Failed to upload portfolio' });
        }
    }
};

module.exports = portfolioController;