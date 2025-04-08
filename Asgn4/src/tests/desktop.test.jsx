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
import mail from '../data/mail.json';

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

    // Get the Inbox data and sort by date
    const inboxData = mail.find((m) => m.name === 'Inbox').mail;
    const sortedEmails = [...inboxData].sort(
        (a, b) => new Date(b.received) - new Date(a.received),
    );

    // Get the first two emails displayed
    const rows = screen.getAllByRole('row');
    const firstRowSubject = within(rows[1]).getAllByRole('cell')[1];
    const secondRowSubject = within(rows[2]).getAllByRole('cell')[1];

    // Verify they match the sorted order from our data
    expect(firstRowSubject).toHaveTextContent(sortedEmails[1].subject);
    expect(secondRowSubject).toHaveTextContent(sortedEmails[2].subject);
  });

  it('should select first email by default in a mailbox', () => {
    render(<App />);

    // Get the Inbox data (default mailbox) and sort by date
    const inboxData = mail.find((m) => m.name === 'Inbox').mail;
    const sortedEmails = [...inboxData].sort(
        (a, b) => new Date(b.received) - new Date(a.received),
    );
    const expectedFirstEmail = sortedEmails[0];

    // Verify the selected email content matches the first email
    const fromLine =
    `From: ${expectedFirstEmail.from.name}` +
    ` <${expectedFirstEmail.from.address}>`;
    expect(screen.getByText(fromLine)).toBeInTheDocument();
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

    // Get the Important mailbox and click it
    const importantMailbox = screen.getByText('Important');
    await user.click(importantMailbox);

    // Get the Important mailbox data and sort it by received date descending
    const importantData = mail.find((m) => m.name === 'Important').mail;
    const sortedEmails = [...importantData].sort(
        (a, b) => new Date(b.received) - new Date(a.received),
    );
    const expectedFirstEmail = sortedEmails[0];

    // Verify the selected email content matches the first email
    const fromLine =
    `From: ${expectedFirstEmail.from.name}` +
    ` <${expectedFirstEmail.from.address}>`;
    expect(screen.getByText(fromLine)).toBeInTheDocument();
  });
});
