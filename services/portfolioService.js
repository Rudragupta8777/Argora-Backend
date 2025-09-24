const Portfolio = require('../models/Portfolio');
const AIService = require('./aiService');
const MarketDataService = require('./marketDataService'); 

class PortfolioService {
    async calculatePortfolioMetrics(portfolio) {
        const holdings = portfolio.holdings;
        
        let totalValue = 0;
        let totalCost = 0;
        let sectorAllocation = {};
        let assetAllocation = {};

        holdings.forEach(holding => {
            const currentValue = holding.quantity * (holding.currentPrice || holding.avgBuyPrice);
            const costValue = holding.quantity * holding.avgBuyPrice;
            
            totalValue += currentValue;
            totalCost += costValue;

            // Sector allocation
            const sector = holding.sector || 'other';
            sectorAllocation[sector] = (sectorAllocation[sector] || 0) + currentValue;

            // Asset type allocation
            assetAllocation[holding.assetType] = (assetAllocation[holding.assetType] || 0) + currentValue;
        });

        const totalGainLoss = totalValue - totalCost;
        const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

        // Normalize allocations to percentages
        Object.keys(sectorAllocation).forEach(sector => {
            sectorAllocation[sector] = (sectorAllocation[sector] / totalValue) * 100;
        });

        Object.keys(assetAllocation).forEach(assetType => {
            assetAllocation[assetType] = (assetAllocation[assetType] / totalValue) * 100;
        });

        return {
            totalValue,
            totalCost,
            totalGainLoss,
            totalGainLossPercent,
            sectorAllocation,
            assetAllocation,
            numberOfHoldings: holdings.length,
            diversificationScore: this.calculateDiversificationScore(sectorAllocation)
        };
    }

    calculateDiversificationScore(sectorAllocation) {
        const sectors = Object.keys(sectorAllocation);
        if (sectors.length === 0) return 0;

        // Calculate entropy-based diversification score
        let entropy = 0;
        sectors.forEach(sector => {
            const weight = sectorAllocation[sector] / 100;
            if (weight > 0) {
                entropy -= weight * Math.log(weight);
            }
        });

        const maxEntropy = Math.log(sectors.length);
        return maxEntropy > 0 ? (entropy / maxEntropy) * 100 : 0;
    }

    async updatePortfolioValue(userId) {
        try {
            const portfolio = await Portfolio.findOne({ userId });
            if (!portfolio) return null;

            const metrics = await this.calculatePortfolioMetrics(portfolio);
            
            // Update portfolio with new values
            portfolio.totalValue = metrics.totalValue;
            portfolio.dailyChange = 0; // This would be calculated from previous day
            portfolio.dailyChangePercent = 0;
            portfolio.lastUpdated = new Date();

            await portfolio.save();
            return { portfolio, metrics };
        } catch (error) {
            throw error;
        }
    }

    async getPortfolioAnalysis(userId) {
        try {
            const portfolio = await Portfolio.findOne({ userId }).populate('userId');
            if (!portfolio || portfolio.holdings.length === 0) {
                 throw new Error('Portfolio not found or is empty');
            }

            // 1. GET LIVE PRICES
            const tickers = portfolio.holdings.map(h => h.ticker);
            const livePrices = await MarketDataService.fetchCurrentPrices(tickers);

            // 2. UPDATE PORTFOLIO IN MEMORY WITH LIVE PRICES
            portfolio.holdings.forEach(holding => {
                if (livePrices[holding.ticker]) {
                    holding.currentPrice = livePrices[holding.ticker];
                }
            });

            // 3. RECALCULATE METRICS WITH LIVE DATA
            const metrics = await this.calculatePortfolioMetrics(portfolio);
            
            // 4. CALL AI WITH COMPLETE, UP-TO-DATE DATA
            const aiAnalysis = await AIService.analyzePortfolio({
                holdings: portfolio.holdings,
                metrics: metrics,
                userRiskProfile: portfolio.userId.preferences.riskProfile
            });

            return {
                basicMetrics: metrics,
                aiAnalysis: aiAnalysis,
                healthScore: this.calculateHealthScore(metrics, aiAnalysis),
                timestamp: new Date()
            };
        } catch (error) {
            throw error;
        }
    }

    calculateHealthScore(metrics, aiAnalysis) {
        // Simple weighted average for health score
        const weights = {
            diversification: 0.3,
            performance: 0.25,
            risk: 0.25,
            liquidity: 0.2
        };

        let score = 0;
        score += metrics.diversificationScore * weights.diversification;
        score += Math.max(0, Math.min(100, 50 + (metrics.totalGainLossPercent * 2))) * weights.performance;
        score += (aiAnalysis.riskScore || 70) * weights.risk;
        score += (aiAnalysis.liquidityScore || 80) * weights.liquidity;

        return Math.round(Math.max(0, Math.min(100, score)));
    }
}

module.exports = new PortfolioService();