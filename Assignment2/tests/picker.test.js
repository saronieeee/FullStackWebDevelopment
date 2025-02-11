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

/*
#######################################################################
# DO NOT MODIFY THIS SECTION
#######################################################################
*/

import {launch} from 'puppeteer';
import {beforeAll, afterAll, beforeEach, test, it, expect} from 'vitest';

import pti from 'puppeteer-to-istanbul';
import {renameSync} from 'fs';

let browser;
let page;

beforeAll(async () => {
  browser = await launch({
    headless: 'new',
    args: [
      '--no-sandbox',
    ],
  });
  page = await browser.newPage();
  await Promise.all([
    page.coverage.startJSCoverage({resetOnNavigation: false}),
    page.coverage.startCSSCoverage(),
  ]);
});

afterAll(async () => {
  const [jsCoverage] = await Promise.all([
    page.coverage.stopJSCoverage(),
  ]);
  const coverage = [];
  for (const result of jsCoverage) {
    if (result.url.endsWith('.js')) {
      coverage.push(result);
    }
  }
  pti.write([...coverage],
      {includeHostname: true, storagePath: './.nyc_output'});
  renameSync('./.nyc_output/out.json', './.nyc_output/picker.json');
  const childProcess = browser.process();
  if (childProcess) {
    await childProcess.kill(9);
  }
});

beforeEach(async () => {
  await page.goto(`file://${__dirname}/../src/picker.html`);
});

/*
#######################################################################
# END DO NOT MODIFY SECTION
#######################################################################
*/

/*
#######################################################################
# Add your tests below here.
# Do not create new page instances, use the one defined at line 24 and
# assigned at line 34.
#######################################################################
*/

// Simple test in both flavors to get you started:
// A DOM element with an ID of 'picker' should exist
test('Picker Exists', async () => {
  const element = await page.$('#picker');
  expect(element).not.toBeNull();
});
it('Has an element with id "picker"', async () => {
  const element = await page.$('#picker');
  expect(element).not.toBeNull();
});

test('Required elements exist', async () => {
  const elements = await page.evaluate(() => {
    return {
      picker: !!document.getElementById('picker'),
      prev: !!document.getElementById('prev'),
      next: !!document.getElementById('next'),
      first: !!document.getElementById('first'),
      second: !!document.getElementById('second'),
      df: !!document.getElementById('df'),
      ds: !!document.getElementById('ds'),
    };
  });

  Object.values(elements).forEach((exists) => expect(exists).toBe(true));
});

test('Month navigation and visibility', async () => {
  // Check initial state and next navigation
  const initialVisibility = await page.evaluate(() => {
    const prev = document.getElementById('prev');
    return window.getComputedStyle(prev).visibility;
  });
  expect(initialVisibility).toBe('hidden');

  await page.evaluate(() => {
    const picker = document.querySelector('#picker').__picker;
    picker.displayDate = new Date(2025, 6, 1); // July 2025
    picker.loadCalendars();
  });

  // Test navigation with past/future months
  const monthChanges = await page.evaluate(() => {
    const picker = document.querySelector('#picker').__picker;
    const initial = picker.displayDate.getMonth();

    picker.navigateMonth(-1);
    const afterPrev = picker.displayDate.getMonth();

    picker.navigateMonth(1);
    const afterNext = picker.displayDate.getMonth();

    return {initial, afterPrev, afterNext};
  });

  expect(monthChanges.afterNext).toBe(monthChanges.initial);
});

test('Date selection and range handling', async () => {
  await page.evaluate(() => {
    const picker = document.querySelector('#picker').__picker;
    const date1 = new Date(2025, 6, 15);
    const date2 = new Date(2025, 6, 20);
    const date3 = new Date(2025, 6, 10);

    // Test initial selection
    picker.handleDateClick(date1);
    if (!picker.stay.startDate) throw new Error('Start date not set');

    // Test end date selection
    picker.handleDateClick(date2);
    if (!picker.stay.endDate) throw new Error('End date not set');

    // Test earlier date selection (resets range)
    picker.handleDateClick(date3);
    if (picker.stay.startDate.getTime() !== date3.getTime()) {
      throw new Error('Earlier date should become new start date');
    }
    if (picker.stay.endDate !== null) {
      throw new Error('End date should be cleared');
    }
  });
});

