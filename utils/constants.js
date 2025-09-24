module.exports = {
    ASSET_TYPES: ['stock', 'mutual_fund', 'etf', 'crypto', 'bond', 'fd', 'real_estate', 'gold', 'other'],
    RISK_PROFILES: ['conservative', 'balanced', 'aggressive'],
    ALERT_TYPES: ['price_drop', 'volatility_spike', 'health_score_change', 'goal_alert', 'rebalance'],
    ALERT_SEVERITIES: ['low', 'medium', 'high', 'critical'],
    
    HEALTH_SCORE_THRESHOLDS: {
        excellent: 85,
        good: 70,
        fair: 55,
        poor: 40
    },
    
    DEFAULT_PREFERENCES: {
        riskProfile: 'balanced',
        alertThreshold: 5,
        preferredIndustries: [],
        excludedIndustries: []
    }
};