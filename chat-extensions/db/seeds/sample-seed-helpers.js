/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Constants for placeholder portfolio data for seed files.
const PORTFOLIOS = [
    { title: 'BTC portfolio' },
    { title: 'ETH portfolio' },
    { title: 'ALT portfolio' },
];

// Constants for placeholder User data for seed files.
const USERS = [
    { fb_id: 1 },
    { fb_id: 2 },
    { fb_id: 3 },
    { fb_id: 4 },
];

/**
 * getUsersPortfolios - Gets placeholder Usersportfolios data for seed files.
 * @param   {Array} portfolioIds - Array of portfolio IDs.
 * @returns {Array} usersPortfolios - Array of placeholder usersPortfolios data for seeds.
 */
const getUsersPortfolios = (portfolioIds = []) => [
    { portfolio_id: portfolioIds[0], user_fb_id: 1, owner: true },
    { portfolio_id: portfolioIds[0], user_fb_id: 2 },
    { portfolio_id: portfolioIds[0], user_fb_id: 3 },
    { portfolio_id: portfolioIds[1], user_fb_id: 1 },
    { portfolio_id: portfolioIds[1], user_fb_id: 2, owner: true },
    { portfolio_id: portfolioIds[2], user_fb_id: 2, owner: true },
    { portfolio_id: portfolioIds[2], user_fb_id: 3 },
];

/**
 * getCurrencies - Gets placeholder currencies data for seed files.
 * @param   {Array} portfolioIds - Array of portfolio IDs.
 * @returns {Array} currencies - Array of placeholder currencies data for seeds.
 */
const getCurrencies = (portfolioIds = []) => [{
        name: 'BitCoin',
        ticker: 'BTC',
        value: 2500,
        valueCurrency: 'CAD',
        portfolio_id: portfolioIds[0],
        owner_fb_id: 1,
        completer_fb_id: 2,
    },
    {
        name: 'Ethereum',
        ticker: 'ETH',
        value: 126,
        valueCurrency: 'CAD',
        portfolio_id: portfolioIds[0],
        owner_fb_id: 3,
        completer_fb_id: 3,
    },
    {
        name: 'LiteCoin',
        ticker: 'LTC',
        value: 0.02,
        valueCurrency: 'BTC',
        portfolio_id: portfolioIds[0],
        owner_fb_id: 1,
    },
    {
        name: 'BitBay',
        ticker: 'BAY',
        value: 0.015,
        valueCurrency: 'USD',
        portfolio_id: portfolioIds[1],
        owner_fb_id: 1,
        completer_fb_id: 2,
    },
    {
        name: 'Stellar Lumens',
        ticker: 'STR',
        value: 0.34,
        valueCurrency: 'USD',
        portfolio_id: portfolioIds[1],
        owner_fb_id: 2,
    },
    {
        name: 'Ripple',
        ticker: 'XRP',
        value: 0.51,
        valueCurrency: 'CAD',
        portfolio_id: portfolioIds[2],
        owner_fb_id: 2,
    },
    {
        name: 'DogeCoin',
        ticker: 'DOGE',
        value: 0.000129,
        valueCurrency: 'BTC',
        portfolio_id: portfolioIds[2],
        owner_fb_id: 3,
    },
];

module.exports = { getCurrencies, getUsersPortfolios, PORTFOLIOS, USERS };