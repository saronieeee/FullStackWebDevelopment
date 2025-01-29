/*
#######################################################################
#
# Copyright (C) 2020-2025  David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/

import {it, beforeAll, beforeEach} from 'vitest';
import {render} from '@testing-library/react';
import App from '../App';

import loader from '../data/loader';

/**
 * Do not modify this function.
 */
beforeAll(() => {
  loader();
  window.resizeTo = function resizeTo(width, height) {
    Object.assign(this, {
      innerWidth: width,
      innerHeight: height,
      outerWidth: width,
      outerHeight: height,
    }).dispatchEvent(new this.Event('resize'));
  };
});

/**
 * Sets the window to the size of an iPhone SE.
 * You can add to this function, but don't remove or modify the
 * call to window.resize()
 */
beforeEach(() => {
  window.resizeTo(375, 667); // don't remove or modify this line
});

/**
 *
 */
it('Renders', async () => {
  render(<App />);
});
