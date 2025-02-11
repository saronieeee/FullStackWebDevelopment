/*
#######################################################################
#
# Copyright (C) 2024 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/

import React from 'react';
import PropTypes from 'prop-types';
import './Entry.css';

/**
 * Date entry component.
 */
class Entry extends React.Component {
  /**
   * Constructor
   *
   * this.props.pickerRef.current is a reference to the Picker
   * @param {object} props properties
   */
  constructor(props) {
    super(props);
    this.state = {
      dateInput: '',
      isValidDate: false,
    };
  }

  /**
   * Validates the date string format and ensures date is valid
   * @param {string} dateStr - Date string in MM/DD/YYYY format
   * @returns {boolean} Whether the date is valid
   */
  validateDate = (dateStr) => {
    const dateRegex = /^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])\/\d{4}$/;
    if (!dateRegex.test(dateStr)) {
      return false;
    }

    const [month, day, year] = dateStr.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    return date instanceof Date && !isNaN(date) &&
           date >= currentDate &&
           date.getMonth() === month - 1 &&
           date.getDate() === day &&
           date.getFullYear() === year;
  };

  /**
   * Handles changes to the date input field
   * @param {Event} e - Input change event
   */
  handleInputChange = (e) => {
    const value = e.target.value;
    this.setState({
      dateInput: value,
      isValidDate: this.validateDate(value),
    });
  };

  /**
   * Sets the check-in date in the Picker component when button is clicked
   */
  handleSetCheckIn = () => {
    const [month, day, year] = this.state.dateInput.split('/').map(Number);
    const date = new Date(year, month - 1, day);
    this.props.pickerRef.current.setCheckin(date);
  };

  /**
   * @returns {object} JSX for the Component
   */
  render() {
    return (
      <div className="entry-container">
        <input
          type="text"
          value={this.state.dateInput}
          onChange={this.handleInputChange}
          placeholder="MM/DD/YYYY"
          aria-label="Enter check in date as MM/DD/YYYY"
        />
        <button
          onClick={this.handleSetCheckIn}
          disabled={!this.state.isValidDate}
        >
          Set Check In
        </button>
      </div>
    );
  }
}

/*
#######################################################################
#######               DO NOT MODIFY BELOW HERE              ###########
#######################################################################
*/

Entry.propTypes = {
  pickerRef: PropTypes.any,
};

export default Entry;
