import {useState, useEffect, JSX} from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  Typography,
  Box,
  CircularProgress,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import api from '../services/api';
import PropTypes from 'prop-types';

/**
 * Displays a list of channels for the selected workspace
 * @param {object} props Component props
 * @param {string|null} props.workspaceId Currently selected workspace ID
 * @param {string|null} props.selectedChannel Currently selected channel ID
 * @param {Function} props.onSelectChannel Callback when channel is selected
 * @returns {JSX.Element} Channel list component
 */
const ChannelList = ({workspaceId, selectedChannel, onSelectChannel}) => {
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requestInProgress, setRequestInProgress] = useState(false);

  useEffect(() => {
    // Track the current request to avoid race conditions
    let isCurrent = true;

    const fetchChannels = async () => {
      // Clear previous channels when workspace changes
      setChannels([]);

      if (!workspaceId) {
        console.log('ChannelList: No workspace ID provided, clearing channels');
        setLoading(false);
        return;
      }

      if (requestInProgress) {
        console.log('ChannelList: Request already in progress, skipping');
        return;
      }

      try {
        setLoading(true);
        setError('');
        setRequestInProgress(true);

        const response = await api.workspaces.getChannels(workspaceId);

        if (!isCurrent) {
          return;
        }


        // Handle case where response.data.channels is undefined
        if (response.data && response.data.channels) {
          setChannels(response.data.channels);

          // Select first channel by default if none is selected
          if (!selectedChannel && response.data.channels.length > 0) {
            onSelectChannel(response.data.channels[0].id);
          }
        } else {
          setChannels([]);
          setError('Unexpected response format from server');
        }
      } catch (err) {
        // Only update state if this request is still relevant
        if (!isCurrent) return;

        console.error('ChannelList: Error fetching channels:', err);

        if (err.response) {
          // More detailed error handling based on status codes
          if (err.response.status === 401) {
            setError('Session expired. Please log in again.');
          } else if (err.response.status === 403) {
            setError('You do not have access to this workspace.');
          } else if (err.response.status === 404) {
            setError('Workspace not found.');
          } else {
            setError(`Failed to load channels`);
          }
        } else if (err.request) {
          // The request was made but no response was received
          setError('No response received from server. Check your connection.');
        } else {
          // Something happened in setting up the request
          setError(`Request error: ${err.message}`);
        }
      } finally {
        // Only update state if this request is still relevant
        if (isCurrent) {
          setLoading(false);
          setRequestInProgress(false);
        }
      }
    };

    fetchChannels();

    return () => {
      isCurrent = false;
    };
  }, [workspaceId, selectedChannel, onSelectChannel]);

  // Mobile version - dropdown selector
  const renderMobileView = () => (
    <FormControl fullWidth sx={{mb: 2}}>
      <InputLabel id="channel-select-label">Channel</InputLabel>
      <Select
        labelId="channel-select-label"
        id="channel-select"
        value={selectedChannel || ''}
        label="Channel"
        onChange={(e) => {
          onSelectChannel(e.target.value);
        }}
        disabled={channels.length === 0}
      >
        {channels.map((channel) => (
          <MenuItem key={channel.id} value={channel.id}>
            # {channel.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  // Desktop version - list view
  const renderDesktopView = () => (
    <List sx={{width: '100%'}}>
      <ListItem sx={{pl: 2, pb: 1}}>
        <Typography variant="subtitle2" color="text.secondary">
          Channels
        </Typography>
      </ListItem>
      {channels.map((channel) => (
        <ListItem key={channel.id} disablePadding>
          <ListItemButton
            selected={selectedChannel === channel.id}
            onClick={() => {
              onSelectChannel(channel.id);
            }}
            sx={{pl: 2}}
          >
            <ListItemText primary={`# ${channel.name}`} />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );

  if (loading) {
    return (
      <Box sx={{display: 'flex', justifyContent: 'center', p: 2}}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{p: 2}}>
        <Typography color="error" variant="body2">{error}</Typography>
      </Box>
    );
  }

  if (channels.length === 0 && !loading) {
    return (
      <Box sx={{p: 2}}>
        <Typography variant="body2">No channels found</Typography>
      </Box>
    );
  }

  // Use responsive display based on viewport width
  return (
    <Box>
      {/* Mobile view (for small screens) */}
      <Box sx={{display: {xs: 'block', md: 'none'}}}>
        {renderMobileView()}
      </Box>

      {/* Desktop view (for medium and larger screens) */}
      <Box sx={{display: {xs: 'none', md: 'block'}}}>
        {renderDesktopView()}
      </Box>
    </Box>
  );
};

ChannelList.propTypes = {
  workspaceId: PropTypes.string,
  selectedChannel: PropTypes.string,
  onSelectChannel: PropTypes.func.isRequired,
};

export default ChannelList;
