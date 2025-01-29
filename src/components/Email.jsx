import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

/**
 * Component to display a single email's contents
 * @param {object} props - Component properties
 * @param {object} props.email - The email object to display
 * @param {Function} props.onClose - Function to handle closing the email
 * @returns {object} The rendered Email component
 */
function Email({email, onClose}) {
  if (!email) {
    return <Box>Select an email to read</Box>;
  }

  return (
    <Paper sx={{p: 2, m: 1, position: 'relative'}}>
      <IconButton
        onClick={onClose}
        aria-label="close mail reader"
        sx={{position: 'absolute', right: 8, top: 8}}
      >
        <CloseIcon />
      </IconButton>
      <Typography variant="h6" gutterBottom>
        {email.subject}
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        From: {email.from.name} &lt;{email.from.address}&gt;
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        To: {email.to.name} &lt;{email.to.address}&gt;
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        Received: {new Date(email.received).toLocaleString()}
      </Typography>
      <Box sx={{mt: 2}}>
        <Typography variant="body1" style={{whiteSpace: 'pre-line'}}>
          {email.content}
        </Typography>
      </Box>
    </Paper>
  );
}

Email.propTypes = {
  email: PropTypes.shape({
    subject: PropTypes.string.isRequired,
    from: PropTypes.shape({
      name: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
    }).isRequired,
    to: PropTypes.shape({
      name: PropTypes.string.isRequired,
      address: PropTypes.string.isRequired,
    }).isRequired,
    received: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};

export default Email;
