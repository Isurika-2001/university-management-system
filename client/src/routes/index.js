import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/useAuthContext';
import Loadable from 'components/Loadable';
import MainLayout from 'layout/MainLayout';
import { lazy } from 'react';

// render - dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/SamplePage')));

// view pages
const Students = Loadable(lazy(() => import('pages/students/View')));
const Batches = Loadable(lazy(() => import('pages/batches/View')));
const Courses = Loadable(lazy(() => import('pages/courses/View')));
const CourseRegistrations = Loadable(lazy(() => import('pages/course-registrations/View')));
const Users = Loadable(lazy(() => import('pages/users/View')));

// add new pages
const AddStudentForm = Loadable(lazy(() => import('pages/students/Add-new')));
const AddBatchForm = Loadable(lazy(() => import('pages/batches/Add-new')));
const AddCourseForm = Loadable(lazy(() => import('pages/courses/Add-new')));
const AddCourseRegistrationForm = Loadable(lazy(() => import('pages/course-registrations/Add-new')));
const AddUserForm = Loadable(lazy(() => import('pages/users/Add-new')));

// update pages
const UpdateStudentForm = Loadable(lazy(() => import('pages/students/Update')));
const UpdateBatchForm = Loadable(lazy(() => import('pages/batches/Update')));
const UpdateCourseForm = Loadable(lazy(() => import('pages/courses/Update')));
const UpdateCourseRegistrationForm = Loadable(lazy(() => import('pages/course-registrations/Update')));
const UpdateUserForm = Loadable(lazy(() => import('pages/users/Update')));

const AuthLogin = Loadable(lazy(() => import('pages/authentication/Login')));
const AuthRegister = Loadable(lazy(() => import('pages/authentication/Register')));

// render - utilities
const Typography = Loadable(lazy(() => import('pages/components-overview/Typography')));
const Color = Loadable(lazy(() => import('pages/components-overview/Color')));
const Shadow = Loadable(lazy(() => import('pages/components-overview/Shadow')));
const AntIcons = Loadable(lazy(() => import('pages/components-overview/AntIcons')));

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  const { user } = useAuthContext();
  // const { permissions } = user || {};

  return (
    <Routes>
      <Route path="/" element={!user ? <Navigate to="/pages/login" replace /> : <Navigate to="/app/dashboard" />} />
      <Route path="/login" element={<AuthLogin />} />

      <Route path="pages" element={<Outlet />}>
        <Route path="login" element={<AuthLogin />} />
        <Route path="register" element={<AuthRegister />} />
      </Route>

      {/* <Route path="*" element={<PageNotFound />} /> */}

      <Route path="app" element={<MainLayout />}>
        {/* <Route path="access-denied" element={<AccessDeniedPage />} /> */}
        <Route path="dashboard" element={<DashboardDefault />} />
        {/* <Route path="profile" element={<UserForm />} /> */}

        {/* Student section */}
        <Route path="students" element={<Outlet />}>
          <Route index element={<Students />} />
          <Route path="add" element={<AddStudentForm />} />
          <Route path="update" element={<UpdateStudentForm />} />
        </Route>

        {/* Course-Registrations section */}
        <Route path="course-registrations" element={<Outlet />}>
          <Route index element={<CourseRegistrations />} />
          <Route path="add" element={<AddCourseRegistrationForm />} />
          <Route path="update" element={<UpdateCourseRegistrationForm />} />
        </Route>

        {/* Course section */}
        <Route path="courses" element={<Outlet />}>
          <Route index element={<Courses />} />
          <Route path="add" element={<AddCourseForm />} />
          <Route path="update" element={<UpdateCourseForm />} />
        </Route>

        {/* Batch section */}
        <Route path="batches" element={<Outlet />}>
          <Route index element={<Batches />} />
          <Route path="add" element={<AddBatchForm />} />
          <Route path="update" element={<UpdateBatchForm />} />
        </Route>

        {/* User section */}
        <Route path="users" element={<Outlet />}>
          <Route index element={<Users />} />
          <Route path="add" element={<AddUserForm />} />
          <Route path="update" element={<UpdateUserForm />} />
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
