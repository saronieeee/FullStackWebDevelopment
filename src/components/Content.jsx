import {useMemo, useEffect} from 'react';
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

  const dateOnly = new Date(date.getFullYear(),
      date.getMonth(), date.getDate());
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(),
      yesterday.getMonth(), yesterday.getDate());

  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(now.getMonth() - 12);

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
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

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [selectedEmail]);

  const sortedEmails = useMemo(() => {
    const currentMailbox = mail.find((m) => m.name === mailboxName);
    if (!currentMailbox) return [];

    return [...currentMailbox.mail].sort((a, b) =>
      new Date(b.received) - new Date(a.received),
    );
  }, [mailboxName]);

  if (!mail || mail.length === 0) {
    return <div>No mail data available</div>;
  }

  // Mobile view with email visible
  if (isMobile && isEmailVisible) {
    return (
      <Box sx={{p: 2}}>
        <Email email={selectedEmail} onClose={closeEmail} />
      </Box>
    );
  }

  // Default view (desktop or mobile email list)
  return (
    <Box>
      <Box sx={{display: 'flex', gap: 2,
        flexDirection: isMobile ? 'column' : 'row'}}>
        <TableContainer component={Paper} sx={{flex: isMobile ? 1 : 1.5}}>
          <Table>
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
                  <TableCell>{formatDate(email.received)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {!isMobile && (
          <Box sx={{
            flex: 1,
            position: 'sticky',
            top: '90px',
            maxHeight: 'calc(100vh - 96px)',
            overflow: 'auto',
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
