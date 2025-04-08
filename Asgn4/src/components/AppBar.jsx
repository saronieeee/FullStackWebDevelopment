import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import {useVisual} from '../contexts/VisualContext';

/**
 * This component was inspired by MUI
 * https://mui.com/material-ui/react-app-bar/
 * Primarily the formatting and code for return
 */

/**
 * Application bar component
 * @returns {object} The rendered AppBar component
 */
export default function ButtonAppBar() {
  const {
    isMobile,
    isMenuVisible,
    toggleMenu,
    currentMailbox,
  } = useVisual();

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
            CSE186 Mail - {currentMailbox}
          </Typography>
        </Toolbar>
      </AppBar>
      <Toolbar />
    </Box>
  );
}
