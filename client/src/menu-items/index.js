// project import
import categorizedPages from './categorized-pages';
import { useAuthContext } from 'context/useAuthContext';
import { hasPermission } from 'utils/userTypeUtils';

// ==============================|| MENU ITEMS ||============================== //

const MenuItems = () => {
  const { user } = useAuthContext();

  let items = [];

  // Get base categorized items
  const baseItems = [...categorizedPages.items];

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
    items = baseItems;
  }
  // Academic Administrator - Access to academic functions
  else if (
    hasPermission(user, 'student', 'R') &&
    hasPermission(user, 'course', 'R') &&
    hasPermission(user, 'batch', 'R') &&
    hasPermission(user, 'enrollments', 'R')
  ) {
    // Filter to show: Main, Students, Academics, Exams
    items = baseItems.filter((item) =>
      ['group-main', 'group-students', 'group-academics', 'group-exams'].includes(item.id)
    );
  }
  // Finance Administrator - Access to finance and reports
  else if (hasPermission(user, 'enrollments', 'R') && hasPermission(user, 'finance', 'R') && hasPermission(user, 'reports', 'R')) {
    // Filter to show: Main, Students, Finance, Settings
    items = baseItems.map((item) => {
      if (item.id === 'group-students') {
        // Only show Student Directory and Enrollments
        return {
          ...item,
          children: item.children.filter((child) => ['students', 'enrollments'].includes(child.id))
        };
      }
      if (['group-main', 'group-finance', 'group-settings'].includes(item.id)) {
        return item;
      }
      return null;
    }).filter(Boolean);
  }
  // Accountant - Limited access to finance functions
  else if (hasPermission(user, 'enrollments', 'R') && hasPermission(user, 'finance', 'R')) {
    // Filter to show: Main, Students (enrollments only), Finance
    items = baseItems.map((item) => {
      if (item.id === 'group-students') {
        return {
          ...item,
          children: item.children.filter((child) => ['enrollments'].includes(child.id))
        };
      }
      if (['group-main', 'group-finance'].includes(item.id)) {
        return item;
      }
      return null;
    }).filter(Boolean);
  }

  return { items };
};

export default MenuItems;
