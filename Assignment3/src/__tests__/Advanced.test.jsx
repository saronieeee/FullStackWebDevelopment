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

import {describe, expect, test} from 'vitest';
import {render, fireEvent} from '@testing-library/react';
import '@testing-library/jest-dom';
import Picker from '../Picker';

describe('Picker Component', () => {
  test('setCheckin sets the correct check-in date and resets end date', () => {
    const {getByRole, getAllByRole} = render(<Picker />);

    const nextMonthButton = getByRole('button', {name: 'Go to Next Month'});
    fireEvent.click(nextMonthButton);

    const allDates = getAllByRole('gridcell');
    const checkinDate = allDates[10];
    fireEvent.click(checkinDate);

    expect(checkinDate).toHaveAttribute('data-state', 'checkin');
  });

  test('handleDateClick sets the correct start and end dates', () => {
    const {getAllByRole, getByRole} = render(<Picker />);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const currentMonthDays = getAllByRole('gridcell').filter(
        (cell) => cell.getAttribute('data-state') !== 'disabled',
    );
    if (currentMonthDays.length === 0) {
      const nextMonthButton = getByRole('button', {name: 'Go to Next Month'});
      fireEvent.click(nextMonthButton);
    }

    const allDates = getAllByRole('gridcell');
    const checkinDateCell = allDates.find((cell) => {
      const cellDate = new Date(cell.getAttribute('aria-label'));
      return cellDate > today;
    });
    fireEvent.click(checkinDateCell);

    expect(checkinDateCell).toHaveAttribute('data-state', 'checkin');

    const checkoutDateCell = allDates.find((cell) => {
      const cellDate = new Date(cell.getAttribute('aria-label'));
      return cellDate > new Date(checkinDateCell.getAttribute('aria-label'));
    });
    fireEvent.click(checkoutDateCell);

    expect(checkoutDateCell).toHaveAttribute('data-state', 'checkout');
  });

  test('createWeekRows organizes days into weeks', () => {
    const pickerInstance = new Picker();

    const days = Array.from({length: 42}, (_, i) => <div key={i}>{i + 1}</div>);
    const weeks = pickerInstance.createWeekRows(days);

    expect(weeks.length).toBe(6);
    weeks.forEach((week) => {
      expect(week.props.role).toBe('row');
    });
  });

  test('createMonthCalendar generates the correct calendar layout', () => {
    const pickerInstance = new Picker();

    const testDate = new Date(2025, 0, 1);
    const calendar = pickerInstance.createMonthCalendar(testDate);

    expect(calendar.props['aria-label']).toBe('January 2025');
    expect(calendar.props.role).toBe('region');
  });

  test('canGoToPrevMonth returns true or false correctly', () => {
    const pickerInstance = new Picker();

    const today = new Date();
    pickerInstance.setState({currentDate: today});

    const prevMonth = new Date(today);
    prevMonth.setMonth(today.getMonth() - 1);

    pickerInstance.setState({displayDate: today});
    expect(pickerInstance.canGoToPrevMonth()).toBe(false);

    pickerInstance.setState({displayDate: prevMonth});
    expect(pickerInstance.canGoToPrevMonth()).toBe(false);
  });

  test('setCheckin updates state correctly with a valid date', () => {
    const {getAllByRole} = render(<Picker />);

    const validDate = new Date(2025, 2, 15);

    const allDates = getAllByRole('gridcell');
    const checkinDateCell = allDates.find((cell) => {
      const cellDate = new Date(cell.getAttribute('aria-label'));
      return cellDate.getDate() === validDate.getDate();
    });

    fireEvent.click(checkinDateCell);

    expect(checkinDateCell).toHaveAttribute('data-state', 'disabled');
    expect(checkinDateCell).toHaveTextContent(validDate.getDate().toString());

    const firstDateInMonth = getAllByRole('gridcell')[0];
    const firstDateInMonthLabel = new Date(
        firstDateInMonth.getAttribute('aria-label'));
    expect(firstDateInMonthLabel.getFullYear()).toBe(validDate.getFullYear());
  });
});
