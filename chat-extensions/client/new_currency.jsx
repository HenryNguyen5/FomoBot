/**
 * Copyright 2017-present, Facebook, Inc. All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 */

// ===== MODULES ===============================================================
import React, { createElement } from 'react';
import { Cell, CellBody, CellHeader, Input } from 'react-weui';

const SCROLL_DURATION = 1000; // total duration in ms for scroll animation.

/**
 * lockScroll — Force scrollY position to bottom of viewport for duration.
 * @param   {Number} startTime - Start Time for locking scroll duration.
 * @returns {Undefined} .
 */
const lockScroll = (startTime) => {
  const deltaTime = Date.now() - startTime;
  const htmlElement = document.documentElement;
  const { scrollTo, scrollX, innerHeight } = window;

  scrollTo(scrollX, htmlElement.offsetHeight - innerHeight);

  if (deltaTime <= SCROLL_DURATION) {
    window.requestAnimationFrame(() => lockScroll(startTime));
  }
};

// The NewCurrency Input Field Component
const NewCurrency = ({
  addNewCurrency,
  disabled,
  newCurrencyText,
  resetting,
  setNewCurrencyTicker,
  setNewCurrencyValue,
}) => {
  const onSubmit = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (!disabled && newCurrencyText.length > 0) {
      addNewCurrency();
      lockScroll(Date.now());
    }
  };

  const classes = resetting ? 'resetting' : null; // For wipe animation

  return (
    <Cell id='new-currency'>
      <CellHeader id='input-indicator' onClick={onSubmit}>
        <div className='weui-uploader__input-box' />
      </CellHeader>

      <CellBody>
        {/* Empty action attr enables 'Go' Submit Button on iOS Keyboard */}
        <form action onSubmit={onSubmit}>
          <Input
            className={classes}
            disabled={disabled}
            id='new-currency-ticker'
            onBlur={onSubmit}
            onChange={(event) => setNewCurrencyTicker(event.target.value)}
            placeholder='Currency Ticker'
            type='text'
            value={newCurrencyText}
          />
          <Input
            className={classes}
            disabled={disabled}
            id='new-currency-value'
            onBlur={onSubmit}
            onChange={(event) => setNewCurrencyValue(event.target.value)}
            placeholder='Quantity'
            type='text'
            value={newCurrencyText}
          />
        </form>
      </CellBody>
    </Cell>
  );
};

NewCurrency.proptypes = {
  addNewCurrency: React.PropTypes.func.isRequired,
  disabled: React.PropTypes.bool.isRequired,
  newCurrencyText: React.PropTypes.string,
  setNewCurrencyTicker: React.PropTypes.func.isRequired,
  setNewCurrencyValue: React.PropTypes.func.isRequired,
};

export default NewCurrency;
