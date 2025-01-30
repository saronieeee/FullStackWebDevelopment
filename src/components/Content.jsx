import {useMemo, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import mail from '../data/mail.json';
import Email from './Email';
import Box from '@mui/material/Box';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import {useVisual} from '../contexts/VisualContext';

/**
 * Formats the received date according to the requirements
 * @param {string} dateStr - The ISO date string to format
 * @returns {string} The formatted date string based on relative time rules
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const dateOnly = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
  );
  const todayOnly = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
  );
  const yesterdayOnly = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
  );

  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(now.getMonth() - 12);

  if (dateOnly.getTime() === todayOnly.getTime()) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday';
  } else if (date > twelveMonthsAgo) {
    return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
  } else {
    return date.getFullYear().toString();
  }
}

/**
 * Content component displays email list and email viewer
 * @param {object} props - Component properties
 * @param {string} props.mailboxName - Name of the current mailbox to display
 * @returns {object} The rendered Content component
 */
export default function Content({mailboxName}) {
  const {
    isMobile,
    isEmailVisible,
    selectedEmail,
    handleEmailSelection,
    closeEmail,
  } = useVisual();
  const tableContainerRef = useRef(null);
  const prevMailboxRef = useRef(mailboxName);

  const sortedEmails = useMemo(() => {
    const currentMailbox = mail.find((m) => m.name === mailboxName);
    if (!currentMailbox) return [];

    return [...currentMailbox.mail].sort(
        (a, b) => new Date(b.received) - new Date(a.received),
    );
  }, [mailboxName]);

  // Handle mailbox changes
  useEffect(() => {
    if (mailboxName !== prevMailboxRef.current) {
      // Scroll to top
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTop = 0;
      }

      // Select first email in desktop mode only on mailbox change
      if (!isMobile && sortedEmails.length > 0) {
        handleEmailSelection(sortedEmails[0]);
      }
      prevMailboxRef.current = mailboxName;
    }
  }, [mailboxName, sortedEmails, isMobile, handleEmailSelection]);

  // Handle initial load
  useEffect(() => {
    if (!isMobile && sortedEmails.length > 0 && !selectedEmail) {
      handleEmailSelection(sortedEmails[0]);
    }
  }, []);

  if (!mail || mail.length === 0) {
    return <div>No mail data available</div>;
  }

  // Mobile view with email visible
  if (isMobile && isEmailVisible) {
    return (
      <Box sx={{pt: 0}}>
        <Email email={selectedEmail} onClose={closeEmail} />
      </Box>
    );
  }

  return (
    <Box sx={{
      height: isMobile ? '100%' : 'calc(100vh - 64px)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <Box sx={{
        display: 'flex',
        gap: 2,
        flexDirection: isMobile ? 'column' : 'row',
        height: '100%',
        overflow: 'hidden',
      }}>
        <TableContainer
          ref={tableContainerRef}
          component={Paper}
          sx={{
            flex: isMobile ? 1 : 1.5,
            overflow: 'auto',
            maxHeight: '100%',
          }}
        >
          <Table stickyHeader>
            <TableBody>
              {sortedEmails.map((email) => (
                <TableRow
                  key={email.id}
                  onClick={() => handleEmailSelection(email)}
                  hover
                  sx={{cursor: 'pointer'}}
                  selected={selectedEmail?.id === email.id}
                >
                  <TableCell>{email.from.name}</TableCell>
                  <TableCell>{email.subject}</TableCell>
                  <TableCell sx={{whiteSpace: 'nowrap'}}>
                    {formatDate(email.received)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {!isMobile && (
          <Box sx={{
            flex: 1,
            overflow: 'auto',
            maxHeight: '100%',
          }}>
            <Email email={selectedEmail} onClose={closeEmail} />
          </Box>
        )}
      </Box>
    </Box>
  );
}

Content.propTypes = {
  mailboxName: PropTypes.string.isRequired,
};
