import {useState, useEffect, JSX} from 'react';
import {
  Box,
  Typography,
  Avatar,
  TextField,
  IconButton,
  CircularProgress,
  Divider,
  AppBar,
  Toolbar,
  Paper,
  Container,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import axios from 'axios';
import PropTypes from 'prop-types';
import {format} from 'date-fns';
import {useParams, useNavigate, useLocation} from 'react-router-dom';
import MobileNavigation from '../components/MobileNavigation';

/**
 * Responsive thread view component
 * @param {object} props - Component props
 * @param {object} props.currentUser - Current user object
 * @returns {JSX.Element} Thread view component
 */
const ThreadView = ({currentUser}) => {
  const {messageId} = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {channelId, parentMessage: initialParentMessage} = location.state || {};

  const [parentMessage, setParentMessage] = useState(
      initialParentMessage || null);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newReply, setNewReply] = useState('');
  const [currentView, setCurrentView] = useState('home');

  // Fetch parent message and replies
  useEffect(() => {
    const fetchThreadMessages = async () => {
      if (!messageId || !channelId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        if (!token) {
          setError('Authentication token not found');
          setLoading(false);
          return;
        }

        // If we don't have the parent message, fetch all messages and filter
        if (!parentMessage) {
          const response = await axios.get(
              `/api/v0/channels/${channelId}/messages`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

          const messages = response.data.messages || [];
          const parent = messages.find((m) => m.id === messageId);

          if (!parent) {
            setError('Message not found');
            setLoading(false);
            return;
          }

          setParentMessage(parent);
          setReplies(messages.filter((m) => m.parent_id === messageId));
        } else {
          // If we already have the parent message, just fetch replies
          const response = await axios.get(
              `/api/v0/channels/${channelId}/messages`, {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              });

          setReplies(response.data.messages.filter(
              (m) => m.parent_id === messageId) || []);
        }
      } catch (err) {
        console.error('Error fetching thread messages:', err);
        setError('Failed to load thread');
      } finally {
        setLoading(false);
      }
    };

    fetchThreadMessages();
  }, [messageId, channelId, parentMessage]);

  // Handle sending a new reply
  const handleSendReply = async () => {
    if (!newReply.trim() || !channelId || !messageId) return;

    try {
      const token = localStorage.getItem('token');

      await axios.post(`/api/v0/channels/${channelId}/messages`,
          {
            content: newReply,
            parent_id: messageId,
          },
          {headers: {'Authorization': `Bearer ${token}`}},
      );

      // Refresh messages after sending
      const response = await axios.get(
          `/api/v0/channels/${channelId}/messages`, {
            headers: {'Authorization': `Bearer ${token}`},
          });

      setReplies(response.data.messages.filter(
          (m) => m.parent_id === messageId) || []);
      setNewReply('');
    } catch (err) {
      console.error('Error sending reply:', err);
    }
  };

  // Handle navigation back to channel
  const handleBack = () => {
    navigate(-1);
  };

  // Handle bottom navigation view change
  const handleViewChange = (newView) => {
    setCurrentView(newView);

    // Navigate based on view
    switch (newView) {
      case 'home':
        navigate('/');
        break;
      case 'messages':
        navigate('/messages');
        break;
      case 'mentions':
        navigate('/mentions');
        break;
      case 'search':
        navigate('/search');
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        navigate('/');
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

  if (!parentMessage) {
    return (
      <Box sx={{p: 3, textAlign: 'center'}}>
        <Typography>Message not found</Typography>
      </Box>
    );
  }

  // Mobile layout
  if (isMobile) {
    return (
      <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}>
        {/* Thread header */}
        <AppBar position="static">
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleBack}
              aria-label="back"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ml: 1}}>
              Thread
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Thread content */}
        <Box sx={{
          flexGrow: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          pb: 8, // Space for bottom navigation
        }}>
          {/* Parent message */}
          <Paper
            elevation={0}
            sx={{
              mb: 2,
              p: 2,
              backgroundColor: 'background.paper',
            }}
          >
            <Box sx={{display: 'flex'}}>
              <Avatar sx={{mr: 1.5, width: 40, height: 40}}>
                {parentMessage.sender_name?.charAt(0) || '?'}
              </Avatar>
              <Box>
                <Box sx={{display: 'flex', alignItems: 'center'}}>
                  <Typography variant="subtitle1" sx={{
                    fontWeight: 'bold', mr: 1}}>
                    {parentMessage.sender_name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(
                        parentMessage.sent_at), 'MMM d, yyyy h:mm a')}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{
                  whiteSpace: 'pre-wrap', mt: 0.5}}>
                  {parentMessage.content}
                </Typography>
              </Box>
            </Box>
          </Paper>

          {/* Reply count */}
          <Box sx={{mb: 2}}>
            <Divider>
              <Typography variant="subtitle2" color="text.secondary">
                {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
              </Typography>
            </Divider>
          </Box>

          {/* Replies */}
          {replies.length > 0 ? (
            replies
                .sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at))
                .map((reply) => (
                  <Paper
                    key={reply.id}
                    elevation={0}
                    sx={{
                      mb: 2,
                      p: 1.5,
                      backgroundColor: 'background.paper',
                    }}
                  >
                    <Box sx={{display: 'flex'}}>
                      <Avatar sx={{mr: 1.5, width: 36, height: 36}}>
                        {reply.sender_name?.charAt(0) || '?'}
                      </Avatar>
                      <Box>
                        <Box sx={{display: 'flex', alignItems: 'center'}}>
                          <Typography variant="subtitle2" sx={{
                            fontWeight: 'bold', mr: 1}}>
                            {reply.sender_name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {format(new Date(reply.sent_at), 'h:mm a')}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{
                          whiteSpace: 'pre-wrap'}}>
                          {reply.content}
                        </Typography>
                      </Box>
                    </Box>
                  </Paper>
                ))
          ) : (
            <Box sx={{display: 'flex', justifyContent: 'center',
              alignItems: 'center', flexGrow: 1}}>
              <Typography color="text.secondary">No replies yet</Typography>
            </Box>
          )}
        </Box>

        {/* Reply input area */}
        <Box
          sx={{
            p: 2,
            backgroundColor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
            position: 'fixed',
            bottom: 56, // Height of the bottom navigation
            left: 0,
            right: 0,
            zIndex: 1,
          }}
        >
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Reply to thread..."
              size="small"
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={handleSendReply}
                    disabled={!newReply.trim()}
                    edge="end"
                  >
                    <SendIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>
        </Box>

        {/* Mobile bottom navigation */}
        {isMobile && (
          <MobileNavigation
            currentView={currentView}
            onViewChange={handleViewChange}
          />
        )}
      </Box>
    );
  }

  // Desktop layout
  return (
    <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
    }}>
      {/* Thread header */}
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={handleBack}
            aria-label="back"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ml: 1}}>
            Thread: {parentMessage.content.length > 30 ?
              `${parentMessage.content.substring(0, 30)}...` :
              parentMessage.content}
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Thread content */}
      <Container maxWidth="md" sx={{
        flexGrow: 1,
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        py: 4,
      }}>
        {/* Parent message */}
        <Paper
          elevation={1}
          sx={{
            mb: 4,
            p: 3,
            backgroundColor: 'background.paper',
          }}
        >
          <Box sx={{display: 'flex'}}>
            <Avatar sx={{mr: 2, width: 48, height: 48}}>
              {parentMessage.sender_name?.charAt(0) || '?'}
            </Avatar>
            <Box>
              <Box sx={{display: 'flex', alignItems: 'center'}}>
                <Typography variant="h6" sx={{mr: 1}}>
                  {parentMessage.sender_name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {format(new Date(
                      parentMessage.sent_at), 'MMM d, yyyy h:mm a')}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{whiteSpace: 'pre-wrap', mt: 1}}>
                {parentMessage.content}
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Reply count */}
        <Box sx={{mb: 3}}>
          <Divider>
            <Typography variant="subtitle1" color="text.secondary">
              {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
            </Typography>
          </Divider>
        </Box>

        {/* Replies */}
        {replies.length > 0 ? (
          replies
              .sort((a, b) => new Date(a.sent_at) - new Date(b.sent_at))
              .map((reply) => (
                <Paper
                  key={reply.id}
                  elevation={0}
                  sx={{
                    mb: 2,
                    p: 2,
                    backgroundColor: 'background.paper',
                    borderLeft: '4px solid',
                    borderColor: 'primary.light',
                  }}
                >
                  <Box sx={{display: 'flex'}}>
                    <Avatar sx={{mr: 2, width: 40, height: 40}}>
                      {reply.sender_name?.charAt(0) || '?'}
                    </Avatar>
                    <Box>
                      <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <Typography variant="subtitle1"
                          sx={{fontWeight: 'bold', mr: 1}}>
                          {reply.sender_name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {format(new Date(
                              reply.sent_at), 'MMM d, yyyy h:mm a')}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{
                        whiteSpace: 'pre-wrap', mt: 1}}>
                        {reply.content}
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              ))
        ) : (
          <Box sx={{display: 'flex', justifyContent: 'center',
            alignItems: 'center', py: 4}}>
            <Typography color="text.secondary">No replies yet</Typography>
          </Box>
        )}

        {/* Reply input area */}
        <Box
          sx={{
            mt: 3,
            p: 2,
            backgroundColor: 'background.paper',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Box sx={{display: 'flex', alignItems: 'center'}}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Reply to thread..."
              value={newReply}
              onChange={(e) => setNewReply(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
              InputProps={{
                endAdornment: (
                  <IconButton
                    onClick={handleSendReply}
                    disabled={!newReply.trim()}
                    edge="end"
                  >
                    <SendIcon />
                  </IconButton>
                ),
              }}
            />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

ThreadView.propTypes = {
  currentUser: PropTypes.object,
};

export default ThreadView;
