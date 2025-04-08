import {useMemo, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import mail from '../data/mail.json';
import Box from '@mui/material/Box';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import {useVisual} from '../contexts/VisualContext';

/**
 * Formats the received date for the list view
 * @param {string} dateStr - The ISO date string to format
 * @returns {string} The formatted date string based on relative time rules
 */
function formatListDate(dateStr) {
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
 * Formats the date for the email detail view
 * @param {string} dateStr - The date string to format
 * @returns {string} Formatted date string
 */
function formatEmailDate(dateStr) {
  const date = new Date(dateStr);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleString('default', {month: 'long'});
  const year = date.getFullYear();

  return `${month} ${day}, ${year} at ${hours}:${minutes}`;
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
    currentMailbox,
  } = useVisual();
  const tableContainerRef = useRef(null);
  const prevMailboxRef = useRef(mailboxName);

  const sortedEmails = useMemo(() => {
    const mailboxData = mail.find((m) => m.name === currentMailbox);
    return [...mailboxData.mail].sort(
        (a, b) => new Date(b.received) - new Date(a.received),
    );
  }, [currentMailbox]);

  // Handle mailbox changes
  useEffect(() => {
    if (currentMailbox !== prevMailboxRef.current) {
      if (tableContainerRef.current) {
        tableContainerRef.current.scrollTop = 0;
      }

      if (!isMobile && sortedEmails.length > 0) {
        handleEmailSelection(sortedEmails[0]);
      }
      prevMailboxRef.current = currentMailbox;
    }
  }, [currentMailbox, sortedEmails, isMobile, handleEmailSelection]);

  useEffect(() => {
    if (!isMobile && sortedEmails.length > 0 && !selectedEmail) {
      handleEmailSelection(sortedEmails[0]);
    }
  }, []);

  const renderEmailViewer = () => {
    if (!selectedEmail) {
      return (
        <Box sx={{p: 2, textAlign: 'center', color: 'text.secondary'}}>
          Select an email to read
        </Box>
      );
    }

    /**
     * For the email viewer, I referenced MUI's paper component
     * to make the viewer styling pop out
     * https://mui.com/material-ui/react-paper/
     */

    return (
      <Paper sx={{
        p: 2, position: 'relative', mt: 0,
        height: '100vh',
      }}>
        {isMobile && (
          <IconButton
            onClick={closeEmail}
            aria-label="close mail reader"
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              zIndex: 1,
            }}
          >
            <CloseIcon />
          </IconButton>
        )}
        <Typography variant="h6" gutterBottom>
          {selectedEmail.subject}
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          From: {selectedEmail.from.name} &lt;{selectedEmail.from.address}&gt;
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          To: {selectedEmail.to.name} &lt;{selectedEmail.to.address}&gt;
        </Typography>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Received: {formatEmailDate(selectedEmail.received)}
        </Typography>
        <Box sx={{mt: 2}}>
          <Typography variant="body1" style={{whiteSpace: 'pre-line'}}>
            {selectedEmail.content}
          </Typography>
        </Box>
      </Paper>
    );
  };

  if (isMobile && isEmailVisible) {
    return <Box sx={{pt: 0}}>{renderEmailViewer()}</Box>;
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
                  selected={selectedEmail?.received === email.received}
                >
                  <TableCell>{email.from.name}</TableCell>
                  <TableCell>{email.subject}</TableCell>
                  <TableCell sx={{whiteSpace: 'nowrap'}}>
                    {formatListDate(email.received)}
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
            {renderEmailViewer()}
          </Box>
        )}
      </Box>
    </Box>
  );
}

Content.propTypes = {
  mailboxName: PropTypes.string.isRequired,
};
