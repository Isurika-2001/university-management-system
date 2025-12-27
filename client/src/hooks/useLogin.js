import { useState } from 'react';
import { useAuthContext } from '../context/useAuthContext';
import { authAPI } from '../api/auth';

export const useLogin = () => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(null);
  const { dispatch } = useAuthContext();

  const login = async (values) => {
    setIsLoading(true);
    setError(null);

    try {
      const json = await authAPI.login(values);

      // Save the user to local storage
      localStorage.setItem('user', JSON.stringify(json));

      // Update the auth context
      dispatch({ type: 'LOGIN', payload: json });

      setIsLoading(false);

      return { success: true, message: json.message || 'Login successful' }; // return success
    } catch (err) {
      setIsLoading(false);
      setError(err.message || 'Login failed');
      console.error(err);
      return { success: false, message: err.message || 'Login failed' }; // return catch error
    }
  };

  return { login, isLoading, error };
};
