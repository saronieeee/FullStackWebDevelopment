import {useState, useMemo, useEffect} from 'react';
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

/**
 * Formats the received date according to the requirements
 * @param {string} dateStr - ISO date string
 * @returns {string} Formatted date string
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  // Remove time component for date comparisons
  const dateOnly=new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const todayOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayOnly = new Date(yesterday.getFullYear(),
      yesterday.getMonth(), yesterday.getDate());

  // Set 12 months ago date for comparison
  const twelveMonthsAgo = new Date(now);
  twelveMonthsAgo.setMonth(now.getMonth() - 12);

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return date.toLocaleTimeString([], {
      hour: '2-digit', minute: '2-digit', hour12: false});
  } else if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday';
  } else if (date > twelveMonthsAgo) {
    return date.toLocaleDateString([], {month: 'short', day: 'numeric'});
  } else {
    return date.getFullYear().toString();
  }
}
/**
 * @param {object} props - Component properties
 * @param {string} props.mailboxName - Name of the current mailbox
 * @returns {object} - the rendered Content component
 */
export default function Content({mailboxName}) {
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  }, [selectedEmail]);

  const sortedEmails = useMemo(() => {
    // Find the current mailbox
    const currentMailbox = mail.find((m) => m.name === mailboxName);
    if (!currentMailbox) return [];

    // Sort emails from current mailbox
    return [...currentMailbox.mail].sort((a, b) =>
      new Date(b.received) - new Date(a.received),
    );
  }, [mailboxName]);

  if (!mail || mail.length === 0) {
    return <div>No mail data available</div>;
  }

  const handleEmailClick = (email) => {
    setSelectedEmail(email);
  };

  return (
    <Box>
      <Box sx={{display: 'flex', gap: 2}}>
        <TableContainer component={Paper} sx={{flex: 1.5}}>
          <Table>
            <TableBody>
              {sortedEmails.map((email) => (
                <TableRow
                  key={email.id}
                  onClick={() => handleEmailClick(email)}
                  hover
                  sx={{cursor: 'pointer'}}
                  selected={selectedEmail?.id === email.id}
                >
                  <TableCell>{email.from.name}</TableCell>
                  <TableCell>{email.subject}</TableCell>
                  <TableCell>
                    {formatDate(email.received)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{flex: 1, position: 'sticky', top: '80px',
          maxHeight: 'calc(100vh - 96px)', overflow: 'auto'}}>
          <Email
            email={selectedEmail}
            onClose={() => setSelectedEmail(null)}
          />
        </Box>
      </Box>
    </Box>
  );
}

Content.propTypes = {
  mailboxName: PropTypes.string.isRequired,
};
