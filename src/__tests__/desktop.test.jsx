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

import {it, expect, beforeAll, beforeEach, describe} from 'vitest';
import {render, screen, within} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import loader from '../data/loader';

/**
 * Do not modify this function.
 */
beforeAll(() => {
  loader();
});

// Mock window.innerWidth for desktop view
beforeAll(() => {
  loader();
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  });
  window.dispatchEvent(new Event('resize'));
});

describe('Desktop View Tests', () => {
  beforeEach(() => {
    // Reset to desktop width before each test
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
    window.dispatchEvent(new Event('resize'));
  });

  it('should display the title with current mailbox', () => {
    render(<App />);
    const title = screen.getByText(/CSE186 Mail - Inbox/);
    expect(title).toBeInTheDocument();
  });

  it('should show mailbox list permanently on desktop', () => {
    render(<App />);
    const mailboxList = screen.getByRole('list');
    const inboxButton = screen.getByText('Inbox');
    const importantButton = screen.getByText('Important');
    const trashButton = screen.getByText('Trash');

    expect(mailboxList).toBeInTheDocument();
    expect(inboxButton).toBeInTheDocument();
    expect(importantButton).toBeInTheDocument();
    expect(trashButton).toBeInTheDocument();
  });

  it('should display emails sorted by received date', async () => {
    render(<App />);
    const emailTable = screen.getByRole('table');
    const rows = within(emailTable).getAllByRole('row');

    // Get timestamps from first few rows
    const timestamps = rows.slice(1, 3).map((row) => {
      const cells = within(row).getAllByRole('cell');
      return new Date(cells[2].textContent).getTime();
    });

    // Verify descending order (most recent first)
    expect(timestamps[0]).toBeGreaterThan(timestamps[1]);
  });

  it('should select first email by default in a mailbox', () => {
    render(<App />);
    const firstEmail = screen.getByRole('row', {selected: true});
    expect(firstEmail).toBeInTheDocument();
  });

  it('show email content in right panel when email is selected', async () => {
    const user = userEvent.setup();
    render(<App />);
    const emailRows = screen.getAllByRole('row');
    const secondEmail = emailRows[2]; // First row is header

    await user.click(secondEmail);

    // Check if email content is displayed in right panel
    const fromLabel = screen.getByText(/From:/);
    const toLabel = screen.getByText(/To:/);
    const receivedLabel = screen.getByText(/Received:/);

    expect(fromLabel).toBeInTheDocument();
    expect(toLabel).toBeInTheDocument();
    expect(receivedLabel).toBeInTheDocument();
  });

  it('should format dates correctly based on when email was received', () => {
    render(<App />);
    const emailTable = screen.getByRole('table');
    const cells = within(emailTable).getAllByRole('cell');

    // Find cells containing date information
    const dateCells = cells.filter((cell) => {
      const text = cell.textContent;
      return (
        text.match(/^\d{2}:\d{2}$/) || // Today: "14:30"
        text === 'Yesterday' ||
        text.match(/^[A-Z][a-z]{2} \d{1,2}$/) || // "Jan 15"
        text.match(/^\d{4}$/) // Year: "2023"
      );
    });

    expect(dateCells.length).toBeGreaterThan(0);
  });

  it('switch mailboxes when clicking on mailbox list items', async () => {
    const user = userEvent.setup();
    render(<App />);
    const importantMailbox = screen.getByText('Important');

    await user.click(importantMailbox);

    // Verify mailbox switch
    expect(screen.getByText(/CSE186 Mail - Important/)).toBeInTheDocument();
  });

  it('should select first email when switching mailboxes', async () => {
    const user = userEvent.setup();
    render(<App />);
    const importantMailbox = screen.getByText('Important');

    await user.click(importantMailbox);

    // Verify first email is selected
    const rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveAttribute('aria-selected', 'true');

    // Verify email content is displayed
    const fromLabel = screen.getByText(/From:/);
    expect(fromLabel).toBeInTheDocument();
  });
});
