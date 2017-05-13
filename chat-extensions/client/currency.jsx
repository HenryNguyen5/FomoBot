/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

/* eslint-disable react/react-in-jsx-scope */

/* ----------  External Libraries  ---------- */
import React from 'react';
import {CellBody, CellFooter, CellHeader, Checkbox, FormCell} from 'react-weui';

/*
 * A single portfolio currency, including controls
 * 
 */
const Currency = ({
  id,
  name,
  ticker,
  value,
  valueCurrency,
  viewerId,
  pushUpdatedItem,
  completerFbId,
  ownerFbId,
  users,
}) => {
  const actorId = completerFbId || ownerFbId;
  const user = users.find((user) => user.fbId === actorId);
  const {name: attribution} = user;
  let action = 'Added';
  let toComplete = viewerId;
  let classes;

  if (completerFbId) {
    action = 'Completed';
    classes = 'complete';
    toComplete = null;
  }

  return (
    <FormCell checkbox className='item'>
      <CellHeader>
        <Checkbox
          name={`item-${id}`}
          checked={!!completerFbId}
          onChange={() => pushUpdatedItem(id, name, toComplete)}
        />
      </CellHeader>

      //TODO: Calculate actual value based on valueCurrency + amount in wallet
      <CellBody className={classes}>{ticker+' '+value}</CellBody> //Ticker - current value

      //TODO: Show 24 hour percent change - maybe graph (like coin market cap)
      <CellFooter>{action} by {attribution}</CellFooter>

    </FormCell>
  );
};

Currency.PropTypes = {
  id: React.PropTypes.number.isRequired,
  name: React.PropTypes.string.isRequired,
  value: React.PropTypes.number.isRequired,
  valueCurrency: React.PropTypes.string.isRequired,
  viewerId: React.PropTypes.string.isRequired,
  pushUpdatedItem: React.PropTypes.func.isRequired,
  ownerFbId: React.PropTypes.string.isRequired,
  completerFbId: React.PropTypes.string,
  users: React.PropTypes.arrayOf(React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
  })).isRequired,
};

export default Currency;
