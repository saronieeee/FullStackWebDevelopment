import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/Inbox';
import ImportantIcon from '@mui/icons-material/Mail';
import TrashIcon from '@mui/icons-material/Delete';

/**
 * @param {object} props - Component properties
 * @param {Function} props.onMailboxSelect -handles mailbox selection
 * @param {string} props.currentMailbox - Currently selected mailbox
 * @returns {object} - the rendered NavBar component
 */
export default function BasicList({onMailboxSelect, currentMailbox}) {
  const mailboxes = [
    {name: 'Inbox', icon: <InboxIcon />},
    {name: 'Important', icon: <ImportantIcon />},
    {name: 'Trash', icon: <TrashIcon />},
  ];

  const handleMailboxClick = (mailboxName) => {
    onMailboxSelect(mailboxName);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <Box sx={{width: '100%', maxWidth: 360, bgcolor: 'background.paper',
      position: 'sticky', top: '90px', maxHeight: 'calc(100vh - 64px)',
      overflow: 'auto'}}>
      <nav aria-label="main mailbox folders">
        <List>
          {mailboxes.map((mailbox) => (
            <ListItem key={mailbox.name} disablePadding>
              <ListItemButton
                selected={currentMailbox === mailbox.name}
                onClick={() => handleMailboxClick(mailbox.name)}
              >
                <ListItemIcon>
                  {mailbox.icon}
                </ListItemIcon>
                <ListItemText primary={mailbox.name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </nav>
    </Box>
  );
}

BasicList.propTypes = {
  onMailboxSelect: PropTypes.func.isRequired,
  currentMailbox: PropTypes.string.isRequired,
};
