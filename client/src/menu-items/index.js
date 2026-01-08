// project import
import categorizedPages from './categorized-pages';
import { useAuthContext } from 'context/useAuthContext';
import { hasPermission } from 'utils/userTypeUtils';

// ==============================|| MENU ITEMS ||============================== //

// Map menu item IDs to their required resource permissions
const menuItemPermissions = {
  // Main group - always visible if authenticated
  dashboard: null, // No specific permission needed

  // Students group
  students: 'student',
  'students-add': 'student', // Needs create permission
  enrollments: 'enrollments',

  // Academics group
  classrooms: 'classrooms',
  courses: 'course',
  modules: 'modules',
  intakes: 'batch',
  'required-documents': 'requiredDocument',

  // Exams group
  exams: 'exams',

  // Finance group
  'payment-plans': 'finance',

  // Settings group
  users: 'user'
};

const MenuItems = () => {
  const { user } = useAuthContext();

  if (!user) {
    return { items: [] };
  }

  // Get base categorized items
  const baseItems = [...categorizedPages.items];

  // Filter items based on permissions
  const filteredItems = baseItems
    .map((group) => {
      // Always show main group (dashboard)
      if (group.id === 'group-main') {
        return group;
      }

      // Filter children based on permissions
      if (group.children && Array.isArray(group.children)) {
        const filteredChildren = group.children.filter((child) => {
          const resource = menuItemPermissions[child.id];
          
          // If no permission mapping, show it (like dashboard)
          if (!resource) {
            return true;
          }

          // Check if user has read permission for this resource
          return hasPermission(user, resource, 'R');
        });

        // Only show group if it has visible children
        if (filteredChildren.length > 0) {
          return {
            ...group,
            children: filteredChildren
          };
        }
      }

      return null;
    })
    .filter(Boolean);

  return { items: filteredItems };
};

export default MenuItems;
