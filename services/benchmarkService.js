const User = require('../models/User');
const Portfolio = require('../models/Portfolio');
const PortfolioService = require('./portfolioService');

class BenchmarkService {
    async getCommunityBenchmark(userId, metric) {
        try {
            const user = await User.findById(userId);
            const userPortfolio = await Portfolio.findOne({ userId });
            
            if (!userPortfolio) throw new Error('Portfolio not found');

            // Get aggregated community data (anonymized)
            const communityData = await this.getAggregatedCommunityData();
            const userMetrics = await this.calculateUserMetrics(userPortfolio);

            return {
                userScore: userMetrics[metric],
                communityAverage: communityData.averages[metric],
                percentile: this.calculatePercentile(userMetrics[metric], communityData.distribution[metric]),
                benchmark: communityData.benchmarks[metric],
                interpretation: this.getInterpretation(metric, userMetrics[metric], communityData.averages[metric])
            };
        } catch (error) {
            throw error;
        }
    }

    async getAggregatedCommunityData() {
        // This would typically query aggregated data from all users
        // For now, returning mock data
        return {
            averages: {
                healthScore: 65,
                diversification: 60,
                annualReturn: 12.5,
                riskScore: 55
            },
            distribution: {
                healthScore: [40, 50, 60, 65, 70, 75, 80, 85, 90],
                diversification: [30, 40, 50, 60, 65, 70, 75, 80],
                annualReturn: [5, 8, 10, 12, 15, 18, 20, 25],
                riskScore: [40, 45, 50, 55, 60, 65, 70, 75]
            },
            benchmarks: {
                healthScore: 75,
                diversification: 70,
                annualReturn: 15,
                riskScore: 50
            }
        };
    }

    async calculateUserMetrics(portfolio) {
        const metrics = await PortfolioService.calculatePortfolioMetrics(portfolio);
        const analysis = await PortfolioService.getPortfolioAnalysis(portfolio.userId);

        return {
            healthScore: analysis.healthScore,
            diversification: metrics.diversificationScore,
            annualReturn: 12.3, // This would be calculated from historical data
            riskScore: analysis.aiAnalysis?.riskScore || 55
        };
    }

    calculatePercentile(userScore, distribution) {
        const sortedScores = distribution.sort((a, b) => a - b);
        const lowerScores = sortedScores.filter(score => score < userScore).length;
        return Math.round((lowerScores / sortedScores.length) * 100);
    }

    getInterpretation(metric, userScore, average) {
        const difference = userScore - average;
        
        if (difference > 10) return 'excellent';
        if (difference > 5) return 'very good';
        if (difference > -5) return 'average';
        if (difference > -10) return 'below average';
        return 'needs improvement';
    }
}

module.exports = new BenchmarkService();