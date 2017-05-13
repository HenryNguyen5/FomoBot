/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== DB ====================================================================
import Portfolios from '../models/portfolios';
import Users from '../models/users';

// ===== MESSENGER =============================================================
import userApi from '../messenger-api-helpers/user';
import sendApi from '../messenger-api-helpers/send';

// Find or Create a new/existing User with the given id.
const getUser = (senderId) => {
    return Users.findOrCreate({
        fb_id: senderId, // eslint-disable-line camelcase
    });
};

// Promise wrapper for Facebook UserApi.
const getUserDetails = (senderId) => {
    return new Promise((resolve, reject) => {
        userApi.getDetails(senderId, (err, { statusCode }, body) => {
            if (err) {
                return reject(err);
            } else if (statusCode !== 200) {
                return reject({
                    statusCode,
                    message: 'Unable to fetch user data for user',
                    senderId,
                });
            }

            return resolve({
                name: body.first_name || body.last_name || senderId,
                profilePic: body.profile_pic,
                fbId: senderId,
            });
        });
    });
};

const getFacebookProfileInfoForUsers = (users = [], portfolioId, socketUsers) =>
    Promise.all(users.map((user) => getUserDetails(user.fbId)))
    .then((res) => res.map((resUser = {}) => {
        // Detect online status via socketUser with matching portfolio & FB IDs.
        const isOnline = [...socketUsers.values()].find((socketUser) =>
            socketUser.portfolioId === portfolioId && socketUser.userId === resUser.fbId);

        return Object.assign({}, resUser, { online: !!isOnline || false });
    }));

// Join Room, Update Necessary portfolio Info, Notify All Users in room of changes.
const join = ({
    request: { senderId, portfolioId },
    allInRoom,
    sendStatus,
    socket,
    socketUsers,
    userSocket,
}) => {
    Promise.all([
        Portfolios.get(portfolioId),
        Portfolios.getAllCurrencies(portfolioId),
        Portfolios.getOwner(portfolioId),
        getUser(senderId),
    ]).then(([portfolio, currencies, portfolioOwner, user]) => {
        if (!portfolio) {
            console.error("portfolio doesn't exist!");
            sendStatus('noportfolio');
        }

        Portfolios.addUser(portfolio.id, user.fbId)
            .then((usersportfolio) => {
                if (!portfolioOwner) {
                    sendApi.sendPortfolioCreated(user.fbId, portfolio.id, portfolio.title);
                    allInRoom(portfolio.id).emit('portfolio:setOwnerId', usersportfolio.userFbId);
                }
            })
            .then(() => {
                socketUsers.set(socket.id, { portfolioId: portfolio.id, userId: user.fbId });

                Portfolios.getAllUsers(portfolioId)
                    .then((users) => {
                        return getFacebookProfileInfoForUsers(users, portfolioId, socketUsers);
                    })
                    .then((fbUsers) => {
                        const viewerUser =
                            fbUsers.find((fbUser) => fbUser.fbId === user.fbId);
                        socket.join(portfolio.id);
                        socket.in(portfolio.id).emit('user:join', viewerUser);

                        userSocket.emit('init', {
                            ...portfolio,
                            currencies,
                            users: fbUsers,
                            ownerId: portfolioOwner ? portfolioOwner.fbId : user.fbId,
                        });

                        sendStatus('ok');
                    });
            });
    });
};

// Notify users in room when user leaves.
const leave = ({ userId, portfolioId, allInRoom, socket, socketUsers }) => {
    if (!userId) {
        console.error('User not registered to socket');
        return;
    }

    socketUsers.delete(socket.id);

    // Detect online status via socketUser with matching portfolio & FB IDs.
    const onlineUsers = [...socketUsers.values()].reduce((onlineUsers, socketUser) => (
        (socketUser.portfolioId === portfolioId) ? [...onlineUsers, socketUser.userId] :
        onlineUsers
    ), []);

    allInRoom(portfolioId).emit('users:setOnline', onlineUsers);
};

export default { join, leave };