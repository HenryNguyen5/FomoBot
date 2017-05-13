import { expect } from 'chai';
import { describe } from 'mocha';

import knex from '../../db/knex';
import Portfolios from '../../models/portfolios';

// Test comparator values are created in `test/sample-seeds` file.
const DEFAULT_TITLE = 'Crypto-coin portfolio';
const PORTFOLIO_1_TITLE = DEFAULT_TITLE;
const PORTFOLIO_2_TITLE = 'BTC portfolio';
const USER_1_FB_ID = '1';
const USER_2_FB_ID = '2';

describe('portfolio', () => {
    beforeEach((done) => {
        knex.migrate.latest()
            .then(() => {
                knex.seed.run().then(() => done());
            });
    });

    afterEach((done) => {
        knex.migrate.rollback().then(() => done());
    });

    describe('addUser', () => {
        it('adds a new User to the portfolio', (done) => {
            Portfolios.getAllUsers(3)
                .then((users) => {
                    expect(users).to.have.length(2);
                    expect(users[0].fbId).to.not.equal('1');

                    return Portfolios.addUser(3, 1);
                })
                .then((usersPortfolio) => {
                    expect(usersPortfolio).to.have.property('owner');
                    expect(usersPortfolio).to.have.property('portfolioId');
                    expect(usersPortfolio.portfolioId).to.equal(3);
                    expect(usersPortfolio.owner).to.equal(false);

                    return Portfolios.getAllUsers(3);
                })
                .then((users) => {
                    expect(users).to.have.length(3);

                    const newUser = users.find((user) => user.fbId === '1');

                    expect(newUser).to.exist;
                    expect(newUser).to.be.an('object');
                    done();
                });
        });
    });

    describe('create', () => {
        it('creates a new portfolio with the given title', (done) => {
            const newPortfolioTitle = 'My New portfolio';
            Portfolios.create(newPortfolioTitle)
                .then((portfolio) => {
                    expect(portfolio).to.be.an('object');
                    expect(portfolio).to.have.property('title');
                    expect(portfolio.title).to.equal(newPortfolioTitle);
                    done();
                });
        });

        it('creates a portfolio with default title if no title is given', (done) => {
            Portfolios.create()
                .then((portfolio) => {
                    expect(portfolio).to.be.an('object');
                    expect(portfolio).to.have.property('title');
                    expect(portfolio.title).to.equal(DEFAULT_TITLE);
                    done();
                });
        });
    });

    describe('get', () => {
        it('returns the requested portfolio', (done) => {
            Portfolios.get(1)
                .then((portfolio) => {
                    expect(portfolio).to.be.an('object');
                    expect(portfolio).to.have.property('title');
                    expect(portfolio.title).to.equal(PORTFOLIO_1_TITLE);
                    done();
                });
        });

        it('returns Undefined when the requested portfolio does not exist', (done) => {
            Portfolios.get(6)
                .then((portfolio) => {
                    expect(portfolio).to.be.an('undefined');
                    done();
                });
        });
    });

    describe('getAll', () => {
        it('returns an Array of all portfolios', (done) => {
            Portfolios.getAll()
                .then((portfolios) => {
                    expect(portfolios).to.have.lengthOf(3);
                    expect(portfolios[0]).to.be.an('object');
                    expect(portfolios[0]).to.have.property('title');
                    done();
                });
        });
    });

    describe('getAllCurrencies', () => {
        it('returns an Array of all Currencies for a portfolio', (done) => {
            Portfolios.getAllCurrencies(1)
                .then((currencies) => {
                    expect(currencies).to.have.lengthOf(3);
                    expect(currencies[0]).to.be.an('object');
                    expect(currencies[0]).to.have.property('name');
                    expect(currencies[0]).to.have.property('ticker');
                    expect(currencies[0]).to.have.property('value');
                    expect(currencies[0]).to.have.property('valueCurrency');
                    expect(currencies[0]).to.have.property('portfolioId');
                    expect(currencies[0]).to.have.property('ownerFbId');
                    expect(currencies[0]).to.have.property('completerFbId');
                    done();
                });
        });

        it('returns an empty Array when there are no currencies/portfolio', (done) => {
            Portfolios.getAllCurrencies(6)
                .then((currencies) => {
                    expect(currencies).to.have.lengthOf(0);
                    expect(currencies).to.be.an('array');
                    done();
                });
        });
    });

    describe('getAllUsers', () => {
        it('returns an Array of all Users of a portfolio', (done) => {
            Portfolios.getAllUsers(1)
                .then((users) => {
                    expect(users).to.have.lengthOf(3);
                    expect(users[0]).to.be.an('object');
                    expect(users[0]).to.have.property('fbId');
                    done();
                });
        });

        it('returns an empty Array when there are no Users/portfolio', (done) => {
            Portfolios.getAllUsers(1)
                .then((users) => {
                    expect(users).to.have.lengthOf(3);
                    expect(users[0]).to.be.an('object');
                    expect(users[0]).to.have.property('fbId');
                    done();
                });
        });
    });

    describe('getForUser', () => {
        it("returns a User's owned portfolios", (done) => {
            Portfolios.getForUser(1)
                .then((portfolios) => {
                    expect(portfolios).to.be.an('array');
                    expect(portfolios).to.have.length(2);
                    expect(portfolios[0]).to.have.property('id');
                    expect(portfolios[0]).to.have.property('title');
                    expect(portfolios[0].id).to.equal(1);
                    expect(portfolios[0].title).to.equal(PORTFOLIO_1_TITLE);
                    done();
                });
        });
    });

    describe('getOwnedForUser', () => {
        it("returns a User's owned portfolios", (done) => {
            Portfolios.getOwnedForUser(1)
                .then((portfolios) => {
                    expect(portfolios).to.be.an('array');
                    expect(portfolios).to.have.length(1);
                    expect(portfolios[0]).to.have.property('id');
                    expect(portfolios[0]).to.have.property('title');
                    expect(portfolios[0].id).to.equal(1);
                    expect(portfolios[0].title).to.equal(PORTFOLIO_1_TITLE);
                    done();
                });
        });
    });

    describe('getSharedToUser', () => {
        it("returns a User's shared, unowned portfolios", (done) => {
            Portfolios.getSharedToUser(1)
                .then((portfolios) => {
                    expect(portfolios).to.be.an('array');
                    expect(portfolios).to.have.length(1);
                    expect(portfolios[0]).to.have.property('id');
                    expect(portfolios[0]).to.have.property('title');
                    expect(portfolios[0].id).to.equal(2);
                    expect(portfolios[0].title).to.equal(PORTFOLIO_2_TITLE);
                    done();
                });
        });
    });

    describe('getWithUsers', () => {
        it('returns a portfolio with an array of subscriberIds', (done) => {
            Portfolios.getWithUsers(1)
                .then((portfolio) => {
                    expect(portfolio).to.be.an('object');
                    expect(portfolio).to.have.property('subscriberIds');
                    expect(portfolio.subscriberIds).to.have.length(3);
                    expect(portfolio.subscriberIds[0]).to.equal('1');
                    done();
                });
        });
    });

    describe('getOwner', () => {
        it('returns the User object for the owner of the given portfolio', (done) => {
            Promise.all([
                Portfolios.getOwner(1),
                Portfolios.getOwner(2),
                Portfolios.getOwner(3),
            ]).then((owners) => {
                expect(owners[0]).to.be.an('object');
                expect(owners[0]).to.be.have.property('fbId');
                expect(owners[0].fbId).to.equal(USER_1_FB_ID);
                expect(owners[1].fbId).to.equal(USER_2_FB_ID);
                expect(owners[2].fbId).to.equal(USER_2_FB_ID);
                done();
            });
        });

        it('returns Undefined if there is no owner for the given portfolio', (done) => {
            Portfolios.getOwner(4)
                .then((user) => {
                    expect(user).to.be.an('undefined');
                    done();
                });
        });
    });

    describe('setOwner', () => {
        it('sets a User as the owner of a portfolio', (done) => {
            Portfolios.create('My Ownerless portfolio')
                .then((portfolio) => {
                    return Portfolios.setOwner(portfolio.id, 1);
                })
                .then((usersportfolio) => {
                    expect(usersportfolio).to.have.property('owner');
                    expect(usersportfolio.owner).to.equal(true);
                    done();
                });
        });

        it('resets the existing portfolio Owner, if there is one', (done) => {
            knex('users_portfolios')
                .where({ portfolio_id: 1, user_fb_id: 1 }) // eslint-disable-line camelcase
                .first()
                .then((usersPortfolio) => {
                    expect(usersPortfolio.owner).to.equal(true);
                }).then(() =>
                    Portfolios.setOwner(1, 3))
                .then((usersPortfolio) => {
                    expect(usersPortfolio).to.have.property('owner');
                    expect(usersPortfolio.owner).to.equal(true);

                    knex('users_portfolios')
                        .where({ portfolio_id: 1, user_fb_id: 1 }) // eslint-disable-line camelcase
                        .first()
                        .then((usersPortfolio) => {
                            expect(usersPortfolio.owner).to.equal(false);
                            done();
                        });
                });
        });
    });

    describe('setTitle', () => {
        it('updates the title of a given portfolio', (done) => {
            const newTitle = 'My Renamed portfolio';

            Portfolios.setTitle(newTitle, 1)
                .then((portfolio) => {
                    expect(portfolio).to.be.an('object');
                    expect(portfolio.title).to.equal(newTitle);
                    done();
                });
        });

        it('resets to a default value if no name is provided', (done) => {
            Promise.all([
                Portfolios.setTitle(null, 1),
                Portfolios.setTitle(undefined, 2),
            ]).then((portfolios) => {
                expect(portfolios[0]).to.be.an('object');
                expect(portfolios[0].title).to.equal(DEFAULT_TITLE);
                expect(portfolios[1]).to.be.an('object');
                expect(portfolios[1].title).to.equal('');
                done();
            });
        });
    });
});