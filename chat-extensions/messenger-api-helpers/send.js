/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== LODASH ================================================================
import castArray from 'lodash/castArray';

// ===== MESSENGER =============================================================
import messages from './messages';
import api from './api';

const { APP_URL } = process.env;

// Turns typing indicator on.
const typingOn = (recipientId) => {
    return {
        recipient: {
            id: recipientId,
        },
        sender_action: 'typing_on', // eslint-disable-line camelcase
    };
};

// Turns typing indicator off.
const typingOff = (recipientId) => {
    return {
        recipient: {
            id: recipientId,
        },
        sender_action: 'typing_off', // eslint-disable-line camelcase
    };
};

// Wraps a message JSON object with recipient information.
const messageToJSON = (recipientId, messagePayload) => {
    return {
        recipient: {
            id: recipientId,
        },
        message: messagePayload,
    };
};

// Send one or more messages using the Send API.
const sendMessage = (recipientId, messagePayloads) => {
    const messagePayloadArray = castArray(messagePayloads)
        .map((messagePayload) => messageToJSON(recipientId, messagePayload));

    api.callMessagesAPI([
        typingOn(recipientId),
        ...messagePayloadArray,
        typingOff(recipientId),
    ]);
};

// Send a read receipt to indicate the message has been read
const sendReadReceipt = (recipientId) => {
    const messageData = {
        recipient: {
            id: recipientId,
        },
        sender_action: 'mark_seen', // eslint-disable-line camelcase
    };

    api.callMessagesAPI(messageData);
};

// Send the initial message welcoming & describing the bot.
const sendWelcomeMessage = (recipientId) => {
    sendMessage(recipientId, messages.welcomeMessage(APP_URL));
};

// Let the user know that they don't have any portfolios yet.
const sendNoPortfoliosYet = (recipientId) => {
    sendMessage(recipientId, messages.noPortfoliosMessage(APP_URL));
};

// Show user the portfolios they are associated with.
const sendPortfolios = (recipientId, action, portfolios, offset) => {
    // Show different responses based on number of portfolios.
    switch (portfolios.length) {
        case 0:
            // Tell User they have no portfolios.
            sendNoPortfoliosYet(recipientId);
            break;
        case 1:
            // Show a single portfolio — Portfolio view templates require
            // a minimum of 2 Elements. Read More at:
            // https://developers.facebook.com/docs/
            // messenger-platform/send-api-reference/portfolio-template
            const { id, title } = portfolios[0];

            sendMessage(
                recipientId,
                messages.sharePortfolioMessage(APP_URL, id, title, 'Open Portfolio'),
            );

            break;
        default:
            // Show a paginated set of portfolios — Portfolio view templates require
            // a maximum of 4 Elements. Rease More at:
            // https://developers.facebook.com/docs/
            // messenger-platform/send-api-reference/portfolio-template
            sendMessage(
                recipientId,
                messages.paginatedPortfoliosMessage(APP_URL, action, portfolios, offset)
            );

            break;
    }
};

// Send a message notifying the user their portfolio has been created.
const sendPortfolioCreated = (recipientId, portfolioId, title) => {
    sendMessage(
        recipientId, [
            messages.portfolioCreatedMessage,
            messages.sharePortfolioMessage(APP_URL, portfolioId, title, 'Open Portfolio'),
        ]);
};

export default {
    sendPortfolioCreated,
    sendPortfolios,
    sendMessage,
    sendNoPortfoliosYet,
    sendReadReceipt,
    sendWelcomeMessage,
};