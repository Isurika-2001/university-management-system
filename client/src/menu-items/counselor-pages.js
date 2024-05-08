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

const counselor_pages = {
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
    }
  ]
};

export default counselor_pages;
