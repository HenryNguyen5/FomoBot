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
 * getportfoliosItems - Gets placeholder portfoliosItems data for seed files.
 * @param   {Array} portfolioIds - Array of portfolio IDs.
 * @returns {Array} portfoliosItems - Array of placeholder portfoliosItems data for seeds.
 */
const getPortfoliosItems = (portfolioIds = []) => [
    { name: 'Cheese', portfolio_id: portfolioIds[0], owner_fb_id: 1, completer_fb_id: 2 },
    { name: 'Milk', portfolio_id: portfolioIds[0], owner_fb_id: 3, completer_fb_id: 3 },
    { name: 'Bread', portfolio_id: portfolioIds[0], owner_fb_id: 1 },
    { name: 'Pay Bills', portfolio_id: portfolioIds[1], owner_fb_id: 1, completer_fb_id: 2 },
    { name: 'Call Parents', portfolio_id: portfolioIds[1], owner_fb_id: 2 },
    { name: 'Balloons', portfolio_id: portfolioIds[2], owner_fb_id: 2 },
    { name: 'Invites', portfolio_id: portfolioIds[2], owner_fb_id: 3 },
];

module.exports = { getPortfoliosItems, getUsersPortfolios, PORTFOLIOS, USERS };