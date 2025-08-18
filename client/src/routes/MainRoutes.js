import { lazy } from 'react';

// project import
import Loadable from 'components/Loadable';
import MainLayout from 'layout/MainLayout';

// render - dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/SamplePage')));
const Students = Loadable(lazy(() => import('pages/students/View')));
const StudentAdd = Loadable(lazy(() => import('pages/students/Add-new')));
const StudentUpdate = Loadable(lazy(() => import('pages/students/Update')));
const AdvancedRegistration = Loadable(lazy(() => import('pages/students/AdvancedRegistration')));
const RequiredDocuments = Loadable(lazy(() => import('pages/required-documents/View')));
const Enrollments = Loadable(lazy(() => import('pages/enrollments/View')));

// render - utilities
const Typography = Loadable(lazy(() => import('pages/components-overview/Typography')));
const Color = Loadable(lazy(() => import('pages/components-overview/Color')));
const Shadow = Loadable(lazy(() => import('pages/components-overview/Shadow')));
const AntIcons = Loadable(lazy(() => import('pages/components-overview/AntIcons')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'color',
      element: <Color />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    },
    {
      path: 'students',
      element: <Students />
    },
    {
      path: 'students/add',
      element: <StudentAdd />
    },
    {
      path: 'students/update',
      element: <StudentUpdate />
    },
    {
      path: 'students/advanced-registration',
      element: <AdvancedRegistration />
    },
    {
      path: 'required-documents',
      element: <RequiredDocuments />
    },
    {
      path: 'enrollments',
      element: <Enrollments />
    },
    {
      path: 'shadow',
      element: <Shadow />
    },
    {
      path: 'typography',
      element: <Typography />
    },
    {
      path: 'icons/ant',
      element: <AntIcons />
    }
  ]
};

export default MainRoutes;