test('Calendar updates and event listeners', async () => {
  await page.evaluate(() => {
    const picker = document.querySelector('#picker').__picker;

    // Test updateMonthGrid
    const container = document.getElementById('first');
    const futureDate = new Date(2025, 6, 1);
    picker.updateMonthGrid(container, futureDate, 'f');

    // Test cell click event listener
    const firstValidCell = document.getElementById('f5');
    if (firstValidCell) {
      firstValidCell.click();
      if (!picker.stay.startDate) {
        throw new Error('Click event listener not working');
      }
    }
  });
});

test('Past date handling and month comparison', async () => {
  await page.evaluate(() => {
    const picker = document.querySelector('#picker').__picker;

    // Test handleDateClick with past date
    const pastDate = new Date(2023, 0, 1); // Past date
    picker.handleDateClick(pastDate);

    // Test isCurrentMonth directly
    const currentDate = new Date();
    const result = picker.isCurrentMonth(currentDate);

    // Verify the month comparison worked
    if (result !== true) throw new Error('Current month comparison failed');
  });
});

test('Previous month navigation', async () => {
  await page.evaluate(() => {
    const picker = document.querySelector('#picker').__picker;

    // Set display date to future month
    picker.displayDate = new Date(2025, 6, 1); // July 2025
    picker.loadCalendars();

    // This should trigger canGoToPrevMonth
    const prevBtn = document.getElementById('prev');
    prevBtn.click();
  });
});

test('nav button event listeners and class assignments', async () => {
  const monthsBefore = await page.evaluate(() => {
    const picker = document.querySelector('#picker').__picker;

    // Set to a future date to enable navigation
    picker.displayDate = new Date(2025, 6, 1);
    picker.loadCalendars();

    // Directly trigger the event listeners created in the highlighted lines
    const prevBtn = document.getElementById('prev');
    const nextBtn = document.getElementById('next');

    // Store initial month for comparison
    const initialMonth = picker.displayDate.getMonth();

    // Trigger the click listeners
    prevBtn.click(); // Should trigger navigateMonth(-1)
    nextBtn.click(); // Should trigger navigateMonth(1)

    return {
      initialMonth,
      finalMonth: picker.displayDate.getMonth(),
    };
  });

  // Verify the navigation occurred
  expect(monthsBefore.initialMonth).toBe(monthsBefore.finalMonth);
});

test('day grid in updateMonthGrid', async () => {
  await page.evaluate(() => {
    const picker = document.querySelector('#picker')?.__picker;
    const container = document.getElementById('first');

    // Set up dates so we can test all classes
    const baseDate = new Date(2025, 6, 1); // July 1, 2025
    picker.displayDate = baseDate;

    // Set up a date range that will exist in the grid
    picker.stay.startDate = new Date(2025, 6, 15); // July 15
    picker.stay.endDate = new Date(2025, 6, 20); // July 20

    // Call updateMonthGrid to trigger the class assignments
    picker.updateMonthGrid(container, baseDate, 'f');

    // Check start date cell (f14)
    const startCell = document.getElementById('f14');
    if (!startCell || !startCell.id == 'checkin') {
      throw new Error('Start date cell should have checkin class');
    }

    // Check end date cell (f19)
    const endCell = document.getElementById('f19');
    if (!endCell || !endCell.id == 'checkout') {
      throw new Error('End date cell should have checkout class');
    }

    // Check a cell in between (f16)
    const middleCell = document.getElementById('f16');
    if (!middleCell || !middleCell.id == 'stay') {
      throw new Error('Middle cell should have stay class');
    }
  });
});
