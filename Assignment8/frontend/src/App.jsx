/*
#######################################################################
#
# Copyright (C) 2020-2025 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without
# the express written permission of the copyright holder.
#
#######################################################################
*/
import {BrowserRouter as Router, Routes, Route, Navigate}
  from 'react-router-dom';
import {ThemeProvider, createTheme} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {AuthProvider, useAuth} from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ThreadView from './components/ThreadView';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import PropTypes from 'prop-types';
import {JSX} from 'react';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#673ab7', // Purple
    },
    secondary: {
      main: '#f50057', // Pink
    },
  },
});

/**
 * Protected route component that requires authentication
 * @param {object} props - Component props
 * @param {JSX.Element} props.children - Child components to render
 * @returns {JSX.Element} Protected route with children or redirect
 */
const ProtectedRoute = ({children}) => {
  const {user, loading} = useAuth();

  // Show loading spinner while authentication status is being determined
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Render children if authenticated
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * Auth check wrapper for login page
 * @param {object} props - Component props
 * @param {JSX.Element} props.children - Child components to render
 * @returns {JSX.Element} Auth check with children or redirect
 */
const AuthCheck = ({children}) => {
  const {user, loading} = useAuth();

  // Show loading spinner while authentication status is being determined
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to home if already authenticated
  if (user) {
    return <Navigate to="/" />;
  }

  // Render login page if not authenticated
  return children;
};

AuthCheck.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * App content with routes
 * @returns {JSX.Element} The app routes
 */
function AppContent() {
  const {user} = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <AuthCheck>
            <LoginPage />
          </AuthCheck>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <HomePage initialView="home" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/messages"
        element={
          <ProtectedRoute>
            <HomePage initialView="messages" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/mentions"
        element={
          <ProtectedRoute>
            <HomePage initialView="mentions" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/search"
        element={
          <ProtectedRoute>
            <HomePage initialView="search" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <HomePage initialView="profile" />
          </ProtectedRoute>
        }
      />
      <Route
        path="/thread/:messageId"
        element={
          <ProtectedRoute>
            <ThreadView currentUser={user} />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

/**
 * Main application component
 * @returns {JSX.Element} The full app with providers
 */
function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
