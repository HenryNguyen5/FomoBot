/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== DB ====================================================================
import Portfolios from '../models/portfolios';
import Currencies from '../models/currencies';

// Update the title of the given portfolio and
// notifies all subscribed users of the change.
const updateTitle = ({ request, sendStatus, socket }) => {
    const { portfolioId, title } = request;

    Portfolios.setTitle(title, portfolioId)
        .then((portfolio) => {
            socket.to(portfolio.id).emit('title:update', portfolio.title);
            sendStatus('ok');
        });
};

// Creates a new currency and notifies
// all subscribed users of the change.
const addCurrency = ({ request, sendStatus, allInRoom }) => {
    //  destructure the request
    const { senderId, portfolioId, name, ticker, value, valueCurrency } = request;

    Currencies.create(name, ticker, value, valueCurrency, portfolioId, senderId)
        .then((currency) => {
            allInRoom(portfolioId).emit('currency:add', currency);
            sendStatus('ok');
        });
};

// Updates an existing currency and notifies
// all subscribed users of the change.
//  TODO: add the additional parameters
const updateCurrency = ({ request, sendStatus, allInRoom }) => {
    const { portfolioId, id, name, ticker, value, valueCurrency, completerFbId } = request;

    Currencies.update({ id, name, ticker, value, valueCurrency, completerFbId })
        .then((currency) => {
            allInRoom(portfolioId).emit('currency:update', currency);
            sendStatus('ok');
        });
};

// TODO: add delete currency

export default {
    addCurrency,
    updateCurrency,
    updateTitle,
};