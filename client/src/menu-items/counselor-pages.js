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

// ==============================|| MENU ITEMS - ACADEMIC ADMINISTRATOR PAGES ||============================== //

const counselor_pages = {
  id: 'pages',
  title: 'Academic Management',
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
      id: 'enrollments',
      title: 'Enrollments',
      type: 'item',
      url: '/app/enrollments',
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
      id: 'intakes',
      title: 'Intakes',
      type: 'item',
      url: '/app/intakes',
      icon: icons.BranchesOutlined
    }
  ]
};

export default counselor_pages;
