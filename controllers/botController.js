const Conversation = require('../models/Conversation');
const AIService = require('../services/aiService');
const User = require('../models/User');
const PortfolioService = require('../services/portfolioService');
const SimulationService = require('../services/simulationService');
const BenchmarkService = require('../services/benchmarkService');
const MarketDataService = require('../services/marketDataService');

const botController = {
    async sendMessage(req, res) {
        try {
            const { message, conversationId } = req.body;
            const userId = req.user.id;

            // Get or create conversation
            let conversation;
            if (conversationId) {
                conversation = await Conversation.findById(conversationId);
            } else {
                conversation = new Conversation({
                    userId: userId,
                    messages: [],
                    title: 'New Conversation'
                });
            }

            // Add user message
            conversation.messages.push({
                role: 'user',
                content: message,
                timestamp: new Date()
            });

            // Get context for AI
            // NEW, CORRECTED CODE
            const context = await botController.buildContext(userId, conversation.messages);

            // Get AI response
            const aiResponse = await AIService.generateFinancialAdvice(context, message);

            // Add AI response to conversation
            conversation.messages.push({
                role: 'assistant',
                content: aiResponse.response,
                timestamp: new Date(),
                metadata: {
                    analysis: aiResponse.analysis,
                    suggestions: aiResponse.suggestions,
                    confidence: aiResponse.confidence
                }
            });

            conversation.updatedAt = new Date();
            await conversation.save();

            res.json({
                success: true,
                response: aiResponse.response,
                conversationId: conversation._id,
                metadata: aiResponse.metadata,
                timestamp: new Date()
            });

        } catch (error) {
            console.error('Bot message error:', error);
            res.status(500).json({ error: 'Failed to process message' });
        }
    },

    async runSimulation(req, res) {
        try {
            const { simulationParams } = req.body;
            const userId = req.user.id;

            const result = await SimulationService.runPortfolioSimulation(userId, simulationParams);

            res.json({
                success: true,
                result: result,
                message: 'Simulation completed successfully'
            });
        } catch (error) {
            res.status(500).json({ error: 'Simulation failed' });
        }
    },

    async getBenchmark(req, res) {
        try {
            const { metric } = req.query;
            const userId = req.user.id;

            const benchmark = await BenchmarkService.getCommunityBenchmark(userId, metric);

            res.json({
                success: true,
                benchmark: benchmark,
                metric: metric
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to get benchmark' });
        }
    },

    async getConversations(req, res) {
        try {
            const conversations = await Conversation.find({ 
                userId: req.user.id 
            }).sort({ updatedAt: -1 });

            res.json({
                success: true,
                conversations: conversations.map(conv => ({
                    id: conv._id,
                    title: conv.title,
                    lastMessage: conv.messages[conv.messages.length - 1]?.content,
                    updatedAt: conv.updatedAt
                }))
            });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch conversations' });
        }
    },

    async buildContext(userId, conversationHistory) {
        const portfolioAnalysis = await PortfolioService.getPortfolioAnalysis(userId);
        const user = await User.findById(userId);

        // FETCH DYNAMIC MARKET CONDITIONS
        const marketConditions = await MarketDataService.fetchMarketConditions();

        return {
            userProfile: {
                riskProfile: user.preferences.riskProfile,
                goals: user.goals,
                financialHealthScore: portfolioAnalysis.healthScore
            },
            portfolioSnapshot: {
                totalValue: portfolioAnalysis.basicMetrics.totalValue,
                diversification: portfolioAnalysis.basicMetrics.diversificationScore,
                performance: portfolioAnalysis.basicMetrics.totalGainLossPercent
            },
            // USE THE DYNAMIC DATA HERE
            currentMarketConditions: marketConditions, 
            conversationHistory: conversationHistory.slice(-10)
        };
    }
};

module.exports = botController;