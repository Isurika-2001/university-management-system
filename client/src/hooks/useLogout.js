import { useAuthContext } from 'context/useAuthContext';
import { handleLogout } from '../utils/authUtils';

export const useLogout = () => {
  const { dispatch } = useAuthContext();

  const logout = () => {
    // Clear auth context
    dispatch({ type: 'LOGOUT' });
    
    // Use centralized logout function
    handleLogout();
  };

  return { logout };
};
