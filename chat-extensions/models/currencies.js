/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */
/* eslint-disable camelcase */

// ===== DB ====================================================================
import Knex from '../db/knex';

// ===== UTIL ==================================================================
import { camelCaseKeys } from './util';

const Currencies = () => Knex('currencies');

/**
 * get - Gets the currency with the given ID.
 * @param   {Number} currencyId - the ID of the currency to return.
 * @returns {Objst} currency - The matching currency object.
 */
export const get = (currencyId) =>
    Currencies()
    .where('id', parseInt(currencyId, 10))
    .first()
    .then(camelCaseKeys);

/**
 * create - Creates a new currency.
 * @param   {String} name - The name of the currency to create.
 * @param   {String} ticker - The ticker of the currency
 * @param   {Number} value - The value in units of that currency
 * @param   {Number} valueCurrency - The currency the value is in
 * @param   {Number} portfolioId - The ID of the portfolio to create the currency for.
 * @param   {Number} ownerFbId - The FB ID of the User who owns the portfolio.
 * @returns {Object} currency - The newly created currency.
 */
export const create = (name = '', ticker, value, valueCurrency, portfolioId, ownerFbId) =>
    Currencies().insert({
        name,
        ticker,
        value,
        valueCurrency,
        portfolio_id: portfolioId,
        owner_fb_id: ownerFbId,
    }, 'id')
    .then((currencyId) => get(currencyId));

/**
 * update - Update a currency with the given values.
 * @param   {Number} options.id - The ID of the currency to update.
 * @param   {String} options.name - The updated name of the currency.
 * @param   {String} options.ticker - The updated ticker of the currency
 * @param   {Number} options.value - The updated value in units of that currency
 * @param   {Number} options.valueCurrency - The updated currency the value is in
 * @param   {Number} options.completerFbId - FB ID of the Completer
 * @returns {Object} currency - the updated currency.
 */
export const update = ({ id, name, ticker, value, valueCurrency, completerFbId }) =>
    Currencies().where('id', parseInt(id, 10)).update({
        completer_fb_id: completerFbId,
        ticker,
        value,
        valueCurrency,
        name,
    }, 'id').then((currencyId) => get(currencyId));

/**
 * del- Delete a currency with the given ID
 * @param {Number} options.id - The ID of the currency to delete.
 * @returns {Null}
 */
export const del = ({ id }) => Currencies()
    .where('id', parseInt(id, 10))
    .del()
    .then((numOfRowsDeleted) => console.log(numOfRowsDeleted));

export default { create, get, update, del };