import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
  Container,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  FormControlLabel,
  Checkbox,
  CircularProgress,
} from '@mui/material';
import {styled} from '@mui/material/styles';
import {useAuth} from '../contexts/AuthContext';
import {JSX} from 'react';

const StyledCard = styled(Card)(({theme}) => ({
  marginTop: theme.spacing(8),
  padding: theme.spacing(2),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}));

const StyledForm = styled('form')(({theme}) => ({
  width: '100%',
  marginTop: theme.spacing(1),
}));

const SubmitButton = styled(Button)(({theme}) => ({
  margin: theme.spacing(3, 0, 2),
  background: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
}));

/**
 * Login page component
 * @returns {JSX.Element} The login page
 */
const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {login} = useAuth();
  const navigate = useNavigate();

  /**
   * Handle login form submission
   * @param {Event} e - The form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(
          err.response?.data?.message || 'Failed to log in',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <StyledCard>
        <CardContent sx={{width: '100%'}}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Diligent
          </Typography>

          <Typography component="h2" variant="h6" align="center" sx={{mb: 3}}>
            Login
          </Typography>

          {error && (
            <Typography color="error" variant="body2"align="center"sx={{mb: 2}}>
              {error}
            </Typography>
          )}

          <StyledForm onSubmit={handleSubmit} noValidate>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label="Remember me"
            />

            <SubmitButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </SubmitButton>
          </StyledForm>
        </CardContent>
      </StyledCard>
    </Container>
  );
};

export default LoginPage;
