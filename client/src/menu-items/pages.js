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
      id: 'enrollments',
      title: 'Enrollments',
      type: 'item',
      url: '/app/enrollments',
      icon: icons.FileAddOutlined
    },
    {
      id: 'required-documents',
      title: 'Required Documents',
      type: 'item',
      url: '/app/required-documents',
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
        id: 'modules',
        title: 'Modules',
        type: 'item',
        url: '/app/modules',
        icon: icons.BranchesOutlined
      },
    {
      id: 'classrooms',
      title: 'Classrooms',
      type: 'item',
      url: '/app/classrooms',
      icon: icons.BranchesOutlined
    },
    {
      id: 'exams',
      title: 'Exams',
      type: 'item',
      url: '/app/exams',
      icon: icons.FileAddOutlined
    },
    {
      id: 'intakes',
      title: 'Intakes',
      type: 'item',
      url: '/app/intakes',
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
