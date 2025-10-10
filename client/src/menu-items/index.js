// project import
import pages from './pages';
import counselor_pages from './counselor-pages';
import dashboard from './dashboard';
import { useAuthContext } from 'context/useAuthContext';
import { hasPermission } from 'utils/userTypeUtils';

// ==============================|| MENU ITEMS ||============================== //

const MenuItems = () => {
  const { user } = useAuthContext();

  let items = [];

  // System Administrator - Full access to everything
  if (
    hasPermission(user, 'user', 'R') &&
    hasPermission(user, 'student', 'R') &&
    hasPermission(user, 'course', 'R') &&
    hasPermission(user, 'batch', 'R') &&
    hasPermission(user, 'enrollments', 'R') &&
    hasPermission(user, 'finance', 'R') &&
    hasPermission(user, 'reports', 'R')
  ) {
    items = [dashboard, pages];
  }
  // Academic Administrator - Access to academic functions
  else if (
    hasPermission(user, 'student', 'R') &&
    hasPermission(user, 'course', 'R') &&
    hasPermission(user, 'batch', 'R') &&
    hasPermission(user, 'enrollments', 'R')
  ) {
    items = [dashboard, counselor_pages];
  }
  // Finance Administrator - Access to finance and reports
  else if (hasPermission(user, 'enrollments', 'R') && hasPermission(user, 'finance', 'R') && hasPermission(user, 'reports', 'R')) {
    items = [
      dashboard,
      {
        ...pages,
        children: pages.children.filter((item) => ['enrollments', 'required-documents', 'users'].includes(item.id))
      }
    ];
  }
  // Accountant - Limited access to finance functions
  else if (hasPermission(user, 'enrollments', 'R') && hasPermission(user, 'finance', 'R')) {
    items = [
      dashboard,
      {
        ...pages,
        children: pages.children.filter((item) => ['enrollments', 'required-documents'].includes(item.id))
      }
    ];
  }

  return { items };
};

export default MenuItems;
