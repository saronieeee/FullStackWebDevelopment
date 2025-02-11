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
/**
 * CSE186 Assignment 2
 */

/* eslint-disable-next-line */
class Picker {
  /**
   * Create an AirBnB style date range picker
   * @param {string} containerId id of a node the Picker will be a child of
   */
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    document.querySelector('#picker').__picker = this;
    this.currentDate = new Date();
    this.displayDate = new Date();
    this.stay = {
      startDate: null,
      endDate: null,
    };

    // initialize months array
    this.months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];

    // initialize picker -> calendar
    this.createCalendar();
  }

  createCalendar() {
    // main elements of calendar
    /*
      header:
        nav buttons
        month
        year

      body:
        days of week
        days of month
    */


    // create main container
    const pickerContainer = document.createElement('div');
    pickerContainer.classList.add('picker-container');

    // header section

    // nav buttons
    const prevButton = document.createElement('button');
    prevButton.id = 'prev';
    prevButton.style.visibility = 'hidden';
    prevButton.addEventListener('click', () => this.navigateMonth(-1));

    const nextButton = document.createElement('button');
    nextButton.id = 'next';
    nextButton.addEventListener('click', () => this.navigateMonth(1));

    // calendar month container
    const firstMonth = document.createElement('div');
    firstMonth.id = 'first';
    const secondMonth = document.createElement('div');
    secondMonth.id = 'second';

    // calendar month headers
    const firstMonthHeader = document.createElement('div');
    firstMonthHeader.id = 'df';
    const secondMonthHeader = document.createElement('div');
    secondMonthHeader.id = 'ds';

    // add headers to month containers
    firstMonth.appendChild(firstMonthHeader);
    secondMonth.appendChild(secondMonthHeader);

    // add weekday headers
    const weekdays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
    [firstMonth, secondMonth].forEach((monthContainer) => { 
      const weekHeader = document.createElement('div');
      weekHeader.classList.add('weekday-header');
      weekdays.forEach((day) => {
        const dayHeader = document.createElement('div');
        dayHeader.textContent = day;
        weekHeader.appendChild(dayHeader);
      });
      monthContainer.appendChild(weekHeader);
    });

    // create day grid
    ['f', 's'].forEach((prefix, index) => {
      const container = index === 0 ? firstMonth : secondMonth;
      const gridContainer = document.createElement('div');
      gridContainer.classList.add('calendar-grid');

      for (let i = 0; i < 42; i++) {
        const day = document.createElement('div');
        day.id = `${prefix}${i}`;
        gridContainer.appendChild(day);
      }
      container.appendChild(gridContainer);
    });

    // add all elements to main picker container
    pickerContainer.appendChild(prevButton);
    pickerContainer.appendChild(firstMonth);
    pickerContainer.appendChild(secondMonth);
    pickerContainer.appendChild(nextButton);
    this.container.appendChild(pickerContainer);

    // load calendar information
    this.loadCalendars();
  }

  loadCalendars() {
    // get current information elements
    const firstMonth = document.getElementById('first');
    const secondMonth = document.getElementById('second');
    const firstHeader = document.getElementById('df');
    const secondHeader = document.getElementById('ds');

    // update month headers
    const firstDate = new Date(this.displayDate);
    const secondDate = new Date(firstDate);
    secondDate.setMonth(firstDate.getMonth() + 1);

    firstHeader.textContent =
      `${this.months[firstDate.getMonth()]} ${firstDate.getFullYear()}`;
    secondHeader.textContent =
      `${this.months[secondDate.getMonth()]} ${secondDate.getFullYear()}`;

    // update month grid
    this.updateMonthGrid(firstMonth, firstDate, 'f');
    this.updateMonthGrid(secondMonth, secondDate, 's');

    // display settings for prev button
    document.getElementById('prev').style.visibility =
      this.canGoToPrevMonth() ? 'visible' : 'hidden';
  }

  updateMonthGrid(container, date, prefix) {
    // get current date information, such as days in a month
    // and the index of the first day of the month
    const daysInMonth = new Date(
      date.getFullYear(),
      date.getMonth() + 1,
      0,
    ).getDate();
    const firstDay = new Date(
      date.getFullYear(),
      date.getMonth(),
      1,
    ).getDay();

    // use a loop to populate the grid
    for (let i = 0; i < 42; i++) {
      // get each day element
      const day = document.getElementById(`${prefix}${i}`);
      day.className = '';
      day.textContent = '';

      // calculate day number
      const dayNumber = i - firstDay + 1;
      if (i >= firstDay && dayNumber <= daysInMonth) {
        day.textContent = dayNumber;

        const cellDate = new Date(
          date.getFullYear(),
          date.getMonth(),
          dayNumber,
        );

        // depending on date, add class to day element
        if (cellDate >= this.currentDate || this.isSelectedDate(cellDate)) {
          day.addEventListener('click',
            () => this.handleDateClick(cellDate));

          // Modify this part to ensure start date gets 'checkin' class
          if (this.isStartDate(cellDate)) {
            day.classList.add('checkin');
          } else if (this.isEndDate(cellDate)) {
            day.classList.add('checkout');
          } else if (this.isInRange(cellDate)) {
            day.classList.add('stay');
          }
        } else {
          day.classList.add('disabled');
        }
      }
    }
  }

  handleDateClick(date) {
    // if date clicked is before current day (past), return
    if (date < this.currentDate) {
      return;
    }

    // determines whether to change startDate or endDate based on day clicked
    if (!this.stay.startDate || date < this.stay.startDate) {
      this.stay.startDate = date;
      this.stay.endDate = null;
    } else if (date > this.stay.startDate) {
      this.stay.endDate = date;
    }

    // reload calendar with new info set
    this.loadCalendars();
  }

  // go to the prev or next month depending on direction (-1 or +1)
  // indicated
  navigateMonth(direction) {
    if (direction < 0) {
      const proposedDate = new Date(this.displayDate);
      proposedDate.setMonth(proposedDate.getMonth() + direction);

      if (proposedDate.getMonth() >= this.currentDate.getMonth() &&
        proposedDate.getFullYear() >= this.currentDate.getFullYear()) {
        this.displayDate = proposedDate;
        this.loadCalendars();
      }
    } else {
      this.displayDate.setMonth(this.displayDate.getMonth() + direction);
      this.loadCalendars();
    }
  }

  // helper boolean functions

  isCurrentMonth(date) {
    const current = new Date(this.currentDate);
    return date.getMonth() === current.getMonth() &&
      date.getFullYear() === current.getFullYear();
  }

  canGoToPrevMonth() {
    const prevMonth = new Date(this.displayDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    return prevMonth.getMonth() >= this.currentDate.getMonth() &&
      prevMonth.getFullYear() >= this.currentDate.getFullYear();
  }

  isStartDate(date) {
    return this.stay.startDate &&
      date.getTime() === this.stay.startDate.getTime();
  }

  isEndDate(date) {
    return this.stay.endDate &&
      date.getTime() === this.stay.endDate.getTime();
  }

  isInRange(date) {
    return this.stay.startDate && this.stay.endDate &&
      date > this.stay.startDate && date < this.stay.endDate;
  }

  isSelectedDate(date) {
    return this.isStartDate(date) || this.isEndDate(date) || this.isInRange(date);
  }
}
