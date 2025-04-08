import {describe, it, beforeEach, afterEach, expect, vi}
  from 'vitest';
import {render, fireEvent, screen, waitFor}
  from '@testing-library/react';
import App from '../App.jsx';
import axios from 'axios';

// Mock axios globally.
vi.mock('axios');

describe('App Failure Conditions', () => {
  beforeEach(() => {
    // Spy on console.error so we can assert error messages.
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
  });

  it('does not allow deletion when in Trash', async () => {
    // For this test, we set up the mocks:
    axios.get.mockImplementation((url, config) => {
      if (url.endsWith('/mailbox')) {
        return Promise.resolve({data: ['Inbox', 'Sent', 'Trash']});
      }
      if (url.endsWith('/mail')) {
        // If mailbox is Trash, return one dummy email.
        if (config.params.mailbox.toLowerCase() === 'trash') {
          return Promise.resolve({
            data: [{
              id: '1',
              from: {name: 'Alice', address: 'alice@example.com'},
              to: {name: 'Bob', address: 'bob@example.com'},
              subject: 'Test Email',
              content: 'Content',
              received: '2022-06-27T12:00:00.000Z',
            }],
          });
        }
        return Promise.resolve({data: []});
      }
      return Promise.reject(new Error('Unknown URL'));
    });
    axios.put.mockResolvedValue({});
  });

  it('logs error when axios.get fails for mailboxes', async () => {
    axios.get.mockRejectedValue(new Error('Failed to fetch'));

    render(<App />);
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
          'Error fetching mailboxes:',
          expect.any(Error),
      );
    });
  });

  it('logs error when axios.get fails for emails', async () => {
    axios.get.mockImplementation((url, config) => {
      if (url.endsWith('/mailbox')) {
        return Promise.resolve({data: ['Inbox']});
      }
      if (url.endsWith('/mail')) {
        return Promise.reject(new Error('Failed to fetch emails'));
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<App />);
    await waitFor(() => {
      expect(console.error).toHaveBeenCalledWith(
          'Error fetching emails:',
          expect.any(Error),
      );
    });
  });

  it('calls axios.put when deleting an email in Inbox', async () => {
    axios.get.mockImplementation((url, config) => {
      if (url.endsWith('/mailbox')) {
        return Promise.resolve({data: ['Inbox', 'Sent', 'Trash']});
      }
      if (url.endsWith('/mail')) {
        if (config.params.mailbox.toLowerCase() === 'inbox') {
          return Promise.resolve({
            data: [{
              id: '1',
              from: {name: 'Alice', address: 'alice@example.com'},
              to: {name: 'Bob', address: 'bob@example.com'},
              subject: 'Hello',
              content: 'Hello World',
              received: '2022-06-27T12:00:00.000Z',
            }],
          });
        }
        return Promise.resolve({data: []});
      }
      return Promise.reject(new Error('Unknown URL'));
    });
    axios.put.mockResolvedValue({});

    render(<App />);
    // Wait for Inbox email to load.
    const deleteButton = await screen.findByRole('button', {
      name: /Delete mail from Alice received/i,
    });
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
          expect.stringContaining('/mail/1'),
          null,
          {params: {mailbox: 'Trash'}},
      );
    });
  });
});
describe('App Coverage Tests', () => {
  beforeEach(() => {
    // Reset mocks before each test.
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('handles empty emails (sets selectedEmail to null)', async () => {
    // When mailbox is 'inbox', return empty emails.
    axios.get.mockImplementation((url, config) => {
      if (url.endsWith('/mailbox')) {
        return Promise.resolve({data: ['Inbox', 'Sent', 'Trash']});
      }
      if (url.endsWith('/mail')) {
        return Promise.resolve({data: []});
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<App />);
    // Wait for emails useEffect to run
    await waitFor(() => {
      // Check that the header shows "Inbox" and that no email is selected.
      expect(
          screen.getByText(/CSE186 Full Stack Mail - Inbox/i),
      ).toBeInTheDocument();
      // Because there are no emails, the content pane should prompt selection.
      expect(screen.getByText(/Select an email to read/i))
          .toBeInTheDocument();
    });
  });

  it('handles error in fetching mailboxes', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockRejectedValue(new Error('Mailbox fetch failed'));

    render(<App />);
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
          'Error fetching mailboxes:',
          expect.any(Error),
      );
    });
  });

  it('handles error in fetching emails', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    axios.get.mockImplementation((url, config) => {
      if (url.endsWith('/mailbox')) {
        return Promise.resolve({data: ['Inbox']});
      }
      if (url.endsWith('/mail')) {
        return Promise.reject(new Error('Emails fetch failed'));
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<App />);
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
          'Error fetching emails:',
          expect.any(Error),
      );
    });
  });
});
