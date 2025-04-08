/*
* Centralized API service for making authenticated requests
*/
import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3010',
});

/* eslint-disable no-undef */
// The following code uses browser globals (localStorage, console)
// which are implicitly available in browser environments

// Add a request interceptor to include the auth token on every request
api.interceptors.request.use(
    (config) => {
      // Get the token from localStorage
      const token = localStorage.getItem('token');

      if (token) {
        // Set the Authorization header for every request
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      // Do something with request error
      console.error('API request error:', error);
      return Promise.reject(error);
    },
);

// Add a response interceptor to handle common error cases
api.interceptors.response.use(
    (response) => {
      // Return successful responses normally
      return response;
    },
    (error) => {
      // Handle error responses
      if (error.response) {
        // The request was made and the server responded with an error status
        console.error('API response error:',
            error.response.status, error.response.data);

        // Handle authentication errors
        if (error.response.status === 401) {
          console.error('Authentication error - token may be expired');
          // Optional: You could trigger logout here
          // localStorage.removeItem('token');
          // window.location.href = '/login';
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('API no response error:', error.request);
      } else {
        // Something happened in setting up the request
        console.error('API setup error:', error.message);
      }

      // Forward the error for component-level handling
      return Promise.reject(error);
    },
);
/* eslint-enable no-undef */

// Export API methods
export default {
  // Auth endpoints
  auth: {
    login: (credentials) => api.post('/api/v0/login', credentials),
    logout: () => api.post('/api/v0/logout'),
    validateToken: () => api.get('/api/v0/validate-token'),
  },

  // User endpoints
  users: {
    getCurrentUser: () => api.get('/api/v0/users/me'),
    updatePreferences: (preferences) => api.patch(
        '/api/v0/users/me/preferences', preferences),
    updateStatus: (status) => api.patch('/api/v0/users/me/status', {status}),
  },

  // Workspace endpoints
  workspaces: {
    getAll: () => api.get('/api/v0/workspaces'),
    getChannels: (workspaceId) => api.get(
        `/api/v0/workspaces/${workspaceId}/channels`),
  },

  // Channel endpoints
  channels: {
    getMessages: (channelId) => api.get(
        `/api/v0/channels/${channelId}/messages`),
    createMessage: (channelId, content, parentId = null) => {
      const payload = {content};
      if (parentId) {
        payload.parent_id = parentId;
      }
      return api.post(`/api/v0/channels/${channelId}/messages`, payload);
    },
  },

  // Helper for raw API access if needed
  raw: api,
};
