import React, {useState, useEffect} from 'react';
import {
  Box,
  Typography,
  Avatar,
  Divider,
  TextField,
  IconButton,
  CircularProgress,
  Button,
  Paper,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ReplyIcon from '@mui/icons-material/Reply';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import api from '../services/api';
import PropTypes from 'prop-types';
import {format} from 'date-fns';
import {useNavigate} from 'react-router-dom';

/**
 * Responsive message list component adapting to both mobile and desktop
 * @param {object} props - Component props
 * @param {string} props.channelId - ID of current channel
 * @param {object} props.currentUser - Current user object
 * @returns {React.ReactElement} Message list component
 */
const ResponsiveMessageList = ({channelId, currentUser}) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedMessageId, setSelectedMessageId] = useState(null);
  const [requestInProgress, setRequestInProgress] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Fetch messages when channelId changes
  useEffect(() => {
    // Track the current request to avoid race conditions
    let isCurrent = true;

    const fetchMessages = async () => {
      if (!channelId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      if (requestInProgress) {
        console.log('MessageList: Request already in progress, skipping');
        return;
      }

      try {
        setLoading(true);
        setError('');
        setRequestInProgress(true);

        console.log(`MessageList: Fetching messages for channel ${channelId}`);

        const response = await api.channels.getMessages(channelId);

        // Check if this request is still relevant (channelId hasn't changed)
        if (!isCurrent) {
          return;
        }

        setMessages(response.data.messages || []);
      } catch (err) {
        // Only update state if this request is still relevant
        if (!isCurrent) return;

        console.error('MessageList: Error fetching messages:', err);

        if (err.response) {
          if (err.response.status === 401) {
            setError('Session expired. Please log in again.');
          } else if (err.response.status === 403) {
            setError('You do not have access to this channel.');
          } else if (err.response.status === 404) {
            setError('Channel not found.');
          } else {
            setError(`Failed to load messages`);
          }
        } else if (err.request) {
          setError('No response received from server. Check your connection.');
        } else {
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

    fetchMessages();

    return () => {
      isCurrent = false;
    };
  }, [channelId]);

  // Group messages by date
  const groupedMessages = messages.reduce((groups, message) => {
    const date = new Date(message.sent_at).toLocaleDateString();

    if (!groups[date]) {
      groups[date] = [];
    }

    groups[date].push(message);
    return groups;
  }, {});

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !channelId) return;

    try {
      console.log(`MessageList: Sending new message to channel ${channelId}`);

      await api.channels.createMessage(channelId, newMessage);

      // Refresh messages after sending
      const response = await api.channels.getMessages(channelId);
      setMessages(response.data.messages || []);
      setNewMessage('');
    } catch (err) {
      console.error('MessageList: Error sending message:', err);

      // Show a temporary error message to the user
      setError('Failed to send message. Please try again.');
      setTimeout(() => setError(''), 3000); // Clear error after 3 seconds
    }
  };

  // Handle message menu open
  const handleMenuOpen = (event, messageId) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedMessageId(messageId);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedMessageId(null);
  };

  // Handle navigation to thread view
  const handleViewThread = () => {
    if (!selectedMessageId) return;

    navigate(`/thread/${selectedMessageId}`, {
      state: {
        channelId: channelId,
        parentMessage: messages.find((m) => m.id === selectedMessageId),
      },
    });

    handleMenuClose();
  };

  // Handle showing thread directly when there are already replies
  const handleShowThread = (messageId) => {
    navigate(`/thread/${messageId}`, {
      state: {
        channelId: channelId,
        parentMessage: messages.find((m) => m.id === messageId),
      },
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
        }}
      >
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

  // Shared message rendering logic
  const renderMessages = () => (
    Object.entries(groupedMessages).map(([date, dateMessages]) => (
      <Box key={date} sx={{mb: 2}}>
        {/* Date header */}
        <Divider sx={{my: 2}}>
          <Typography variant="caption" color="text.secondary">
            {new Date(date).toDateString() === new Date().toDateString() ?
              'Today' :
              format(new Date(date), 'EEEE, MMMM d')}
          </Typography>
        </Divider>

        {/* Messages for this date */}
        {dateMessages.map((message) => {
          // In mobile view, skip replies in the main view
          if (isMobile && message.parent_id) return null;

          // Count replies to this message
          const replyCount = messages.filter(
              (m) => m.parent_id === message.id,
          ).length;
          const replies = messages.filter(
              (m) => m.parent_id === message.id,
          );

          return (
            <Paper
              key={message.id}
              elevation={0}
              sx={{
                'mb': 2,
                'p': isMobile ? 1.5 : 2,
                'backgroundColor': 'background.paper',
                '&:hover': {backgroundColor: 'action.hover'},
              }}
            >
              <Box sx={{display: 'flex', mb: 1}}>
                <Avatar sx={{mr: 1.5, width: 36, height: 36}}>
                  {message.sender_name?.charAt(0) || '?'}
                </Avatar>
                <Box sx={{flexGrow: 1}}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                      <Typography
                        variant="subtitle2"
                        sx={{fontWeight: 'bold', mr: 1}}
                      >
                        {message.sender_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(message.sent_at), 'h:mm a')}
                      </Typography>
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, message.id)}
                      sx={{
                        'visibility': 'hidden',
                        '.MuiPaper-root:hover &': {
                          visibility: 'visible',
                        },
                      }}
                    >
                      <MoreVertIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Typography variant="body2" sx={{whiteSpace: 'pre-wrap'}}>
                    {message.content}
                  </Typography>
                </Box>
              </Box>

              {/* Show thread button if there are replies */}
              {replyCount > 0 && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mt: 1,
                    ml: 7,
                  }}
                >
                  <Button
                    startIcon={<ReplyIcon />}
                    size="small"
                    onClick={() => handleShowThread(message.id)}
                    sx={{textTransform: 'none'}}
                  >
                    {replyCount} {replyCount === 1 ? 'Reply' : 'Replies'}
                  </Button>
                </Box>
              )}

              {/* Replies - only shown in desktop view */}
              {!isMobile && replyCount > 0 && (
                <Box
                  sx={{
                    ml: 7,
                    mt: 1,
                    pl: 2,
                    borderLeft: '2px solid',
                    borderColor: 'divider',
                  }}
                >
                  {replies.slice(0, 3).map((reply) => (
                    <Box key={reply.id} sx={{mb: 1.5}}>
                      <Box sx={{display: 'flex', alignItems: 'flex-start'}}>
                        <Avatar sx={{mr: 1, width: 24, height: 24}}>
                          {reply.sender_name?.charAt(0) || '?'}
                        </Avatar>
                        <Box>
                          <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <Typography
                              variant="body2"
                              sx={{fontWeight: 'bold', mr: 1}}
                            >
                              {reply.sender_name}
                            </Typography>
                            <Typography variant="caption"
                              color="text.secondary">
                              {format(new Date(reply.sent_at), 'h:mm a')}
                            </Typography>
                          </Box>
                          <Typography variant="body2" sx={{
                            whiteSpace: 'pre-wrap'}}>
                            {reply.content}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ))}

                  {replyCount > 3 && (
                    <Button
                      size="small"
                      onClick={() => handleShowThread(message.id)}
                      sx={{ml: 4, textTransform: 'none'}}
                    >
                      View {replyCount - 3} more
                      {replyCount - 3 === 1 ? ' reply' : ' replies'}
                    </Button>
                  )}
                </Box>
              )}
            </Paper>
          );
        })}
      </Box>
    ))
  );

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        pb: isMobile ? 8 : 0, // Add padding for bottom navigation on mobile
      }}
    >
      {/* Messages area */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
        }}
      >
        {Object.keys(groupedMessages).length > 0 ? (
          renderMessages()
        ) : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <Typography color="text.secondary">No messages yet</Typography>
          </Box>
        )}
      </Box>

      {/* Message input area */}
      <Box
        sx={{
          p: 2,
          backgroundColor: 'background.paper',
          borderTop: 1,
          borderColor: 'divider',
          position: 'sticky',
          bottom: isMobile ? 56 : 0,
          left: 0,
          right: 0,
          zIndex: 1,
        }}
      >
        <Box sx={{display: 'flex', alignItems: 'center'}}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Send a message..."
            size={isMobile ? 'small' : 'medium'}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  edge="end"
                >
                  <SendIcon />
                </IconButton>
              ),
            }}
          />
        </Box>
      </Box>

      {/* Message actions menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleViewThread}>
          <ListItemIcon>
            <ReplyIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Reply in thread</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

ResponsiveMessageList.propTypes = {
  channelId: PropTypes.string,
  currentUser: PropTypes.object,
};

export default ResponsiveMessageList;
