/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== MODULES ===============================================================
import io from 'socket.io-client';
import React, {createElement} from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {Panel, Form} from 'react-weui';

// ===== COMPONENTS ============================================================
import Invite from './invite.jsx';
import Currency from './currency.jsx';
import PortfolioNotFound from './portfolio_not_found.jsx';
import LoadingScreen from './loading_screen.jsx';
import NewCurrency from './new_currency.jsx';
import Title from './title.jsx';
import Updating from './updating.jsx';
import Viewers from './viewers.jsx';

let socket;

/* =============================================
   =            React Application              =
   ============================================= */

export default class App extends React.Component {
  constructor(props) {
    super(props);

    this.addCurrency = this.addCurrency.bind(this);
    this.addNewCurrency = this.addNewCurrency.bind(this);
    this.pushUpdatedCurrency = this.pushUpdatedCurrency.bind(this);
    this.setDocumentTitle = this.setDocumentTitle.bind(this);
    this.setCurrency = this.setCurrency.bind(this);
    this.setNewCurrencyText = this.setNewCurrencyText.bind(this);
    this.setOwnerId = this.setOwnerId.bind(this);
    this.setTitleText = this.setTitleText.bind(this);
    this.userJoin = this.userJoin.bind(this);
    this.setOnlineUsers = this.setOnlineUsers.bind(this);

    this.state = {
      currencies: [],
      newCurrencyText: '',
      ownerId: null,
      resetting: false,
      title: this.props.title,
      updating: false,
      users: [],
    };
  }

  static propTypes = {
    apiUri: React.PropTypes.string.isRequired,
    portfolioId: React.PropTypes.number.isRequired,
    socketAddress: React.PropTypes.string.isRequired,
    viewerId: React.PropTypes.number.isRequired,
    threadType: React.PropTypes.string.isRequired,
  }

  /* =============================================
     =               Helper Methods              =
     ============================================= */

  /* ----------  Communicate with Server  ---------- */

  /*
   * Push a message to socket server
   * To keep things clear, we're distinguishing push events by automatically
   * prepending 'push:' to the channel name
   *
   * Returned responses have no prefix,
   * and read the same in the rest of the code
   */
  pushToRemote(channel, message) {
    this.setState({updating: true}); // Set the updating spinner

    socket.emit(
      `push:${channel}`,
      {
        senderId: this.props.viewerId,
        portfolioId: this.props.portfolioId,
        ...message,
      },
      (status) => {
        // Finished successfully with a special 'ok' message from socket server
        if (status !== 'ok') {
          console.error(
            `Problem pushing to ${channel}`,
            JSON.stringify(message)
          );
        }

        this.setState({
          socketStatus: status,
          updating: false, // Turn spinner off
        });
      }
    );
  }

  /* ----------  Update Document Attributes  ---------- */

  setDocumentTitle(title = 'Portfolio') {
    console.log('Updating document title (above page):', title);
    document.title = title;
  }

  /* =============================================
     =           State & Event Handlers          =
     ============================================= */

  /* ----------  Portfolio  ---------- */

  // For the initial data fetch
  setOwnerId(ownerId) {
    console.log('Set owner ID:', ownerId);
    this.setState({ownerId});
  }

  setTitleText(title) {
    console.log('Push title to remote:', title);
    this.setState({title});
    this.setDocumentTitle(title);
    this.pushToRemote('title:update', {title});
  }

  /* ----------  Users  ---------- */

  // Socket Event Handler for Set Online Users event.
  setOnlineUsers(onlineUserFbIds = []) {
    const users = this.state.users.map((user) => {
      const isOnline =
        onlineUserFbIds.find((onlineUserFbId) => onlineUserFbId === user.fbId);

      return Object.assign({}, user, {online: isOnline});
    });

    this.setState({users});
  }

  // Socket Event Handler for User Join event.
  userJoin(newUser) {
    const oldUsers = this.state.users.slice();
    const existing = oldUsers.find((user) => user.fbId === newUser.fbId);

    let users;
    if (existing) {
      users = oldUsers.map((user) =>
        (user.fbId === newUser.fbId)
        ? newUser
        : user
      );
    } else {
      oldUsers.push(newUser);
      users = oldUsers;
    }

    this.setState({users});
  }

  /* ----------  currencies  ---------- */

  addCurrency(currency) {
    this.setState({currencies: [...this.state.currencies, currency]});
  }

  pushUpdatedCurrency(currencyId, name, ticker, value, valueCurrency, completerFbId) {
    this.pushToRemote('currency:update', {id: currencyId, name, ticker, value, valueCurrency, completerFbId});
  }

  setCurrency({id, name, ticker, value, valueCurrency, completerFbId}) {
    const currencies = this.state.currencies.map((currency) =>
      (currency.id === id)
        ? Object.assign({}, currency, {id: id, name, ticker, value, valueCurrency, completerFbId})
        : currency
    );

    this.setState({currencies});
  }

  /* ----------  New Currency Field  ---------- */

