import {useState, useEffect, JSX} from 'react';
import {Box, BottomNavigation, BottomNavigationAction,
  useMediaQuery, useTheme} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import ChatIcon from '@mui/icons-material/Chat';
import AlternateEmailIcon from '@mui/icons-material/AlternateEmail';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import {useNavigate, useLocation} from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Mobile bottom navigation component that only renders on mobile devices
 * @param {object} props Component props
 * @param {string} props.currentView Current view name
 * @param {Function} props.onViewChange Callback when view changes
 * @returns {JSX.Element|null} Mobile navigation or null on desktop
 */
const MobileNavigation = ({currentView, onViewChange}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Map views to navigation values
  const viewToValue = {
    home: 0,
    messages: 1,
    mentions: 2,
    search: 3,
    profile: 4,
  };

  const [value, setValue] = useState(() => {
    // Set initial value based on current view
    return viewToValue[currentView] || 0;
  });

  // Update value when currentView changes
  useEffect(() => {
    setValue(viewToValue[currentView] || 0);
  }, [currentView]);

  // Update value when URL changes
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setValue(0);
    else if (path === '/messages') setValue(1);
    else if (path === '/mentions') setValue(2);
    else if (path === '/search') setValue(3);
    else if (path === '/profile') setValue(4);
  }, [location.pathname]);

  const handleChange = (event, newValue) => {
    setValue(newValue);

    // Map navigation values back to views
    const valueToView = {
      0: 'home',
      1: 'messages',
      2: 'mentions',
      3: 'search',
      4: 'profile',
    };

    const newView = valueToView[newValue];
    onViewChange(newView);

    // Navigate to corresponding route
    switch (newValue) {
      case 0:
        navigate('/');
        break;
      case 1:
        navigate('/messages');
        break;
      case 2:
        navigate('/mentions');
        break;
      case 3:
        navigate('/search');
        break;
      case 4:
        navigate('/profile');
        break;
      default:
        navigate('/');
    }
  };

  // Only render on mobile devices
  if (!isMobile) {
    return null;
  }

  return (
    <Box sx={{width: '100%', position: 'fixed', bottom: 0, zIndex: 1100}}>
      <BottomNavigation
        value={value}
        onChange={handleChange}
        showLabels
      >
        <BottomNavigationAction label="Home" icon={<HomeIcon />} />
        <BottomNavigationAction label="DMs" icon={<ChatIcon />} />
        <BottomNavigationAction label="Mentions" icon={
          <AlternateEmailIcon />} />
        <BottomNavigationAction label="Search" icon={<SearchIcon />} />
        <BottomNavigationAction label="Profile" icon={<AccountCircleIcon />} />
      </BottomNavigation>
    </Box>
  );
};

MobileNavigation.propTypes = {
  currentView: PropTypes.string.isRequired,
  onViewChange: PropTypes.func.isRequired,
};

export default MobileNavigation;
