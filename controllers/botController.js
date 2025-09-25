const Conversation = require('../models/Conversation');
const AIService = require('../services/aiService');
const User = require('../models/User');
const PortfolioService = require('../services/portfolioService');
const SimulationService = require('../services/simulationService');
const BenchmarkService = require('../services/benchmarkService');
const MarketDataService = require('../services/marketDataService');

function isPortfolioQuery(message) {
    const keywords = [
        'portfolio', 'holding', 'stock', 'investment', 'invest',
        'asset', 'profit', 'loss', 'gain', 'risk', 'diversify', 'my'
    ];
    const lowerCaseMessage = message.toLowerCase();
    return keywords.some(keyword => lowerCaseMessage.includes(keyword));
}

const botController = {
    async sendMessage(req, res) {
        try {
            const { message, conversationId } = req.body;
            const userId = req.user.id;

            let conversation = await Conversation.findById(conversationId);
            if (!conversation) {
                // If no conversationId is provided, find the most recent one or create new
                conversation = await Conversation.findOne({ userId }).sort({ updatedAt: -1 });
                if (!conversation) {
                    conversation = new Conversation({ userId: userId, messages: [], title: message.substring(0, 30) });
                }
            }

            conversation.messages.push({ role: 'user', content: message, timestamp: new Date() });

            let aiResponse;
            // --- THE NEW CLASSIFICATION LOGIC ---
            if (isPortfolioQuery(message)) {
                // It's a portfolio question, build the full context
                console.log("Portfolio-related query detected. Building full context...");
                const context = await botController.buildContext(userId, conversation.messages);
                aiResponse = await AIService.generateFinancialAdvice(context, message);
            } else {
                // It's a general question, use the simple /query endpoint
                console.log("General query detected. Calling simple query endpoint...");
                aiResponse = await AIService.askGeneralQuestion(message);
            }

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

    // ADD THIS NEW FUNCTION
    async getConversationById(req, res) {
        try {
            const { id } = req.params;
            const conversation = await Conversation.findOne({
                _id: id,
                userId: req.user.id // Ensure user can only access their own conversations
            });

            if (!conversation) {
                return res.status(404).json({ error: 'Conversation not found' });
            }

            res.json({ success: true, conversation: conversation });
        } catch (error) {
            console.error('Get Conversation by ID error:', error);
            res.status(500).json({ error: 'Failed to fetch conversation' });
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