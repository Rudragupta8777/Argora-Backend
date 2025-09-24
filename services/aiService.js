const axios = require('axios');

class AIService {
    constructor() {
        this.baseURL = process.env.AI_MODEL_API_URL;
        this.apiKey = process.env.AI_MODEL_API_KEY;
        this.useMock = !this.baseURL; // Use mock if no API URL provided
    }

    async analyzePortfolio(portfolioData, userPreferences) {
        if (this.useMock) {
            return this.mockPortfolioAnalysis(portfolioData, userPreferences);
        }

        try {
            const response = await axios.post(`${this.baseURL}/analyze`, {
                portfolio: portfolioData,
                preferences: userPreferences,
                timestamp: new Date().toISOString()
            }, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            return response.data;
        } catch (error) {
            console.error('AI Analysis Error:', error);
            return this.mockPortfolioAnalysis(portfolioData, userPreferences);
        }
    }

    async generateFinancialAdvice(context, question) {
        if (this.useMock) {
            return this.mockFinancialAdvice(context, question);
        }

        try {
            const response = await axios.post(`${this.baseURL}/advice`, {
                context: context,
                question: question,
                conversation_history: context.conversationHistory || []
            }, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            return response.data;
        } catch (error) {
            console.error('AI Advice Error:', error);
            return this.mockFinancialAdvice(context, question);
        }
    }

    async runSimulation(simulationParams) {
        if (this.useMock) {
            return this.mockSimulation(simulationParams);
        }

        try {
            const response = await axios.post(`${this.baseURL}/simulate`, {
                simulation: simulationParams,
                timestamp: new Date().toISOString()
            }, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            return response.data;
        } catch (error) {
            console.error('AI Simulation Error:', error);
            return this.mockSimulation(simulationParams);
        }
    }

    async detectAnomalies(portfolioData, historicalData) {
        if (this.useMock) {
            return this.mockAnomalyDetection(portfolioData);
        }

        try {
            const response = await axios.post(`${this.baseURL}/anomaly-detection`, {
                current_portfolio: portfolioData,
                historical_data: historicalData,
                timestamp: new Date().toISOString()
            }, {
                headers: { 'Authorization': `Bearer ${this.apiKey}` }
            });
            return response.data;
        } catch (error) {
            console.error('Anomaly Detection Error:', error);
            return this.mockAnomalyDetection(portfolioData);
        }
    }

    // Mock implementations
    mockPortfolioAnalysis(portfolioData, userPreferences) {
        const holdings = portfolioData.holdings || [];
        const totalValue = portfolioData.metrics?.totalValue || 1000000;
        
        return {
            riskScore: Math.floor(Math.random() * 30) + 60, // 60-90
            liquidityScore: Math.floor(Math.random() * 40) + 60, // 60-100
            diversificationScore: Math.floor(Math.random() * 50) + 50, // 50-100
            volatilityForecast: (Math.random() * 20 + 5).toFixed(1), // 5-25%
            sectorAnalysis: this.generateSectorAnalysis(holdings),
            recommendations: this.generateRecommendations(holdings, userPreferences),
            confidence: 0.85 + (Math.random() * 0.1), // 0.85-0.95
            timestamp: new Date().toISOString()
        };
    }

    mockFinancialAdvice(context, question) {
        const responses = {
            'health score': `Your current financial health score is ${context.userProfile?.financialHealthScore || 75}. This is ${context.userProfile?.financialHealthScore > 70 ? 'good' : 'average'}.`,
            'diversification': `Your portfolio diversification is ${context.portfolioSnapshot?.diversification || 65}%. ${context.portfolioSnapshot?.diversification > 70 ? 'Excellent diversification!' : 'Consider adding more asset classes.'}`,
            'what should i do': 'Based on your portfolio, I recommend: 1) Rebalancing your tech holdings, 2) Adding some bonds for stability, 3) Reviewing your emergency fund.',
            'simulation': 'I can help you run simulations. Try asking: "What if I invest in gold?" or "Show me market crash scenario."',
            'default': 'I can help you analyze your portfolio, run simulations, compare with benchmarks, and provide personalized advice. What would you like to know?'
        };

        const lowerQuestion = question.toLowerCase();
        let response = responses.default;

        for (const [key, value] of Object.entries(responses)) {
            if (lowerQuestion.includes(key)) {
                response = value;
                break;
            }
        }

        return {
            response: response,
            analysis: {
                sentiment: Math.random() > 0.5 ? 'positive' : 'neutral',
                keyPoints: ['Good foundation', 'Room for optimization', 'Market conditions favorable'],
                suggestions: ['Review asset allocation', 'Consider tax implications', 'Set up automatic rebalancing']
            },
            suggestions: [
                {
                    type: 'analysis',
                    title: 'Detailed portfolio breakdown',
                    description: 'Get deep insights into each holding'
                }
            ],
            confidence: 0.8 + (Math.random() * 0.15)
        };
    }

    mockSimulation(simulationParams) {
        const baseHealthScore = 75;
        const impact = (Math.random() * 20) - 10; // -10 to +10 change
        
        return {
            healthScore: Math.max(0, Math.min(100, baseHealthScore + impact)),
            riskScore: Math.max(0, Math.min(100, 65 + (Math.random() * 10 - 5))),
            projectedValue: 1000000 * (1 + (Math.random() * 0.3 - 0.1)), // ±10% change
            recommendations: [
                {
                    action: simulationParams.action || 'adjust_allocations',
                    impact: impact > 0 ? 'positive' : 'negative',
                    confidence: 0.7 + (Math.random() * 0.2)
                }
            ],
            metrics: {
                expectedReturn: (Math.random() * 15 + 5).toFixed(1), // 5-20%
                volatility: (Math.random() * 10 + 8).toFixed(1), // 8-18%
                sharpeRatio: (Math.random() * 1 + 0.5).toFixed(2) // 0.5-1.5
            }
        };
    }

    mockAnomalyDetection(portfolioData) {
        // 30% chance of generating a mock anomaly
        if (Math.random() < 0.3) {
            const assets = portfolioData.map(h => h.ticker).filter(Boolean);
            const randomAsset = assets[Math.floor(Math.random() * assets.length)] || 'TCS.NS';
            
            return [{
                asset: randomAsset,
                type: 'price_drop',
                confidence: 0.7 + (Math.random() * 0.2),
                description: `Unusual price movement detected in ${randomAsset}`,
                severity: Math.random() > 0.5 ? 'medium' : 'high'
            }];
        }
        return [];
    }

    generateSectorAnalysis(holdings) {
        const sectors = ['Technology', 'Finance', 'Healthcare', 'Energy', 'Consumer'];
        const analysis = {};
        
        sectors.forEach(sector => {
            analysis[sector] = {
                weight: Math.floor(Math.random() * 30) + 10, // 10-40%
                risk: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
                outlook: ['positive', 'neutral', 'cautious'][Math.floor(Math.random() * 3)]
            };
        });
        
        return analysis;
    }

    generateRecommendations(holdings, userPreferences) {
        return [
            {
                type: 'rebalance',
                priority: 'medium',
                action: 'Consider reducing technology exposure by 5%',
                reason: 'High concentration in volatile sector'
            },
            {
                type: 'diversify',
                priority: 'low',
                action: 'Add international exposure',
                reason: 'Limited geographic diversification'
            }
        ];
    }
}

module.exports = new AIService();