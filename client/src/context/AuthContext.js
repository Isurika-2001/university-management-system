import { createContext, useReducer, useEffect, useState } from 'react';
import { authAPI } from '../api/auth';

export const AuthContext = createContext();

export const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { user: action.payload };
    case 'LOGOUT':
      return { user: null };
    default:
      return state;
  }
};

export const AuthContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Fetch user data from server on app load
    const fetchUser = async () => {
      try {
        const response = await authAPI.getMe();
        // Check if response has success field and it's false, or if it's a successful response
        if (response.success === false) {
          // No valid session, user is not authenticated
          dispatch({ type: 'LOGOUT' });
        } else if (response.userId || response.userName) {
          // Valid user data received
          dispatch({ type: 'LOGIN', payload: response });
        } else {
          // Unexpected response format
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        // If request fails (401, network error, etc.), user is not authenticated
        console.log('Auth check failed:', error.message);
        dispatch({ type: 'LOGOUT' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  console.log('AuthContext state:', state);

  // Compute isAuthenticated based on user state
  const isAuthenticated = state.user !== null && state.user !== undefined;

  return <AuthContext.Provider value={{ ...state, dispatch, isLoading, isAuthenticated }}>{children}</AuthContext.Provider>;
};
