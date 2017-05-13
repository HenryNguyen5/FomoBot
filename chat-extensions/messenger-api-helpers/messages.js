/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable camelcase */
/* eslint-disable max-len */

/*
 * BUTTONS
 *
 * Objects and methods that create objects that represent
 * buttons to be used in various UI elements.
 */

/**
 * Button for opening a specific portfolio in a webview
 *
 * @param {string} portfolioUrl - URL for a specific portfolio.
 * @param {string} buttonText - Text for the action button.
 * @returns {object} -
 *   Message to create a button pointing to the portfolio in a webview.
 */
const openExistingPortfolioButton = (portfolioUrl, buttonText = 'Edit portfolio') => {
    return {
        type: 'web_url',
        title: buttonText,
        url: portfolioUrl,
        messenger_extensions: true,
        webview_height_ratio: 'tall',
    };
};

/**
 * Button for opening a new portfolio in a webview
 *
 * @param {string} apiUri - Hostname of the server.
 * @param {string=} buttonTitle - Button title.
 * @returns {object} -
 *   Message to create a button pointing to the new portfolio form.
 */
const createPortfolioButton = (apiUri, buttonTitle = 'Create a portfolio') => {
    return {
        type: 'web_url',
        url: `${apiUri}/portfolios/new`,
        title: buttonTitle,
        webview_height_ratio: 'tall',
        messenger_extensions: true,
    };
};

/*
 * MESSAGES
 *
 * Objects and methods that create objects that represent
 * messages sent to Messenger users.
 */

/**
 * Message that welcomes the user to the bot
 *
 * @param {string} apiUri - Hostname of the server.
 * @returns {object} - Message with welcome text and a button to start a new portfolio.
 */
const welcomeMessage = (apiUri) => {
    return {
        attachment: {
            type: 'template',
            payload: {
                template_type: 'button',
                text: 'Ready to make a shared portfolio with your friends? Everyone can add currencies, check things off, and stay in sync.',
                buttons: [
                    createPortfolioButton(apiUri),
                ],
            },
        },
    };
};

/**
 * Message for when the user has no portfolios yet.
 *
 * @param {string} apiUri - Hostname of the server.
 * @returns {object} - Message with welcome text and a button to start a new portfolio.
 */
const noPortfoliosMessage = (apiUri) => {
    return {
        attachment: {
            type: 'template',
            payload: {
                template_type: 'button',
                text: 'It looks like you don’t have any portfolios yet. Would you like to create one?',
                buttons: [
                    createPortfolioButton(apiUri),
                ],
            },
        },
    };
};

/**
 * Helper to construct a URI for the desired portfolio
 *
 * @param {string} apiUri -
 *   Base URI for the server.
 *   Because this moduele may be called from the front end, we need to pass it explicitely.
 * @param {int} portfolioId - The portfolio ID.
 * @returns {string} - URI for the required portfolio.
 */
const portfolioUrl = (apiUri, portfolioId) => `${apiUri}/portfolios/${portfolioId}`;

/**
 * A single portfolio for the portfolio template.
 * The name here is to distinguish portfolios and portfolio templates.
 *
 * @param {string} id            - portfolio ID.
 * @param {string} apiUri        - Url of endpoint.
 * @param {string} subscriberIds - Ids of each subscriber.
 * @param {string} title         - portfolio title.
 * @returns {object} - Message with welcome text and a button to start a new portfolio.
 */
const portfolioElement = ({ id, subscriberIds, title }, apiUri) => {
    return {
        title: title,
        subtitle: `Shared with ${[...subscriberIds].length} people`,
        default_action: {
            type: 'web_url',
            url: portfolioUrl(apiUri, id),
            messenger_extensions: true,
            webview_height_ratio: 'tall',
        },
    };
};

/**
 * Messages for a portfolio template of portfolios (meta!), offset by how many
 * "read mores" the user has been through
 *
 * @param {string} apiUri - Hostname of the server.
 * @param {string} action - The postback action
 * @param {Array.<Object>} portfolios - All of the portfolios to be (eventually) displayed.
 * @param {int=} offset - How far through the portfolio we are so far.
 * @returns {object} - Message with welcome text and a button to start a new portfolio.
 */
const paginatedPortfoliosMessage = (apiUri, action, portfolios, offset = 0) => {
    const pageportfolios = portfolios.slice(offset, offset + 4);

    let buttons;
    if (portfolios.length > (offset + 4)) {
        buttons = [{
            title: 'View More',
            type: 'postback',
            payload: `${action}_OFFSET_${offset + 4}`,
        }, ];
    }

    return {
        attachment: {
            type: 'template',
            payload: {
                template_type: 'portfolio',
                top_element_style: 'compact',
                elements: pageportfolios.map((portfolio) => portfolioElement(portfolio, apiUri)),
                buttons,
            },
        },
    };
};

/**
 * Message that informs the user that their portfolio has been created.
 */
const portfolioCreatedMessage = {
    text: 'Your portfolio was created.',
};

/**
 * Message to configure the customized sharing menu in the webview
 *
 * @param {string} apiUri - Application basename
 * @param {string} portfolioId - The ID for portfolio to be shared
 * @param {string} title - Title of the portfolio
 * @param {string} buttonText - Text for the action button.
 * @returns {object} - Message to configure the customized sharing menu.
 */
const sharePortfolioMessage = (apiUri, portfolioId, title, buttonText) => {
    const urlToPortfolio = portfolioUrl(apiUri, portfolioId);
    console.log({ urlToPortfolio });
    return {
        attachment: {
            type: 'template',
            payload: {
                template_type: 'generic',
                elements: [{
                    title: title,
                    image_url: `${apiUri}/media/button-cover.png`,
                    subtitle: 'A shared portfolio from Tasks',
                    default_action: {
                        type: 'web_url',
                        url: urlToPortfolio,
                        messenger_extensions: true,
                    },
                    buttons: [openExistingPortfolioButton(urlToPortfolio, buttonText)],
                }],
            },
        },
    };
};

export default {
    welcomeMessage,
    portfolioCreatedMessage,
    paginatedPortfoliosMessage,
    createPortfolioButton,
    noPortfoliosMessage,
    sharePortfolioMessage,
};