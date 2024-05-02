// assets
import { LoginOutlined, ProfileOutlined, UsergroupDeleteOutlined } from '@ant-design/icons';

// icons
const icons = {
  LoginOutlined,
  ProfileOutlined,
  UsergroupDeleteOutlined
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
      icon: icons.UsergroupDeleteOutlined
    },
    {
      id: 'batches',
      title: 'Batches',
      type: 'item',
      url: '/app/batches',
      icon: icons.UsergroupDeleteOutlined
    }
  ]
};

export default pages;
