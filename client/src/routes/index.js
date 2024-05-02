import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Loadable from 'components/Loadable';
import MainLayout from 'layout/MainLayout';
import { lazy } from 'react';

// render - dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/SamplePage')));

// view pages
const Students = Loadable(lazy(() => import('pages/students/Students')));

// add new pages
const AddStudentForm = Loadable(lazy(() => import('pages/students/Add-new')));

// update pages
const UpdateStudentForm = Loadable(lazy(() => import('pages/students/Update')));

const AuthLogin = Loadable(lazy(() => import('pages/authentication/Login')));
const AuthRegister = Loadable(lazy(() => import('pages/authentication/Register')));

// render - utilities
const Typography = Loadable(lazy(() => import('pages/components-overview/Typography')));
const Color = Loadable(lazy(() => import('pages/components-overview/Color')));
const Shadow = Loadable(lazy(() => import('pages/components-overview/Shadow')));
const AntIcons = Loadable(lazy(() => import('pages/components-overview/AntIcons')));

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/app/dashboard" />} />
      <Route path="pages" element={<Outlet />}>
        <Route path="login" element={<AuthLogin />} />
        <Route path="register" element={<AuthRegister />} />
      </Route>

      {/* <Route path="*" element={<PageNotFound />} /> */}

      <Route path="app" element={<MainLayout />}>
        {/* <Route path="access-denied" element={<AccessDeniedPage />} /> */}
        <Route path="dashboard" element={<DashboardDefault />} />
        {/* <Route path="profile" element={<UserForm />} /> */}

        {/* Artist section */}
        <Route path="students" element={<Outlet />}>
          <Route index element={<Students />} />
          <Route path="add" element={<AddStudentForm />} />
          <Route path="update" element={<UpdateStudentForm />} />
        </Route>

        {/* Sample page */}
        <Route path="sample-page" element={<SamplePage />} />

        {/* Utilities */}
        <Route path="typography" element={<Typography />} />
        <Route path="color" element={<Color />} />
        <Route path="shadow" element={<Shadow />} />
        <Route path="icons/ant" element={<AntIcons />} />
      </Route>
    </Routes>
  );
}
