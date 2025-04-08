import {useState, JSX} from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  useMediaQuery,
  useTheme,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import TagIcon from '@mui/icons-material/Tag';
import PersonIcon from '@mui/icons-material/Person';
import PropTypes from 'prop-types';

/**
 * Responsive header component that adapts to mobile and desktop views
 * @param {object} props Component props
 * @param {Function} props.onMenuClick Callback when menu icon is clicked
 * @param {Function} props.onLogout Callback when logout button is clicked
 * @param {Array} props.workspaces List of workspaces
 * @param {string} props.selectedWorkspace ID of selected workspace
 * @param {string} props.workspaceName Name of selected workspace
 * @param {Function} props.onSelectWorkspace Callback when workspace is selected
 * @param {Array} props.channels List of channels for current workspace
 * @param {string} props.selectedChannel ID of selected channel
 * @param {string} props.channelName Name of selected channel
 * @param {Function} props.onSelectChannel Callback when channel is selected
 * @param {Array} props.directMessages List of direct message users
 * @param {string} props.selectedDM ID of selected DM user
 * @param {Function} props.onSelectDM Callback when DM user is selected
 * @returns {JSX.Element} Responsive header component
 */
const ResponsiveHeader = ({
  onMenuClick,
  onLogout,
  workspaces = [],
  selectedWorkspace,
  workspaceName,
  onSelectWorkspace,
  channels = [],
  selectedChannel,
  channelName,
  onSelectChannel,
  directMessages = [],
  selectedDM,
  onSelectDM,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // State for dropdown menus (mobile only)
  const [workspaceAnchorEl, setWorkspaceAnchorEl] = useState(null);
  const [channelAnchorEl, setChannelAnchorEl] = useState(null);
  const [dmAnchorEl, setDmAnchorEl] = useState(null);

  // Mobile header with dropdown menus
  if (isMobile) {
    return (
      <AppBar position="static">
        <Toolbar>
          {/* Workspace Dropdown */}
          <Box sx={{display: 'flex', alignItems: 'center', flexGrow: 1}}>
            <IconButton
              onClick={(e) => setWorkspaceAnchorEl(e.currentTarget)}
              size="small"
              color="inherit"
              aria-controls="workspace-menu"
              aria-haspopup="true"
              aria-expanded={Boolean(workspaceAnchorEl)}
            >
              <Typography variant="h6" component="div" sx={{mr: 1}}>
                {workspaceName || 'Workspaces'}
              </Typography>
              <KeyboardArrowDownIcon />
            </IconButton>

            <Menu
              id="workspace-menu"
              anchorEl={workspaceAnchorEl}
              open={Boolean(workspaceAnchorEl)}
              onClose={() => setWorkspaceAnchorEl(null)}
              MenuListProps={{
                'aria-labelledby': 'workspace-button',
              }}
              PaperProps={{
                style: {maxHeight: 300},
              }}
            >
              {workspaces.map((workspace) => (
                <MenuItem
                  key={workspace.id}
                  onClick={() => {
                    onSelectWorkspace(workspace.id);
                    setWorkspaceAnchorEl(null);
                  }}
                  selected={workspace.id === selectedWorkspace}
                >
                  <ListItemIcon>
                    <WorkspacesIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>{workspace.name}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Channel Dropdown */}
          {selectedWorkspace && (
            <Box sx={{display: 'flex', alignItems: 'center', mr: 1}}>
              <IconButton
                onClick={(e) => setChannelAnchorEl(e.currentTarget)}
                size="small"
                color="inherit"
                aria-controls="channel-menu"
                aria-haspopup="true"
                aria-expanded={Boolean(channelAnchorEl)}
              >
                <Typography variant="body1" component="div" sx={{mr: 0.5}}>
                  # {channelName || 'Channels'}
                </Typography>
                <KeyboardArrowDownIcon fontSize="small" />
              </IconButton>

              <Menu
                id="channel-menu"
                anchorEl={channelAnchorEl}
                open={Boolean(channelAnchorEl)}
                onClose={() => setChannelAnchorEl(null)}
                MenuListProps={{
                  'aria-labelledby': 'channel-button',
                }}
                PaperProps={{
                  style: {maxHeight: 300},
                }}
              >
                <Typography variant="subtitle2" sx={{px: 2, py: 1}}>
                  Channels
                </Typography>
                <Divider />
                {channels.map((channel) => (
                  <MenuItem
                    key={channel.id}
                    onClick={() => {
                      onSelectChannel(channel.id);
                      setChannelAnchorEl(null);
                    }}
                    selected={channel.id === selectedChannel}
                  >
                    <ListItemIcon>
                      <TagIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>{channel.name}</ListItemText>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          )}

          {/* Direct Messages Dropdown */}
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            <IconButton
              onClick={(e) => setDmAnchorEl(e.currentTarget)}
              size="small"
              color="inherit"
              aria-controls="dm-menu"
              aria-haspopup="true"
              aria-expanded={Boolean(dmAnchorEl)}
            >
              <Typography variant="body1" component="div" sx={{mr: 0.5}}>
                {selectedDM ?
                  directMessages.find(
                      (dm) => dm.id === selectedDM)?.name || 'DMs' :
                  'DMs'}
              </Typography>
              <KeyboardArrowDownIcon fontSize="small" />
            </IconButton>

            <Menu
              id="dm-menu"
              anchorEl={dmAnchorEl}
              open={Boolean(dmAnchorEl)}
              onClose={() => setDmAnchorEl(null)}
              MenuListProps={{
                'aria-labelledby': 'dm-button',
              }}
              PaperProps={{
                style: {maxHeight: 300},
              }}
            >
              <Typography variant="subtitle2" sx={{px: 2, py: 1}}>
                Direct Messages
              </Typography>
              <Divider />
              {directMessages.map((dm) => (
                <MenuItem
                  key={dm.id}
                  onClick={() => {
                    onSelectDM(dm.id);
                    setDmAnchorEl(null);
                  }}
                  selected={dm.id === selectedDM}
                >
                  <ListItemIcon>
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
                  <ListItemText>{dm.name}</ListItemText>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  // Desktop header
  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{mr: 2}}
          onClick={onMenuClick}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{flexGrow: 1}}>
          {selectedChannel ? `${workspaceName} / #${
            channelName}` : (workspaceName || 'Diligent')}
        </Typography>
        <Button color="inherit" onClick={onLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

ResponsiveHeader.propTypes = {
  onMenuClick: PropTypes.func,
  onLogout: PropTypes.func.isRequired,
  workspaces: PropTypes.array,
  selectedWorkspace: PropTypes.string,
  workspaceName: PropTypes.string,
  onSelectWorkspace: PropTypes.func.isRequired,
  channels: PropTypes.array,
  selectedChannel: PropTypes.string,
  channelName: PropTypes.string,
  onSelectChannel: PropTypes.func.isRequired,
  directMessages: PropTypes.array,
  selectedDM: PropTypes.string,
  onSelectDM: PropTypes.func,
};

export default ResponsiveHeader;
