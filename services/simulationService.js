const AIService = require('./aiService');
const PortfolioService = require('./portfolioService');

class SimulationService {
    async runPortfolioSimulation(userId, simulationParams) {
        try {
            const simulationData = {
                userId: userId,
                simulationType: simulationParams.action, // e.g., 'stress_test'
                parameters: simulationParams.scenario // e.g., { description: '...', adjustment: -0.2 }
            };

            // Run the simulation through the AI with the simplified data
            const simulationResult = await AIService.runSimulation(simulationData);

            // Fetch the current state AFTER getting the simulation result to build the final response
            const currentAnalysis = await PortfolioService.getPortfolioAnalysis(userId);

            return {
                currentState: currentAnalysis,
                simulatedState: simulationResult,
                impactAnalysis: this.calculateImpact(currentAnalysis, simulationResult),
                recommendations: simulationResult.recommendations || []
            };
        } catch (error) {
            // Add a more detailed log to see what the AI is rejecting
            console.error('Simulation Service Error:', error.response ? error.response.data : error.message);
            throw error;
        }
    }

    calculateImpact(currentState, simulatedState) {
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