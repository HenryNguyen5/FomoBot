/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

const { getCurrencies, getUsersPortfolios, PORTFOLIOS, USERS } =
require('../sample-seed-helpers');

/**
 * Test ENV Seed File - When run with `knex seed:run`, populates
 *                      database with placeholder data.
 */
exports.seed = (knex, Promise) =>
    Promise.all([
        knex('users_portfolios').del(),
        knex('currencies').del(),
        knex('portfolios').del(),
        knex('users').del(),
    ]).then(() =>
        Promise.all([
            knex('portfolios').insert(PORTFOLIOS, 'id'),
            knex('users').insert(USERS, 'id'),
        ]).then((ids) => {
            const portfolioIds = ids[0];

            return Promise.all([
                knex('users_portfolios').insert(getUsersPortfolios(portfolioIds)),
                knex('currencies').insert(getCurrencies(portfolioIds)),
            ]);
        })
    );