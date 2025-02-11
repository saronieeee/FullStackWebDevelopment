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
import React from 'react';
import './Picker.css';

/**
 * Picker component for selecting date ranges.
 * Provides an accessible calendar interface for
 * selecting check-in and check-out dates.
 */
class Picker extends React.Component {
  constructor(props) {
    super(props);
    const initialDate = new Date();
    initialDate.setHours(0, 0, 0, 0);

    this.state = {
      currentDate: initialDate,
      displayDate: new Date(initialDate),
      stay: {
        startDate: null,
        endDate: null,
      },
      months: [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ],
    };
  }

  /**
   * Handles click events on calendar dates.
   * @param {Date} date - The clicked date
   */
  handleDateClick = (date) => {
    const comparisonDate = new Date(this.state.currentDate);
    comparisonDate.setHours(0, 0, 0, 0);

    this.setState((prevState) => {
      if (!prevState.stay.startDate || date < prevState.stay.startDate) {
        return {
          stay: {
            startDate: date,
            endDate: null,
          },
        };
      } else if (date > prevState.stay.startDate) {
        return {
          stay: {
            ...prevState.stay,
            endDate: date,
          },
        };
      }
    });
  };

  /**
   * Navigates the calendar display by the specified number of months.
   * @param {number} direction -
   * Number of months to move (-1 for previous, 1 for next)
   */
  navigateMonth = (direction) => {
    this.setState((prevState) => {
      const proposedDate = new Date(prevState.displayDate);
      proposedDate.setMonth(proposedDate.getMonth() + direction);

      return {displayDate: proposedDate};
    });
  };

  /**
   * Creates calendar day elements arranged in weeks.
   * @param {Array} days - Array of day elements to arrange
   * @returns {Array} Array of week rows
   */
  createWeekRows = (days) => {
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(
          <div key={`week-${i}`} role="row">
            {days.slice(i, i + 7)}
          </div>,
      );
    }
    return weeks;
  };

  /**
   * Creates a calendar month display.
   * @param {Date} date - Date object representing the month to display
   * @returns {React.ReactElement} Calendar month display
   */
  createMonthCalendar = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();

    const days = [];
    for (let i = 0; i < 42; i++) {
      const dayNumber = i - firstDay + 1;
      if (i >= firstDay && dayNumber <= daysInMonth) {
        const cellDate = new Date(year, month, dayNumber);
        cellDate.setHours(0, 0, 0, 0);

        const comparisonDate = new Date(this.state.currentDate);
        comparisonDate.setHours(0, 0, 0, 0);

        const isDisabled = cellDate < comparisonDate;
        const isStartDate = this.state.stay.startDate &&
          cellDate.getTime() === this.state.stay.startDate.getTime();
        const isEndDate = this.state.stay.endDate &&
          cellDate.getTime() === this.state.stay.endDate.getTime();
        const isInRange = this.state.stay.startDate &&
          this.state.stay.endDate &&
          cellDate > this.state.stay.startDate &&
          cellDate < this.state.stay.endDate;

        const cellLabel = isStartDate ?
          `Check in on ${this.state.months[month]} ${dayNumber} ${year}` :
          isEndDate ?
            `Check out on ${this.state.months[month]} ${dayNumber} ${year}` :
            `${this.state.months[month]} ${dayNumber} ${year}`;

        days.push(
            <div
              key={i}
              onClick={() => !isDisabled && this.handleDateClick(cellDate)}
              aria-label={cellLabel}
              aria-disabled={isDisabled}
              role="gridcell"
              tabIndex={isDisabled ? -1 : 0}
              data-state={isStartDate ? 'checkin' :
              isEndDate ? 'checkout' :
              isInRange ? 'stay' :
              isDisabled ? 'disabled' : ''}>
              {dayNumber}
            </div>,
        );
      } else {
        days.push(<div key={i} role="gridcell" aria-hidden="true" />);
      }
    }

    return (
      <div
        role="region"
        aria-label={`${this.state.months[month]} ${year}`}
        className="calendar-month"
      >
        <div
          role="heading"
          aria-label={`${this.state.months[month]} ${year}`}
          className="calendar-header"
        >
          {`${this.state.months[date.getMonth()]} ${date.getFullYear()}`}
        </div>
        <div role="grid">
          <div role="row" className="weekday-header">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, index) => (
              <div key={index} role="columnheader" aria-label={day}>
                {day}
              </div>
            ))}
          </div>
          {this.createWeekRows(days)}
        </div>
      </div>
    );
  };

  /**
   * Determines if navigation to the previous month should be allowed.
   * @returns {boolean} Whether previous month navigation is allowed
   */
  canGoToPrevMonth = () => {
    const prevMonth = new Date(this.state.displayDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    prevMonth.setDate(1); // Set to first of month for comparison

    const currentMonth = new Date(this.state.currentDate);
    currentMonth.setDate(1);

    return prevMonth >= currentMonth;
  };

  /**
   * Sets the check-in date and updates the display month accordingly
   * @param {Date} date - The date to set as check-in
   */
  setCheckin = (date) => {
    const cleanDate = new Date(date);
    cleanDate.setHours(0, 0, 0, 0);
    this.setState({
      displayDate: new Date(
          cleanDate.getFullYear(), cleanDate.getMonth(), 1),
      stay: {
        startDate: cleanDate,
        endDate: null,
      },
    });
  };

  render() {
    const secondDate = new Date(this.state.displayDate);
    secondDate.setMonth(secondDate.getMonth() + 1);

    return (
      <div className="picker-container" role="application">
        <button
          onClick={() => this.navigateMonth(-1)}
          aria-label="Go to Previous Month"
          style={{visibility: this.canGoToPrevMonth() ? 'visible' : 'hidden'}}
        >
          ←
        </button>

        {this.createMonthCalendar(this.state.displayDate)}
        {this.createMonthCalendar(secondDate)}

        <button
          onClick={() => this.navigateMonth(1)}
          aria-label="Go to Next Month"
        >
          →
        </button>
      </div>
    );
  }
}

export default Picker;
