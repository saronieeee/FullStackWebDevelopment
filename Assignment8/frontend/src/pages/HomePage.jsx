import {useState, useEffect, JSX} from 'react';
import {
  Box,
  Typography,
  Drawer,
  Divider,
  useMediaQuery,
  useTheme,
  CircularProgress,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../contexts/AuthContext';
import WorkspaceList from '../components/WorkspaceList';
import ChannelList from '../components/ChannelList';
import ResponsiveHeader from '../components/ResponsiveHeader';
import MobileNavigation from '../components/MobileNavigation';
import ResponsiveMessageList from '../components/MessageList';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/Person';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import api from '../services/api';
import PropTypes from 'prop-types';

/**
 * HomePage component with modular responsive design
 * @param {object} props Component props
 * @param {string} props.initialView Initial view to display
 * @returns {JSX.Element} HomePage component
 */
const HomePage = ({initialView = 'home'}) => {
  const {user, logout} = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for navigation and selections
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [selectedDM, setSelectedDM] = useState(null);
  const [workspaceName, setWorkspaceName] = useState('');
  const [channelName, setChannelName] = useState('');
  const [currentView, setCurrentView] = useState(initialView);

  // State for collapsible sections
  const [channelsExpanded, setChannelsExpanded] = useState(true);
  const [dmsExpanded, setDmsExpanded] = useState(true);

  // State for data
  const [workspaces, setWorkspaces] = useState([]);
  const [channels, setChannels] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch workspaces on mount
  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        console.log('HomePage: Fetching workspaces and user data');
        setLoading(true);

        // Fetch workspaces
        const workspacesResponse = await api.workspaces.getAll();
        const fetchedWorkspaces = workspacesResponse.data.workspaces || [];
        console.log('HomePage: Workspaces fetched:', fetchedWorkspaces.length);
        setWorkspaces(fetchedWorkspaces);

        // Load user preferences
        const userResponse = await api.users.getCurrentUser();
        const {preferences} = userResponse.data;
        console.log('HomePage: User preferences fetched:', preferences);

        // Set the last selected workspace and channel if available
        if (preferences?.lastWorkspace) {
          setSelectedWorkspace(preferences.lastWorkspace);
        } else if (fetchedWorkspaces.length > 0) {
          // Default to first workspace if no preference
          setSelectedWorkspace(fetchedWorkspaces[0].id);
        }

        if (preferences?.lastChannel) {
          setSelectedChannel(preferences.lastChannel);
        }
      } catch (err) {
        console.error('HomePage: Error fetching workspaces:', err);
        setError('Failed to load workspaces');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();

    // Mock direct messages data
    setDirectMessages([
      {id: 'dm1', name: 'Dr. Harrison (you)', online: true},
      {id: 'dm2', name: 'Bob Dylan', online: false},
      {id: 'dm3', name: 'Carole King', online: true},
      {id: 'dm4', name: 'George Harrison', online: false},
      {id: 'dm5', name: 'Joni Mitchell', online: false},
    ]);
  }, []);

  // Update user preferences when workspace or channel changes
  useEffect(() => {
    const updatePreferences = async () => {
      if (!user || !selectedWorkspace) return;

      try {
        console.log('HomePage: Updating user preferences:', {
          lastWorkspace: selectedWorkspace,
          lastChannel: selectedChannel || null,
        });

        await api.users.updatePreferences({
          lastWorkspace: selectedWorkspace,
          lastChannel: selectedChannel || null,
        });

        console.log('HomePage: User preferences updated successfully');
      } catch (error) {
        console.error('HomePage: Error updating preferences:', error);
      }
    };

    const timeoutId = setTimeout(() => {
      updatePreferences();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [user, selectedWorkspace, selectedChannel]);

  // Fetch workspace name when selected workspace changes
  useEffect(() => {
    if (!selectedWorkspace) {
      setWorkspaceName('');
      return;
    }

    const workspace = workspaces.find((w) => w.id === selectedWorkspace);
    if (workspace) {
      console.log('HomePage: Found workspace name:', workspace.name);
      setWorkspaceName(workspace.name);
    } else {
      console.log('HomePage: Workspace not found in list');
      setWorkspaceName('Unknown Workspace');
    }
  }, [selectedWorkspace, workspaces]);

  // Fetch channels when workspace changes
  useEffect(() => {
    const fetchChannels = async () => {
      if (!selectedWorkspace) {
        console.log('HomePage: No workspace selected, clearing channels');
        setChannels([]);
        return;
      }

      try {
        const response = await api.workspaces.getChannels(selectedWorkspace);
        console.log('HomePage: Channels response:', response.data);

        // Sort channels alphabetically
        const fetchedChannels = response.data.channels || [];

        // Only use mock channels for CSE186 workspace
        if (workspaceName === 'CSE186') {
          console.log('HomePage: Using mock channels for CSE186 workspace');
          const mockAssignmentChannels = [
            {id: 'assign1', name: 'Assignment 1'},
            {id: 'assign2', name: 'Assignment 2'},
            {id: 'assign3', name: 'Assignment 3'},
            {id: 'assign4', name: 'Assignment 4'},
            {id: 'general', name: 'General'},
          ];
          setChannels(mockAssignmentChannels);

          // Select first channel by default if none is selected
          if (!selectedChannel) {
            setSelectedChannel(mockAssignmentChannels[0].id);
          }
        } else {
          console.log('HomePage: Using API channels for workspace');
          setChannels(fetchedChannels);

          // Select first channel by default if none is selected
          if (!selectedChannel && fetchedChannels.length > 0) {
            setSelectedChannel(fetchedChannels[0].id);
          }
        }
      } catch (err) {
        console.error('HomePage: Error fetching channels:', err);
        setError('Failed to load channels');
      }
    };

    // Reset selectedChannel when workspace changes to avoid invalid selections
    if (selectedChannel) {
      setSelectedChannel(null);
    }

    // Then fetch channels for the new workspace
    fetchChannels();
  }, [selectedWorkspace, workspaceName]);

  // Update channel name when channel selection changes
  useEffect(() => {
    if (selectedChannel && channels.length > 0) {
      const channel = channels.find((c) => c.id === selectedChannel);
      if (channel) {
        console.log('HomePage: Found channel name:', channel.name);
        setChannelName(channel.name);
      } else {
        console.log('HomePage: Channel not found in list');
        setChannelName('Unknown Channel');
      }
    } else {
      setChannelName('');
    }
  }, [selectedChannel, channels]);

  const handleLogout = async () => {
    try {
      console.log('HomePage: Logging out user');
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('HomePage: Logout error:', error);
    }
  };

  const handleSelectWorkspace = (workspaceId) => {
    console.log('HomePage: Selected workspace changed to:', workspaceId);

    if (workspaceId !== selectedWorkspace) {
      setSelectedWorkspace(workspaceId);
      setSelectedChannel(null);
      setSelectedDM(null);
    }
  };

  const handleSelectChannel = (channelId) => {
    console.log('HomePage: Selected channel changed to:', channelId);

    setSelectedChannel(channelId);
    setSelectedDM(null); // Clear DM selection when channel is selected
  };

  const handleSelectDM = (userId) => {
    console.log('HomePage: Selected DM changed to:', userId);

    setSelectedDM(userId);
    setSelectedChannel(null); // Clear channel selection when DM is selected
  };

  const handleViewChange = (newView) => {
    console.log('HomePage: View changed to:', newView);
    setCurrentView(newView);
  };

  const handleAddChannel = () => {
    // Placeholder for adding a channel
    console.log('HomePage: Add channel clicked');
  };

  const handleAddTeammate = () => {
    // Placeholder for adding a teammate
    console.log('HomePage: Add teammate clicked');
  };

  // Sidebar content - navigation sidebar (desktop or mobile drawer)
  const sidebarContent = (
    <Box
      sx={{
        width: 250,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette.background.paper,
      }}
    >
      {/* Workspace Selector/Header */}
      <Box sx={{p: 2, bgcolor: theme.palette.primary.main, color: 'white'}}>
        <Typography variant="h6" component="div">
          {workspaceName || 'Select Workspace'}
        </Typography>
      </Box>

      {/* Workspace Selection (if not already selected) */}
      {!selectedWorkspace && (
        <Box sx={{p: 2}}>
          <WorkspaceList
            selectedWorkspace={selectedWorkspace}
            onSelectWorkspace={handleSelectWorkspace}
          />
        </Box>
      )}

      {/* Channels Section with Header */}
      {selectedWorkspace && (
        <Box sx={{flexGrow: 1, overflowY: 'auto', p: 0}}>
          <List sx={{width: '100%', p: 0}}>
            {/* Channels Header */}
            <ListItem
              button
              onClick={() => setChannelsExpanded(!channelsExpanded)}
              sx={{py: 1}}
            >
              <ListItemIcon sx={{minWidth: 30}}>
                {channelsExpanded ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
              </ListItemIcon>
              <ListItemText primary="Channels" />
            </ListItem>

            {/* Channels List Component */}
            {channelsExpanded && (
              <Box sx={{ml: 1}}>
                <ChannelList
                  workspaceId={selectedWorkspace}
                  selectedChannel={selectedChannel}
                  onSelectChannel={handleSelectChannel}
                />

                {/* Add Channel Button */}
                <ListItem disablePadding>
                  <ListItemButton onClick={handleAddChannel} sx={{pl: 3}}>
                    <ListItemIcon sx={{minWidth: 28}}>
                      <AddIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Add Channel" />
                  </ListItemButton>
                </ListItem>
              </Box>
            )}

            {/* Direct Messages Header */}
            <ListItem
              button
              onClick={() => setDmsExpanded(!dmsExpanded)}
              sx={{py: 1, mt: 1}}
            >
              <ListItemIcon sx={{minWidth: 30}}>
                {dmsExpanded ? <ArrowDropDownIcon /> : <ArrowRightIcon />}
              </ListItemIcon>
              <ListItemText primary="Direct Messages" />
            </ListItem>

            {/* DMs List */}
            {dmsExpanded && (
              <>
                {directMessages.map((dm) => (
                  <ListItem key={dm.id} disablePadding>
                    <ListItemButton
                      selected={selectedDM === dm.id}
                      onClick={() => handleSelectDM(dm.id)}
                      sx={{pl: 4}}
                    >
                      <ListItemIcon sx={{minWidth: 28, position: 'relative'}}>
                        <PersonIcon fontSize="small" />
                        {dm.online && (
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              bgcolor: 'success.main',
                              borderRadius: '50%',
                              position: 'absolute',
                              bottom: 0,
                              right: 0,
                            }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText primary={dm.name} />
                    </ListItemButton>
                  </ListItem>
                ))}

                {/* Add Teammate Button */}
                <ListItem disablePadding>
                  <ListItemButton onClick={handleAddTeammate} sx={{pl: 4}}>
                    <ListItemIcon sx={{minWidth: 28}}>
                      <AddIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Add Teammate" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      )}
    </Box>
  );

  // Conditional render based on current view (for mobile)
  const renderContent = () => {
    switch (currentView) {
      case 'messages':
        return (
          <Box sx={{p: 3}}>
            <Typography variant="h6">Direct Messages</Typography>
            <Typography variant="body1" color="text.secondary" sx={{mt: 2}}>
              {selectedDM ?
                `Showing messages with ${directMessages.find(
                    (dm) => dm.id === selectedDM)?.name}` :
                'Select a user to view direct messages'}
            </Typography>
          </Box>
        );
      case 'mentions':
        return (
          <Box sx={{p: 3}}>
            <Typography variant="h6">Mentions</Typography>
            <Typography variant="body1" color="text.secondary" sx={{mt: 2}}>
              Messages where you were mentioned will appear here
            </Typography>
          </Box>
        );
      case 'search':
        return (
          <Box sx={{p: 3}}>
            <Typography variant="h6">Search</Typography>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search messages..."
              sx={{mt: 2}}
            />
          </Box>
        );
      case 'profile':
        return (
          <Box sx={{p: 3}}>
            <Typography variant="h5" gutterBottom>Profile</Typography>
            <Box sx={{display: 'flex', alignItems: 'center', mb: 3}}>
              <Box>
                <Typography variant="h6">{user?.name}</Typography>
                <Typography variant="body2" color="text.secondary">{
                  user?.email}</Typography>
              </Box>
            </Box>
            <Divider sx={{my: 2}} />
            <Typography variant="body1" sx={{mb: 2}}>
              Logged in as: {user?.role || 'Member'}
            </Typography>
          </Box>
        );
      default: // 'home'
        if (selectedChannel) {
          return <ResponsiveMessageList channelId={
            selectedChannel} currentUser={user} />;
        } else if (selectedDM) {
          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                p: 3,
                textAlign: 'center',
              }}
            >
              <Typography variant="h5" gutterBottom>
                Direct Message
              </Typography>
              <Typography variant="body1">
                Showing conversation with {directMessages.find(
                    (dm) => dm.id === selectedDM)?.name}
              </Typography>
            </Box>
          );
        } else if (selectedWorkspace) {
          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                p: 3,
                textAlign: 'center',
              }}
            >
              <Typography variant="h5" gutterBottom>
                {workspaceName}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Select a channel or direct message to begin
              </Typography>
            </Box>
          );
        } else {
          return (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                p: 3,
                textAlign: 'center',
              }}
            >
              <Typography variant="h5" gutterBottom>
                Welcome, {user?.name || 'User'}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Select a workspace, channel or direct message to get started
              </Typography>
            </Box>
          );
        }
    }
  };

  if (loading) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center',
        alignItems: 'center', height: '100vh'}}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{p: 3, textAlign: 'center'}}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{flexGrow: 1, height: '100vh',
      display: 'flex', flexDirection: 'column'}}>
      {/* Simplified Header - only shows workspace name and logout */}
      <ResponsiveHeader
        onMenuClick={() => setDrawerOpen(!drawerOpen)}
        onLogout={handleLogout}
        workspaces={workspaces}
        selectedWorkspace={selectedWorkspace}
        workspaceName={workspaceName}
        onSelectWorkspace={handleSelectWorkspace}
        selectedChannel={selectedChannel}
        channelName={channelName}
        onSelectChannel={handleSelectChannel}
      />

      <Box sx={{flexGrow: 1, display: 'flex', overflow: 'hidden'}}>
        {/* Desktop sidebar - always visible on desktop */}
        {!isMobile && (
          <Box sx={{width: 250, borderRight: 1,
            borderColor: 'divider', overflow: 'auto'}}>
            {sidebarContent}
          </Box>
        )}

        {/* Main content area */}
        <Box sx={{flexGrow: 1, display: 'flex',
          flexDirection: 'column', overflow: 'hidden'}}>
          {renderContent()}
        </Box>
      </Box>

      {/* Mobile navigation */}
      {isMobile && (
        <MobileNavigation
          currentView={currentView}
          onViewChange={handleViewChange}
        />
      )}

      {/* Mobile drawer - only visible when drawerOpen is true */}
      <Drawer
        anchor="left"
        open={isMobile ? drawerOpen : false}
        onClose={() => setDrawerOpen(false)}
      >
        {sidebarContent}
      </Drawer>
    </Box>
  );
};

HomePage.propTypes = {
  initialView: PropTypes.string,
};

export default HomePage;
