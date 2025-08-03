import { useAuthContext } from '../context/useAuthContext';

// Centralized logout function
export const handleLogout = () => {
  // Remove user from localStorage
  localStorage.removeItem('user');
  
  // Clear any other stored data
  localStorage.removeItem('token');
  sessionStorage.clear();
  
  // Redirect to login page
  window.location.href = '/';
};

// Hook for handling unauthorized access
export const useAuthHandler = () => {
  const { dispatch } = useAuthContext();

  const handleUnauthorized = () => {
    // Clear auth context
    dispatch({ type: 'LOGOUT' });
    
    // Call centralized logout
    handleLogout();
  };

  return { handleUnauthorized };
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const user = localStorage.getItem('user');
  return user !== null;
};

// Get current user
export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

// Get auth token
export const getAuthToken = () => {
  const user = getCurrentUser();
  return user?.token || null;
}; 