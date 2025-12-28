import { apiRoutes } from '../config';

// Get user token from localStorage
const getAuthToken = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user).token : null;
};

// Handle unauthorized responses
const handleUnauthorized = () => {
  localStorage.removeItem('user');
  window.location.href = '/';
};

// Base API request function with error handling
const apiRequest = async (url, options = {}) => {
  const token = getAuthToken();

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers
  };

  const config = {
    ...options,
    headers: defaultHeaders
  };

  try {
    const response = await fetch(url, config);

    // Handle unauthorized responses
    if (response.status === 401) {
      handleUnauthorized();
      throw new Error('Unauthorized access. Please login again.');
    }

    // Handle other error responses
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return response;
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      throw error;
    }
    throw new Error(`Network error: ${error.message}`);
  }
};

// API methods
export const api = {
  // GET request
  get: async (endpoint, params = {}) => {
    const url = new URL(endpoint);
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key]);
      }
    });

    const response = await apiRequest(url.toString());
    return response.json();
  },

  // POST request
  post: async (endpoint, data = {}) => {
    const response = await apiRequest(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // PUT request
  put: async (endpoint, data = {}) => {
    const response = await apiRequest(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return response.json();
  },

  // DELETE request
  delete: async (endpoint) => {
    const response = await apiRequest(endpoint, {
      method: 'DELETE'
    });
    return response.json();
  },

  // PATCH request
  patch: async (endpoint, data = {}) => {
    const response = await apiRequest(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
    return response.json();
  }
};

export { apiRoutes };
