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

const Portfolios = () => Knex('portfolios');
const Currencies = () => Knex('currencies');
const Users = () => Knex('users');
const UsersPortfolios = () => Knex('users_portfolios');

/**
 * get - Gets the portfolio with the given ID.
 * @param   {Number} portfolioId - The ID of the portfolio to return.
 * @returns {Object} portfolio - The matched portfolio.
 */
const get = (portfolioId) =>
    Portfolios()
    .where('id', parseInt(portfolioId, 10))
    .first()
    .then(camelCaseKeys);

/**
 * getAll - Gets all portfolios
 * @returns {Array} portfolios - Array of all portfolios.
 */
const getAll = () =>
    Portfolios().select()
    .then((portfolios) => portfolios.map(camelCaseKeys));

/**
 * getAllCurrencies - Gets all currencies for the portfolio with the given ID.
 * @param   {Number} portfolioId - The ID of the portfolio to get currencies for.
 * @returns {Array} currencies - Array of all currencies
 */
const getAllCurrencies = (portfolioId) =>
    Currencies()
    .where('portfolio_id', parseInt(portfolioId, 10))
    .select()
    .then((currencies) => currencies.map(camelCaseKeys));

/**
 * getAllUsers - Gets all Users of the portfolio with the given ID.
 * @param   {Number} portfolioId - The ID of the portfolio to get Users for.
 * @returns {Array} users - Array of all Users for the matched portfolio.
 */
const getAllUsers = (portfolioId) =>
    Users()
    .join('users_portfolios', 'fb_id', 'users_portfolios.user_fb_id')
    .where('portfolio_id', parseInt(portfolioId, 10))
    .select('fb_id')
    .then((users) => users.map(camelCaseKeys));

/**
 * getOwner - Gets the User who owns the portfolio with the given ID.
 * @param   {Number} portfolioId - The ID of the portfolio to get the Owner of.
 * @returns {Object} user - The User who owns the portfolio.
 */
const getOwner = (portfolioId) =>
    Users()
    .join('users_portfolios', 'fb_id', 'users_portfolios.user_fb_id')
    .where({ portfolio_id: parseInt(portfolioId, 10), owner: true })
    .first('fb_id')
    .then(camelCaseKeys);

/**
 * getWithUsers - Returns the portfolio with the given ID, with an array subscribed
 *                user FB IDs provided under `subscriberIds` key.
 * @param   {Number} portfolioId - The ID of the portfolio to return.
 * @returns {Object} portfolio - The matched portfolio, with `subscriberIds` key.
 */
const getWithUsers = (portfolioId) =>
    Promise.all([get(portfolioId), getAllUsers(portfolioId)])
    .then(([portfolio, users]) => {
        if (portfolio) {
            portfolio.subscriberIds = users.map((user = {}) => user.fbId);
        }

        return portfolio;
    });

/**
 * getForUser - Returns all portfolios associated with the given FB ID
 *              and ownership value.
 * @param   {Number} userFbId - The FB ID of the User to find portfolios for.
 * @param   {Boolean} owner - The Ownership state to match portfolios against.
 * @returns {Array} portfolios - The matched portfolios.
 */
const getForUser = (userFbId, owner) => {
    const query = Portfolios()
        .join('users_portfolios', 'portfolios.id', 'users_portfolios.portfolio_id')
        .where('user_fb_id', userFbId);

    if (typeof owner !== 'undefined') {
        query.andWhere({ owner });
    }

    return query.pluck('portfolios.id')
        .then((portfolioIds = []) => Promise.all(portfolioIds.map(getWithUsers)));
};

/**
 * getOwnedForUser — Returns all portfolios that a User owns.
 * @param   {Number} userFbId - The FB ID of the User to find portfolios for.
 * @returns {Array} portfolios - Array of all portfolios owned by the User.
 */
const getOwnedForUser = (userFbId) => getForUser(userFbId, true);

/**
 * getSharedToUser — Returns all portfolios that have been shared with a User.
 * @param   {Number} userFbId - The FB ID of the User to find portfolios for.
 * @returns {Array} portfolios - Array of all portfolios shared with the User.
 */
const getSharedToUser = (userFbId) => getForUser(userFbId, false);

/**
 * addUser - Associates a User with a portfolio, making
 *           them the owner if no other owner is found.
 * @param   {Number} portfolioId - The ID of the portfolio to subscribe a User to.
 * @param   {Number} userFbId - The FB ID of the User to add to a portfolio.
 * @returns {Object} usersportfolio
 */
const addUser = (portfolioId, userFbId) => {
    return getOwner(portfolioId)
        .then((user) => !!user)
        .then((hasOwner) =>
            UsersPortfolios()
            .where({ portfolio_id: portfolioId, user_fb_id: userFbId })
            .first()
            .then((usersportfolio) => ({ hasOwner, alreadyAdded: !!usersportfolio }))
        )
        .then(({ hasOwner, alreadyAdded }) => {
            if (alreadyAdded && !hasOwner) {
                return UsersPortfolios()
                    .where({ portfolio_id: portfolioId, user_fb_id: userFbId })
                    .first()
                    .update({ owner: true }, ['id', 'portfolio_id', 'user_fb_id', 'owner'])
                    .then(([usersportfolio]) => camelCaseKeys(usersportfolio));
            } else if (alreadyAdded) {
                return UsersPortfolios()
                    .where({ portfolio_id: portfolioId, user_fb_id: userFbId })
                    .first()
                    .then(camelCaseKeys);
            }

            return UsersPortfolios()
                .insert({ owner: !hasOwner, portfolio_id: portfolioId, user_fb_id: userFbId }, ['id', 'portfolio_id', 'user_fb_id', 'owner'])
                .then(([usersportfolio]) => camelCaseKeys(usersportfolio));
        });
};

/**
 * setOwner - Make the User with the provided FB ID
 *            the owner of the portfolio with the given ID.
 * @param   {Number} portfolioId - The ID of the portfolio to make the User the owner of.
 * @param   {Number} userFbId - The FB ID of the User to be made owner.
 * @returns {Object} usersportfolio
 */
const setOwner = (portfolioId, userFbId) =>
    getOwner(portfolioId)
    .then((user) => {
        if (!!user) {
            return UsersPortfolios()
                .where({ portfolio_id: portfolioId, user_fb_id: user.fbId })
                .update({ owner: false }, 'id')
                .then(() => addUser(portfolioId, userFbId));
        }

        return addUser(portfolioId, userFbId);
    });

/**
 * setTitle - Sets the title of a given portfolio.
 * @param   {String} newTitle - The new Title of the portfolio
 * @param   {Number} portfolioId - The ID of the portfolio to be given the new title.
 * @returns {Object} portfolio - The updated portfolio.
 */
const setTitle = (newTitle = '', portfolioId) => {
    const title = (newTitle === null) ? 'BTC portfolio' : newTitle;

    return Portfolios()
        .where('id', parseInt(portfolioId, 10)).update({ title }, ['id', 'title'])
        .then(([portfolio]) => portfolio);
};

/**
 * create - Creates a new portfolio with the given title.
 * @param   {String} title - The title of the portfolio to create.
 * @returns {Object} portfolio - The newly created portfolio.
 */
const create = (title = 'BTC portfolio') =>
    Portfolios()
    .insert({ title }, 'id').then(get);

export default {
    addUser,
    create,
    get,
    getAll,
    getAllCurrencies,
    getAllUsers,
    getForUser,
    getOwnedForUser,
    getSharedToUser,
    getOwner,
    getWithUsers,
    setOwner,
    setTitle,
};