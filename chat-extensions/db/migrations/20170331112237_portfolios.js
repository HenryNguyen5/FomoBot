/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

exports.up = (knex, Promise) => {
    return Promise.all([
        knex.schema.createTable('portfolios', (table) => {
            table.increments();
            table.string('title').defaultTo('Crypto-coin portfolio').notNullable();
        }),

        knex.schema.createTable('currencies', (table) => {
            table.increments();
            table.string('name').notNullable();
            //  add CMC based ticker for price lookup
            table.string('ticker').notNullable();
            //  add in intial value for the coin, we can pull day to day data via CMC
            table.decimal('value').notNullable();
            //  denomination of the value
            table.string('valueCurrency').notNullable();
            table.integer('portfolio_id').references('portfolios.id').notNullable();
            table.bigInteger('owner_fb_id').references('users.fb_id').notNullable();
            table.bigInteger('completer_fb_id').references('users.fb_id');
        }),

        knex.schema.createTable('users', (table) => {
            table.increments();
            table.bigInteger('fb_id').unique().notNullable();
        }),

        knex.schema.createTable('users_portfolios', (table) => {
            table.increments();
            table.integer('portfolio_id').references('portfolios.id').notNullable();
            table.bigInteger('user_fb_id').references('users.fb_id').notNullable();
            table.boolean('owner').defaultTo(false).notNullable();
        }),
    ]);
};

exports.down = (knex, Promise) => {
    return Promise.all([
        knex.schema.dropTable('currencies'),
        knex.schema.dropTable('users_portfolios'),
        knex.schema.dropTable('portfolios'),

        knex.schema.dropTable('users'),

    ]);
};