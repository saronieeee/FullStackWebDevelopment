import {createContext, useState, useContext, useEffect, JSX} from 'react';
import PropTypes from 'prop-types';
import api from '../services/api';

// Create the authentication context
const AuthContext = createContext();

/**
 * Custom hook to use the authentication context
 * @returns {object} Auth context containing user, loading, login, and logout
 */
export const useAuth = () => {
  return useContext(AuthContext);
};

/**
 * Authentication provider component that manages user authentication state
 * @param {object} props Component props
 * @param {JSX.Element} props.children Child components
 * @returns {JSX.Element} AuthProvider component
 */
export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing auth token on component mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        console.log('AuthContext: No token found in localStorage');
        setLoading(false);
        return;
      }

      try {
        console.log('AuthContext: Validating existing token');

        // Validate the token by getting the current user
        const response = await api.users.getCurrentUser();

        setUser({
          id: response.data.id,
          email: response.data.email,
          name: response.data.name,
          role: response.data.role,
        });
      } catch (error) {
        console.error('AuthContext: Token validation error:', error);

        // If token is invalid, clear it from localStorage
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  /**
   * Log in a user with email and password
   * @param {string} email User email
   * @param {string} password User password
   * @returns {Promise<object>} Promise resolving to the logged in user
   */
  const login = async (email, password) => {
    try {
      console.log('AuthContext: Attempting login for', email);
      const response = await api.auth.login({email, password});

      const {token, user: userData} = response.data;

      // Store token in localStorage
      localStorage.setItem('token', token);

      console.log('AuthContext: Login successful', userData);

      // Set the user in state
      setUser(userData);

      return userData;
    } catch (error) {
      console.error('AuthContext: Login error:', error);
      throw error;
    }
  };

  /**
   * Log out the current user
   * @returns {Promise<void>} Promise that resolves when logout is complete
   */
  const logout = async () => {
    try {
      console.log('AuthContext: Logging out user');

      await api.auth.logout().catch((error) => {
        console.warn('AuthContext: Logout API call failed', error);
      });

      // Clear token from localStorage
      localStorage.removeItem('token');

      // Clear user from state
      setUser(null);

      console.log('AuthContext: Logout successful');
    } catch (error) {
      console.error('AuthContext: Logout error:', error);
      throw error;
    }
  };

  // Create the context value object
  const contextValue = {
    user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthContext;
