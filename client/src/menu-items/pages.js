// assets
import { LoginOutlined, ProfileOutlined, UsergroupDeleteOutlined, AppstoreOutlined, BranchesOutlined } from '@ant-design/icons';

// icons
const icons = {
  LoginOutlined,
  ProfileOutlined,
  UsergroupDeleteOutlined,
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
    }
  ]
};

export default pages;
