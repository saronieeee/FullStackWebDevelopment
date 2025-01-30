import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import PropTypes from 'prop-types';
import {useVisual} from '../contexts/VisualContext';

/**
 * Application bar component
 * @param {object} props - Component properties
 * @param {string} props.mailbox - Name of current mailbox to display
 * @returns {object} The rendered AppBar component
 */
export default function ButtonAppBar({mailbox}) {
  const {isMobile, isMenuVisible, toggleMenu} = useVisual();

  return (
    <Box sx={{flexGrow: 1}}>
      <AppBar position="fixed" sx={{zIndex: 1300}}>
        <Toolbar>
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label={isMenuVisible ? 'hide mailboxes' : 'show mailboxes'}
              onClick={toggleMenu}
              sx={{mr: 2}}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
            CSE186 Mail - {mailbox}
          </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar /> {/* Spacer for fixed AppBar */}
    </Box>
  );
}

ButtonAppBar.propTypes = {
  mailbox: PropTypes.string.isRequired,
};
