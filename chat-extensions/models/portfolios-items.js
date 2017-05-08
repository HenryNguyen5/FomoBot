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

const PortfoliosItems = () => Knex('portfolios_items');

/**
 * get - Gets the portfolioItem with the given ID.
 * @param   {Number} portfoliosItemId - the ID of the portfolioItem to return.
 * @returns {Objst} portfoliosItem - The matching portfoliosItem object.
 */
export const get = (portfoliosItemId) =>
    PortfoliosItems()
    .where('id', parseInt(portfoliosItemId, 10))
    .first()
    .then(camelCaseKeys);

/**
 * create - Creates a new portfoliosItem.
 * @param   {String} name - The name of the portfoliosItem to create.
 * @param   {Number} portfolioId - The ID of the portfolio to create the portfoliosItem for.
 * @param   {Number} ownerFbId - The FB ID of the User who owns the portfolio.
 * @returns {Object} portfoliosItem - The newly created portfoliosItem.
 */
export const create = (name = '', portfolioId, ownerFbId) =>
    PortfoliosItems().insert({
        portfolio_id: portfolioId,
        name: name,
        owner_fb_id: ownerFbId,
    }, 'id')
    .then((portfoliosItemId) => get(portfoliosItemId));

/**
 * update - Update a portfoliosItem with the given values.
 * @param   {Number} options.id - The ID of the portfoliosItem to update.
 * @param   {String} options.name - The updated name of the portfoliosItem.
 * @param   {Number} options.completerFbId - FB ID of the Completer
 * @returns {Object} portfoliosItem - the updated portfoliosItem.
 */
export const update = ({ id, name, completerFbId }) =>
    PortfoliosItems().where('id', parseInt(id, 10)).update({
        completer_fb_id: completerFbId,
        name,
    }, 'id').then((portfoliosItemId) => get(portfoliosItemId));

export default { create, get, update };