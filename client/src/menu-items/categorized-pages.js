// assets
import {
  DashboardOutlined,
  LineChartOutlined,
  UserOutlined,
  TeamOutlined,
  UserAddOutlined,
  SolutionOutlined,
  BankOutlined,
  HomeOutlined,
  ReadOutlined,
  CalendarOutlined,
  FileDoneOutlined,
  ScheduleOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
  DollarCircleOutlined,
  ProjectOutlined,
  TransactionOutlined,
  SettingOutlined,
  UsergroupAddOutlined,
  AppstoreAddOutlined,
  DatabaseOutlined,
  UnorderedListOutlined
} from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  LineChartOutlined,
  UserOutlined,
  TeamOutlined,
  UserAddOutlined,
  SolutionOutlined,
  BankOutlined,
  HomeOutlined,
  ReadOutlined,
  CalendarOutlined,
  FileDoneOutlined,
  ScheduleOutlined,
  EditOutlined,
  SafetyCertificateOutlined,
  DollarCircleOutlined,
  ProjectOutlined,
  TransactionOutlined,
  SettingOutlined,
  UsergroupAddOutlined,
  AppstoreAddOutlined,
  DatabaseOutlined,
  UnorderedListOutlined
};

// ==============================|| MENU ITEMS - CATEGORIZED PAGES ||============================== //

const categorizedPages = {
  items: [
    // MAIN GROUP - DASHBOARD & OVERVIEW
    {
      id: 'group-main',
      title: 'Dashboard & Overview',
      type: 'group',
      defaultExpanded: true,
      children: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          type: 'item',
          url: '/',
          icon: icons.LineChartOutlined,
          breadcrumbs: false
        }
      ]
    },

    // STUDENTS GROUP - STUDENT LIFECYCLE
    {
      id: 'group-students',
      title: 'Student Lifecycle',
      type: 'collapse',
      defaultExpanded: true,
      icon: icons.UserOutlined,
      children: [
        {
          id: 'students',
          title: 'Students',
          type: 'item',
          url: '/app/students',
          icon: icons.TeamOutlined
        },
        {
          id: 'students-add',
          title: 'Add New Student',
          type: 'item',
          url: '/app/students/add',
          icon: icons.UserAddOutlined
        },
        {
          id: 'enrollments',
          title: 'Enrollments',
          type: 'item',
          url: '/app/enrollments',
          icon: icons.SolutionOutlined
        }
      ]
    },

    // ACADEMICS GROUP - ACADEMIC MANAGEMENT
    {
      id: 'group-academics',
      title: 'Academic Management',
      type: 'collapse',
      defaultExpanded: false,
      icon: icons.BankOutlined,
      children: [
        {
          id: 'classrooms',
          title: 'Classrooms',
          type: 'item',
          url: '/app/classrooms',
          icon: icons.HomeOutlined
        },
        {
          id: 'courses',
          title: 'Courses',
          type: 'item',
          url: '/app/courses',
          icon: icons.ReadOutlined
        },
        {
          id: 'modules',
          title: 'Modules',
          type: 'item',
          url: '/app/modules',
          icon: icons.ReadOutlined
        },
        {
          id: 'intakes',
          title: 'Intakes',
          type: 'item',
          url: '/app/intakes',
          icon: icons.CalendarOutlined
        },
        {
          id: 'required-documents',
          title: 'Required Documents',
          type: 'item',
          url: '/app/required-documents',
          icon: icons.SolutionOutlined
        }
      ]
    },

    // EXAMS GROUP - ASSESSMENT & PROGRESS
    {
      id: 'group-exams',
      title: 'Assessment & Progress',
      type: 'collapse',
      defaultExpanded: false,
      icon: icons.FileDoneOutlined,
      children: [
        {
          id: 'exams',
          title: 'Exams',
          type: 'item',
          url: '/app/exams',
          icon: icons.ScheduleOutlined
        }
      ]
    },

    // FINANCE GROUP - FINANCIALS
    {
      id: 'group-finance',
      title: 'Financials',
      type: 'collapse',
      defaultExpanded: false,
      icon: icons.DollarCircleOutlined,
      children: [
        {
          id: 'payment-plans',
          title: 'Payment Schemas',
          type: 'item',
          url: '/app/payment-plans',
          icon: icons.ProjectOutlined
        }
      ]
    },

    // SETTINGS GROUP - ADMINISTRATION & SETTINGS
    {
      id: 'group-settings',
      title: 'Administration & Settings',
      type: 'collapse',
      defaultExpanded: false,
      icon: icons.SettingOutlined,
      children: [
        {
          id: 'users',
          title: 'User Management',
          type: 'item',
          url: '/app/users',
          icon: icons.UsergroupAddOutlined
        }
      ]
    }
  ]
};

export default categorizedPages;
