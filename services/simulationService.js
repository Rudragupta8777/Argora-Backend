const AIService = require('./aiService');
const PortfolioService = require('./portfolioService');

class SimulationService {
    async runPortfolioSimulation(userId, simulationParams) {
        try {
            const { action, assetType, amount, ticker, percentage } = simulationParams;

            // Get current portfolio analysis
            const currentAnalysis = await PortfolioService.getPortfolioAnalysis(userId);

            // Prepare simulation data for AI
            const simulationData = {
                currentPortfolio: currentAnalysis,
                simulationType: action,
                parameters: {
                    assetType,
                    amount,
                    ticker,
                    percentage
                },
                // FIXED: Safely access userPreferences with optional chaining
                userPreferences: currentAnalysis.aiAnalysis?.userPreferences 
            };

            // Run simulation through AI
            const simulationResult = await AIService.runSimulation(simulationData);

            return {
                currentState: currentAnalysis,
                simulatedState: simulationResult,
                impactAnalysis: this.calculateImpact(currentAnalysis, simulationResult),
                recommendations: simulationResult.recommendations || []
            };
        } catch (error) {
            throw error;
        }
    }

    calculateImpact(currentState, simulatedState) {
        // FIXED: Corrected the typo from "simulated-State" to "simulatedState"
        return {
            healthScoreChange: simulatedState.healthScore - currentState.healthScore,
            valueChange: simulatedState.projectedValue - currentState.basicMetrics.totalValue,
            riskChange: simulatedState.riskScore - (currentState.aiAnalysis?.riskScore || 0),
            diversificationChange: 0
        };
    }

    async runWhatIfScenario(userId, scenario) {
        const scenarios = {
            'market_crash': { description: 'Market downturn (-20%)', adjustment: -0.2 },
            'market_boom': { description: 'Market growth (+20%)', adjustment: 0.2 },
            'high_inflation': { description: 'High inflation scenario', adjustment: -0.1 },
            'sector_specific': { description: 'Sector-specific event', adjustment: -0.15 }
        };

        const selectedScenario = scenarios[scenario];
        if (!selectedScenario) throw new Error('Invalid scenario');

        return await this.runPortfolioSimulation(userId, {
            action: 'stress_test',
            scenario: selectedScenario
        });
    }
}

module.exports = new SimulationService();