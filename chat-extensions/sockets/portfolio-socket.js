/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== DB ====================================================================
import Portfolios from '../models/portfolios';
import PortfoliosItems from '../models/portfolios-items';

// Update the title of the given portfolio and
// notifies all subscribed users of the change.
const updateTitle = ({ request: { portfolioId, title }, sendStatus, socket }) => {
    Portfolios.setTitle(title, portfolioId)
        .then((portfolio) => {
            socket.to(portfolio.id).emit('title:update', portfolio.title);
            sendStatus('ok');
        });
};

// Creates a new portfolioItem and notifies
// all subscribed users of the change.
const addItem = ({
    request: { senderId, portfolioId, name },
    sendStatus,
    allInRoom,
}) => {
    PortfoliosItems.create(name, portfolioId, senderId)
        .then((portfolioItem) => {
            allInRoom(portfolioId).emit('item:add', portfolioItem);
            sendStatus('ok');
        });
};

// Updates an existing portfolioItem and notifies
// all subscribed users of the change.
const updateItem = ({ request, sendStatus, allInRoom }) => {
    const { portfolioId, id, name, completerFbId } = request;
    console.log('request', { portfolioId, id, name, completerFbId });

    PortfoliosItems.update({ id, name, completerFbId })
        .then(({ id, name, completerFbId }) => {
            allInRoom(portfolioId)
                .emit('item:update', { id, name, completerFbId });
            sendStatus('ok');
        });
};

export default {
    addItem,
    updateItem,
    updateTitle,
};