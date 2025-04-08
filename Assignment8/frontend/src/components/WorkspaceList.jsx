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
 * Displays a list of workspaces for the authenticated user
 * @param {object} props Component props
 * @param {string|null} props.selectedWorkspace Currently selected workspace ID
 * @param {Function} props.onSelectWorkspace Callback when workspace is selected
 * @returns {JSX.Element} Workspace list component
 */
const WorkspaceList = ({selectedWorkspace, onSelectWorkspace}) => {
  const [workspaces, setWorkspaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      // Only fetch workspaces if we haven't already loaded them
      if (initialized) return;

      try {
        setLoading(true);
        console.log('WorkspaceList: Fetching workspaces...');

        const response = await api.workspaces.getAll();

        if (response.data && response.data.workspaces) {
          setWorkspaces(response.data.workspaces);
          setInitialized(true);

          // Select first workspace by default if none is selected
          if (!selectedWorkspace && response.data.workspaces.length > 0) {
            onSelectWorkspace(response.data.workspaces[0].id);
          }
        } else {
          setError('Unexpected response format from server');
        }
      } catch (err) {
        console.error('WorkspaceList: Error fetching workspaces:', err);

        if (err.response) {
          setError(`Failed to load workspaces`);
        } else if (err.request) {
          setError('Server did not respond. Check your connection.');
        } else {
          setError(`Error: ${err.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchWorkspaces();
  }, [selectedWorkspace, onSelectWorkspace, initialized]);

  // Mobile version - dropdown selector
  const renderMobileView = () => (
    <FormControl fullWidth sx={{mb: 2}}>
      <InputLabel id="workspace-select-label">Workspace</InputLabel>
      <Select
        labelId="workspace-select-label"
        id="workspace-select"
        value={selectedWorkspace || ''}
        label="Workspace"
        onChange={(e) => {
          onSelectWorkspace(e.target.value);
        }}
      >
        {workspaces.map((workspace) => (
          <MenuItem key={workspace.id} value={workspace.id}>
            {workspace.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  // Desktop version - list view
  const renderDesktopView = () => (
    <List sx={{width: '100%'}}>
      {workspaces.map((workspace) => (
        <ListItem key={workspace.id} disablePadding>
          <ListItemButton
            selected={selectedWorkspace === workspace.id}
            onClick={() => {
              onSelectWorkspace(workspace.id);
            }}
          >
            <ListItemText primary={workspace.name} />
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

  if (workspaces.length === 0) {
    return (
      <Box sx={{p: 2}}>
        <Typography variant="body2">No workspaces found</Typography>
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

WorkspaceList.propTypes = {
  selectedWorkspace: PropTypes.string,
  onSelectWorkspace: PropTypes.func.isRequired,
};

export default WorkspaceList;
