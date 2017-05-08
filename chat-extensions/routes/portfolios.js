/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== MODULES ===============================================================
import express from 'express';

// ===== DB ====================================================================
import Portfolios from '../models/portfolios';

const router = express.Router();

router.get('/:portfolioId', (req, res) => {
    const { hostname } = req;
    const { DEMO, PORT, LOCAL } = process.env;
    const reqId = req.params.portfolioId;
    const socketAddress = (DEMO && LOCAL) ?
        `http://${hostname}:${PORT}` : `wss://${hostname}`;

    if (reqId === 'new') {
        Portfolios.create().then(({ id }) => {
            res.render('./index', { portfolioId: id, socketAddress, demo: DEMO });
        });
    } else {
        res.render('./index', { portfolioId: reqId, socketAddress, demo: DEMO });
    }
});

export default router;