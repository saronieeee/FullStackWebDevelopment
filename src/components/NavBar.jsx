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
import Drawer from '@mui/material/Drawer';
import {useVisual} from '../contexts/VisualContext';

/**
 * Navigation bar component
 * @param {object} props - Component properties
 * @param {Function} props.onMailboxSelect - Callback for mailbox selection
 * @param {string} props.currentMailbox - Currently selected mailbox
 * @returns {object} The rendered NavBar component
 */
export default function BasicList({onMailboxSelect, currentMailbox}) {
  const {isMobile, isMenuVisible, toggleMenu} = useVisual();

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
    if (isMobile) {
      toggleMenu();
    }
  };

  const mailboxList = (
    <List sx={{pt: 0}}>
      {mailboxes.map((mailbox) => (
        <ListItem key={mailbox.name} disablePadding>
          <ListItemButton
            selected={currentMailbox === mailbox.name}
            onClick={() => handleMailboxClick(mailbox.name)}
            sx={{
              // Match the height of table cells
              minHeight: '53px',
              px: 2,
            }}
          >
            <ListItemIcon>
              {mailbox.icon}
            </ListItemIcon>
            <ListItemText
              primary={mailbox.name}
              primaryTypographyProps={{
                sx: {fontSize: '0.875rem'},
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={isMenuVisible}
        onClose={toggleMenu}
        sx={{
          '& .MuiDrawer-paper': {
            width: 240,
            marginTop: '64px',
            height: 'calc(100% - 64px)',
          },
        }}
      >
        {mailboxList}
      </Drawer>
    );
  }

  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      {mailboxList}
    </Box>
  );
}

BasicList.propTypes = {
  onMailboxSelect: PropTypes.func.isRequired,
  currentMailbox: PropTypes.string.isRequired,
};
