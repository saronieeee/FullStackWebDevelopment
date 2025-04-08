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


import {it, beforeAll, beforeEach, expect} from 'vitest';
import {render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';
import mail from '../data/mail.json';
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

it('should show mailboxes when menu clicked', async () => {
  const user = userEvent.setup();
  render(<App />);

  // Find and click menu button
  const menuButton = screen.getByLabelText('show mailboxes');
  await user.click(menuButton);

  // Verify mailboxes are shown
  expect(screen.getByText('Important')).toBeInTheDocument();
  expect(screen.getByText('Trash')).toBeInTheDocument();

  // Verify menu button label changes
  expect(menuButton).toHaveAttribute('aria-label', 'hide mailboxes');
});

it('should show email content when email clicked', async () => {
  const user = userEvent.setup();
  render(<App />);

  // Get first email from data and sort by date
  const inboxData = mail.find((m) => m.name === 'Inbox').mail;
  const sortedEmails = [...inboxData].sort(
      (a, b) => new Date(b.received) - new Date(a.received),
  );
  const expectedFirstEmail = sortedEmails[0];

  // Find and click first email
  const emailRows = screen.getAllByRole('row');
  await user.click(emailRows[0]);

  // Verify email content is shown by finding the subject typography
  const subjectElement = screen.getByText(expectedFirstEmail.subject);
  expect(subjectElement).toBeInTheDocument();

  // Verify close button is shown
  expect(screen.getByLabelText('close mail reader')).toBeInTheDocument();
});

it('should return to email list when close button clicked', async () => {
  const user = userEvent.setup();
  render(<App />);

  // Find and click first email
  const emailRows = screen.getAllByRole('row');
  await user.click(emailRows[1]);

  // Find and click close button
  const closeButton = screen.getByLabelText('close mail reader');
  await user.click(closeButton);

  // Verify first email subject is visible again in list
  const inboxData = mail.find((m) => m.name === 'Inbox').mail;
  const sortedEmails = [...inboxData].sort(
      (a, b) => new Date(b.received) - new Date(a.received),
  );
  expect(screen.getByText(sortedEmails[0].subject)).toBeInTheDocument();
});

it('toggle menu button label when clicking without selection', async () => {
  const user = userEvent.setup();
  render(<App />);

  // Show mailboxes
  const menuButton = screen.getByLabelText('show mailboxes');
  await user.click(menuButton);
  expect(menuButton).toHaveAttribute('aria-label', 'hide mailboxes');

  // Click menu again without selecting mailbox
  await user.click(menuButton);
  expect(menuButton).toHaveAttribute('aria-label', 'show mailboxes');
});

it('should switch mailboxes and hide menu when mailbox selected', async () => {
  const user = userEvent.setup();
  render(<App />);

  // Show mailboxes and select Important
  const menuButton = screen.getByLabelText('show mailboxes');
  await user.click(menuButton);
  await user.click(screen.getByText('Important'));

  // Verify mailbox switched by checking first email content
  const importantData = mail.find((m) => m.name === 'Important').mail;
  const sortedEmails = [...importantData].sort(
      (a, b) => new Date(b.received) - new Date(a.received),
  );
  expect(screen.getByText(sortedEmails[0].subject)).toBeInTheDocument();
});

it('should hide email viewer when menu clicked in mobile view', async () => {
  const user = userEvent.setup();
  render(<App />);

  // Get the first email data to verify against
  const inboxData = mail.find((m) => m.name === 'Inbox').mail;
  const sortedEmails = [...inboxData].sort(
      (a, b) => new Date(b.received) - new Date(a.received),
  );
  const expectedFirstEmail = sortedEmails[0];

  // Find and click the first email subject
  const emailSubject = screen.getByText(expectedFirstEmail.subject);
  await user.click(emailSubject);

  // Verify email is visible by checking for close button
  expect(screen.getByLabelText('close mail reader')).toBeInTheDocument();

  // Click the menu button
  const menuButton = screen.getByLabelText('show mailboxes');
  await user.click(menuButton);

  // Verify email viewer is hidden by checking that close button is gone
  expect(screen.queryByLabelText('close mail reader')).not.toBeInTheDocument();

  // Verify we're back to the list by checking for the email subject
  expect(screen.getByText(expectedFirstEmail.subject)).toBeInTheDocument();
});
