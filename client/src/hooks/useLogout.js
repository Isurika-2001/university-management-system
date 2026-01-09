import { useAuthContext } from 'context/useAuthContext';
import { handleLogout } from '../utils/authUtils';

export const useLogout = () => {
  const { dispatch } = useAuthContext();

  const logout = async () => {
    // Clear auth context
    dispatch({ type: 'LOGOUT' });

    // Use centralized logout function (handles API call and redirect)
    await handleLogout();
  };

  return { logout };
};
