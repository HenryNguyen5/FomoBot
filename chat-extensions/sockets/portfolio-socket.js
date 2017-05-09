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
const updateTitle = ({ request: { portfolioId, title }, sendStatus, socket }) => {
    Portfolios.setTitle(title, portfolioId)
        .then((portfolio) => {
            socket.to(portfolio.id).emit('title:update', portfolio.title);
            sendStatus('ok');
        });
};

// Creates a new currency and notifies
// all subscribed users of the change.
const addCurrency = ({
    request: { senderId, currencyId, name },
    sendStatus,
    allInRoom,
}) => {
    Currencies.create(name, currencyId, senderId)
        .then((currency) => {
            allInRoom(currencyId).emit('currency:add', currency);
            sendStatus('ok');
        });
};

// Updates an existing currency and notifies
// all subscribed users of the change.
//  TODO: add the additional parameters
const updateCurrency = ({ request, sendStatus, allInRoom }) => {
    const { currencyId, id, name, completerFbId } = request;
    console.log('request', { currencyId, id, name, completerFbId });

    Currencies.update({ id, name, completerFbId })
        .then(({ id, name, completerFbId }) => {
            allInRoom(currencyId)
                .emit('currency:update', { id, name, completerFbId });
            sendStatus('ok');
        });
};

// TODO: add delete currency

export default {
    addCurrency,
    updateCurrency,
    updateTitle,
};