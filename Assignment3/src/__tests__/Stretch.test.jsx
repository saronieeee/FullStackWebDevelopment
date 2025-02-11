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
import {describe, expect, test, vi, it} from 'vitest';
import {render, fireEvent, screen} from '@testing-library/react';
import React from 'react';
import '@testing-library/jest-dom';
import App from '../App';
import Entry from '../Entry';
import Picker from '../Picker';


it('renders', () => {
  render(<App />);
  expect(screen.queryByText(
      'Some Text Not In The App')).not.toBeInTheDocument();
});


describe('Entry Component', () => {
  test('validates date input and enables button for valid date', () => {
    const pickerRef = {current: {setCheckin: vi.fn()}};
    render(<Entry pickerRef={pickerRef} />);

    const input = screen.getByLabelText(/enter check in date/i);
    const button = screen.getByText(/set check in/i);

    fireEvent.change(input, {target: {value: '03/15/2025'}});

    expect(input.value).toBe('03/15/2025');

    expect(button).not.toBeDisabled();

    expect(pickerRef.current.setCheckin).not.toHaveBeenCalled();
  });

  test('disables button for invalid date', () => {
    const pickerRef = {current: {setCheckin: vi.fn()}};
    render(<Entry pickerRef={pickerRef} />);

    const input = screen.getByLabelText(/enter check in date/i);
    const button = screen.getByText(/set check in/i);

    fireEvent.change(input, {target: {value: 'invalid-date'}});

    expect(input.value).toBe('invalid-date');

    expect(button).toBeDisabled();
  });

  test('calls setCheckin on pickerRef', () => {
    const pickerRef = {current: {setCheckin: vi.fn()}};
    render(<Entry pickerRef={pickerRef} />);

    const input = screen.getByLabelText(/enter check in date/i);
    const button = screen.getByText(/set check in/i);

    fireEvent.change(input, {target: {value: '03/15/2025'}});

    fireEvent.click(button);

    expect(pickerRef.current.setCheckin).toHaveBeenCalledWith(
        new Date(2025, 2, 15));
  });

  test('doesnt call setCheckin on pickerRef when wrong date is entered', () => {
    const pickerRef = {current: {setCheckin: vi.fn()}};
    render(<Entry pickerRef={pickerRef} />);

    const input = screen.getByLabelText(/enter check in date/i);
    const button = screen.getByText(/set check in/i);

    fireEvent.change(input, {target: {value: 'invalid-date'}});

    fireEvent.click(button);

    expect(pickerRef.current.setCheckin).not.toHaveBeenCalled();
  });

  test('setCheckin via Entry updates Picker state correctly', () => {
    const pickerRef = React.createRef();

    render(
        <div>
          <Picker ref={pickerRef} />
          <Entry pickerRef={pickerRef} />
        </div>,
    );

    const input = screen.getByLabelText(/enter check in date/i);
    const button = screen.getByText(/set check in/i);

    fireEvent.change(input, {target: {value: '03/15/2025'}});

    expect(button).not.toBeDisabled();

    fireEvent.click(button);

    const dateCells = screen.getAllByRole('gridcell');
    const selectedCell = dateCells.find(
        (cell) => cell.getAttribute('data-state') === 'checkin',
    );
    expect(selectedCell).toBeTruthy();
    expect(selectedCell.textContent).toBe('15');
  });
});
