const SimulationService = require('../services/simulationService');

const simulationController = {
    async runWhatIf(req, res) {
        try {
            const { scenario, parameters } = req.body;
            const userId = req.user.id;

            let result;
            if (scenario === 'custom') {
                result = await SimulationService.runPortfolioSimulation(userId, parameters);
            } else {
                result = await SimulationService.runWhatIfScenario(userId, scenario);
            }

            res.json({
                success: true,
                scenario: scenario,
                result: result,
                timestamp: new Date()
            });
        } catch (error) {
            res.status(500).json({ error: 'Simulation failed' });
        }
    },

    async getScenarioTemplates(req, res) {
        const templates = {
            market_crash: {
                name: 'Market Crash (-20%)',
                description: 'Simulate a significant market downturn',
                parameters: { adjustment: -0.2 }
            },
            market_boom: {
                name: 'Market Boom (+20%)',
                description: 'Simulate a strong market growth period',
                parameters: { adjustment: 0.2 }
            },
            interest_rate_hike: {
                name: 'Interest Rate Hike',
                description: 'Simulate impact of rising interest rates',
                parameters: { rateIncrease: 0.02 }
            },
            sector_rotation: {
                name: 'Sector Rotation',
                description: 'Simulate money moving between sectors',
                parameters: { fromSector: 'tech', toSector: 'utilities' }
            }
        };

        res.json({
            success: true,
            templates: templates
        });
    }
};

module.exports = simulationController;