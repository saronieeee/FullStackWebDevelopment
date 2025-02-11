/*
#######################################################################
#
# Copyright (C) 2020-2025 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/
import {it} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

it('renders', async () => {
  render(<App />);
  screen.getByText('JSX Name:');
});

it('updates', async () => {
  render(<App />);
  await userEvent.type(screen.getByLabelText('input'), 'world');
  screen.getByText('Hello world!');
});
