import { useAuthContext } from '../context/useAuthContext';
import { authAPI } from '../api/auth';

// Centralized logout function
export const handleLogout = async () => {
  try {
    // Call logout API to clear the cookie on server
    await authAPI.logout();
  } catch (error) {
    // Even if API call fails, continue with client-side cleanup
    console.error('Logout API error:', error);
  }

  // Clear any client-side storage (if any remains)
  localStorage.clear();
  sessionStorage.clear();

  // Redirect to login page
  window.location.href = '/';
};

// Hook for handling unauthorized access
export const useAuthHandler = () => {
  const { dispatch } = useAuthContext();

  const handleUnauthorized = async () => {
    // Clear auth context
    dispatch({ type: 'LOGOUT' });

    // Call centralized logout
    await handleLogout();
  };

  return { handleUnauthorized };
};

// Check if user is authenticated (based on context, not localStorage)
export const isAuthenticated = (user) => {
  return user !== null && user !== undefined;
};

// Get current user (from context, not localStorage)
export const getCurrentUser = (user) => {
  return user || null;
};
