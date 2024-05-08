// project import
import pages from './pages';
import counselor_pages from './counselor-pages';
import dashboard from './dashboard';
import { useAuthContext } from 'context/useAuthContext';

// ==============================|| MENU ITEMS ||============================== //

const MenuItems = () => {
  const { user } = useAuthContext();
  const userType = user?.userType?.name;
  
  let items = [];
  
  if (userType === 'admin') {
    items = [dashboard, pages];
  } else if (userType === 'counselor') {
    items = [dashboard, counselor_pages];
  }
  
  return { items };
};

export default MenuItems;