  setNewCurrencyText(newText) {
    console.log('Set new currency text:', newText);
    this.setState({newCurrencyText: newText});
  }

  // Turn new currency text into an actual portfolio currency
  addNewCurrency() {
    const {newCurrencyText: name} = this.state;

    this.resetNewCurrency();
    this.pushToRemote('currency:add', {name, ticker, value, valueCurrency});
  }

  resetNewCurrency() {
    this.setState({resetting: true});

    setTimeout(() => {
      this.setState({newCurrencyText: '', resetting: false});
    }, 600);
  }

  /* =============================================
     =              React Lifecycle              =
     ============================================= */

  componentWillMount() {
    // Connect to socket.
    socket = io.connect(
      this.props.socketAddress,
      {reconnect: true, secure: true}
    );

    // Add socket event handlers.
    socket.on('init', ({users, currencies, ownerId, title} = {}) => {
      this.setState({users, currencies, ownerId, title});
    });

    socket.on('currency:add', this.addCurrency);
    socket.on('currency:update', this.setCurrency);
    socket.on('portfolio:setOwnerId', this.setOwnerId);
    socket.on('title:update', this.setDocumentTitle);
    socket.on('user:join', this.userJoin);
    socket.on('users:setOnline', this.setOnlineUsers);

    var self = this;
    // Check for permission, ask if there is none
    window.MessengerExtensions.getGrantedPermissions(function(response) {
      // check if permission exists
      var permissions = response.permissions;
      if (permissions.indexOf('user_profile') > -1) {
        self.pushToRemote('user:join', {id: self.props.viewerId});
      } else {
        window.MessengerExtensions.askPermission(function(response) {
          var isGranted = response.isGranted;
          if (isGranted) {
            self.pushToRemote('user:join', {id: self.props.viewerId});
          } else {
            window.MessengerExtensions.requestCloseBrowser(null, null);
          }
        }, function(errorCode, errorMessage) {
          console.error({errorCode, errorMessage});
          window.MessengerExtensions.requestCloseBrowser(null, null);
        }, 'user_profile');
      }
    }, function(errorCode, errorMessage) {
      console.error({errorCode, errorMessage});
      window.MessengerExtensions.requestCloseBrowser(null, null);
    });
  }

  render() {
    const {
      ownerId,
      currencies,
      users,
      title,
      resetting,
      newCurrencyText,
      updating,
      socketStatus,
    } = this.state;

    let page;

    // Skip and show loading spinner if we don't have data yet
    if (users.length > 0) {
      /* ----------  Setup Sections (anything dynamic or repeated) ---------- */

      const {apiUri, portfolioId, viewerId, threadType} = this.props;
      const currencyList = currencies.filter(Boolean).map((currency) => {
        return (
          <Currency
            {...currency}
            key={currency.id}
            users={users}
            viewerId={viewerId}
            pushUpdatedCurrency={this.pushUpdatedCurrency}
          />
        );
      });

      let invite;
      const isOwner = viewerId === ownerId;
      if (isOwner || threadType !== 'USER_TO_PAGE') {
        // only owners are able to share their portfolios and other
        // participants are able to post back to groups.
        let sharingMode;
        let buttonText;

        if (threadType === 'USER_TO_PAGE') {
          sharingMode = 'broadcast';
          buttonText = 'Invite your friends to this portfolio';
        } else {
          sharingMode = 'current_thread';
          buttonText = 'Send to conversation';
        }

        invite = (
          <Invite
            title={title}
            apiUri={apiUri}
            portfolioId={portfolioId}
            sharingMode={sharingMode}
            buttonText={buttonText}
          />
        );
      }

      let titleField;
      if (isOwner) {
        titleField = (
          <Title
            text={title}
            setTitleText={this.setTitleText}
          />
        );
      }

    /* ----------  Inner Structure  ---------- */
      page =
        (<section id='portfolio'>
          <Viewers
            users={users}
            viewerId={viewerId}
          />

          <Panel>
            {titleField}

            <section id='currencies'>
              <Form checkbox>
                <ReactCSSTransitionGroup
                  transitionName='currency'
                  transitionEnterTimeout={250}
                  transitionLeaveTimeout={250}
                >
                  {currencyList}
                </ReactCSSTransitionGroup>
              </Form>

              <NewCurrency
                newCurrencyText={newCurrencyText}
                disabled={updating}
                resetting={resetting}
                addNewCurrency={this.addNewCurrency}
                setNewCurrencyText={this.setNewCurrencyText}
              />
            </section>
          </Panel>

          <Updating updating={updating} />

          {invite}
        </section>);
    } else if (socketStatus === 'noPortfolio') {
      // We were unable to find a matching portfolio in our system.
      page = <PortfolioNotFound/>;
    } else {
      // Show a loading screen until app is ready
      page = <LoadingScreen key='load' />;
    }

    /* ----------  Animated Wrapper  ---------- */

    return (
      <div id='app'>
        <ReactCSSTransitionGroup
          transitionName='page'
          transitionEnterTimeout={500}
          transitionLeaveTimeout={500}
        >
          {page}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}
