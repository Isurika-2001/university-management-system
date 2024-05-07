// assets
import {
  LoginOutlined,
  ProfileOutlined,
  UsergroupDeleteOutlined,
  AppstoreOutlined,
  BranchesOutlined,
  FileAddOutlined
} from '@ant-design/icons';

// icons
const icons = {
  LoginOutlined,
  ProfileOutlined,
  UsergroupDeleteOutlined,
  FileAddOutlined,
  AppstoreOutlined,
  BranchesOutlined
};

// ==============================|| MENU ITEMS - EXTRA PAGES ||============================== //

const pages = {
  id: 'pages',
  title: 'Pages',
  caption: '',
  type: 'group',
  children: [
    {
      id: 'students',
      title: 'Students',
      type: 'item',
      url: '/app/students',
      icon: icons.UsergroupDeleteOutlined
    },
    {
      id: 'course-registrations',
      title: 'Course Registrations',
      type: 'item',
      url: '/app/course-registrations',
      icon: icons.FileAddOutlined
    },
    {
      id: 'courses',
      title: 'Courses',
      type: 'item',
      url: '/app/courses',
      icon: icons.AppstoreOutlined
    },
    {
      id: 'batches',
      title: 'Batches',
      type: 'item',
      url: '/app/batches',
      icon: icons.BranchesOutlined
    },
    {
      id: 'users',
      title: 'Users',
      type: 'item',
      url: '/app/users',
      icon: icons.ProfileOutlined
    }
  ]
};

export default pages;
