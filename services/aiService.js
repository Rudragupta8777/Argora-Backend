const axios = require('axios');

class AIService {
    constructor() {
        // Reads the URL directly from your .env file
        this.baseURL = process.env.AI_MODEL_API_URL;
        if (!this.baseURL) {
            // Throw an error on startup if the AI URL is not configured
            throw new Error("AI_MODEL_API_URL is not defined in the .env file. The server cannot start without it.");
        }
    }

    async analyzePortfolio(portfolioData) {
        try {
            console.log(`Sending data to AI for portfolio analysis...`);
            // The user's AI model description mentioned a /query endpoint. 
            // We'll stick to /analyze as per our contract for clarity.
            const response = await axios.post(`${this.baseURL}/analyze`, {
                portfolio: portfolioData
            });
            return response.data;
        } catch (error) {
            console.error('AI Service Error (analyzePortfolio):', error.message);
            // Re-throw the error to be caught by the controller
            throw new Error('The AI analysis service failed to respond.');
        }
    }

    async generateFinancialAdvice(context, question) {
        try {
            console.log(`Sending context to AI for financial advice...`);
            const response = await axios.post(`${this.baseURL}/advice`, {
                context: context,
                question: question
            });
            return response.data;
        } catch (error) {
            console.error('AI Service Error (generateFinancialAdvice):', error.message);
            throw new Error('The AI advice service failed to respond.');
        }
    }

    async askGeneralQuestion(question) {
        try {
            console.log(`Sending general question to AI: "${question}"`);
            // Change the key from "question" to "query"
            const response = await axios.post(`${this.baseURL}/query`, {
                query: question 
            });
            // We'll wrap the AI's response to match the structure of our other advice function.
            return {
                response: response.data.answer || "I'm not sure how to answer that.",
                analysis: null,
                suggestions: [],
                confidence: response.data.confidence || 0.8
            };
        } catch (error) {
            console.error('AI Service Error (askGeneralQuestion):', error.message);
            throw new Error('The AI general query service failed to respond.');
        }
    }

    async runSimulation(simulationParams) {
        try {
            console.log(`Sending data to AI for simulation...`);
            const response = await axios.post(`${this.baseURL}/simulate`, {
                simulation: simulationParams
            });
            return response.data;
        } catch (error) {
            console.error('AI Service Error (runSimulation):', error.message);
            throw new Error('The AI simulation service failed to respond.');
        }
    }

    async detectAnomalies(portfolioData, historicalData) {
        try {
            console.log(`Sending data to AI for anomaly detection...`);
            const response = await axios.post(`${this.baseURL}/anomaly-detection`, {
                current_portfolio: portfolioData,
                historical_data: historicalData
            });
            return response.data;
        } catch (error) {
            console.error('AI Service Error (detectAnomalies):', error.message);
            throw new Error('The AI anomaly detection service failed to respond.');
        }
    }
}

module.exports = new AIService();