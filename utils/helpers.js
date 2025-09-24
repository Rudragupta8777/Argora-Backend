const helpers = {
    formatCurrency(amount, currency = 'INR') {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    calculatePercentageChange(oldValue, newValue) {
        if (oldValue === 0) return 0;
        return ((newValue - oldValue) / oldValue) * 100;
    },

    generatePortfolioSummary(metrics) {
        const { totalValue, totalGainLoss, totalGainLossPercent } = metrics;
        
        return {
            totalValue: this.formatCurrency(totalValue),
            gainLoss: this.formatCurrency(totalGainLoss),
            gainLossPercent: totalGainLossPercent.toFixed(2) + '%',
            isPositive: totalGainLoss >= 0
        };
    },

    validateTicker(ticker, assetType) {
        // Basic validation - extend this based on your needs
        const patterns = {
            stock: /^[A-Z]{1,5}(\.[A-Z]{2})?$/,
            crypto: /^[A-Z]{3,10}-[A-Z]{3,10}$/,
            mutual_fund: /^[A-Z0-9]{5,15}$/
        };

        const pattern = patterns[assetType];
        return pattern ? pattern.test(ticker) : true;
    }
};

module.exports = helpers;