class MarketDataService {
    /**
     * Fetches mock prices for a list of tickers.
     * @param {string[]} tickers - An array of stock tickers.
     * @returns {Promise<Object>} A promise that resolves to an object mapping tickers to prices.
     */
    async fetchCurrentPrices(tickers) {
        console.log(`Fetching mock prices for: ${tickers.join(', ')}`);
        const prices = {};
        tickers.forEach(ticker => {
            // Generate a random-ish price for mock purposes
            prices[ticker] = parseFloat((Math.random() * 3000 + 500).toFixed(2));
        });
        return prices;
    }

    /**
     * Fetches mock market conditions.
     * @returns {Promise<Object>} A promise that resolves to a market conditions object.
     */
    async fetchMarketConditions() {
        console.log('Fetching mock market conditions...');
        const sentiments = ['bullish', 'bearish', 'neutral'];
        const events = [
            'NIFTY 50 hits an all-time high.',
            'RBI announces new interest rate policy.',
            'Global tech stocks see a slight downturn.'
        ];
        return {
            generalSentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
            notableEvents: [events[Math.floor(Math.random() * events.length)]]
        };
    }
}

module.exports = new MarketDataService();