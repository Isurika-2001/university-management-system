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
// const AddCourseRegistrationForm = Loadable(lazy(() => import('pages/course-registrations/Add-new')));
const AddUserForm = Loadable(lazy(() => import('pages/users/Add-new')));

// update pages
const UpdateStudentForm = Loadable(lazy(() => import('pages/students/Update')));
const UpdateBatchForm = Loadable(lazy(() => import('pages/batches/Update')));
const UpdateCourseForm = Loadable(lazy(() => import('pages/courses/Update')));
const UpdateCourseRegistrationForm = Loadable(lazy(() => import('pages/course-registrations/Update')));
const UpdateUserForm = Loadable(lazy(() => import('pages/users/Update')));

const AuthLogin = Loadable(lazy(() => import('pages/authentication/Login')));

// render - utilities
const Typography = Loadable(lazy(() => import('pages/components-overview/Typography')));
const Color = Loadable(lazy(() => import('pages/components-overview/Color')));
const Shadow = Loadable(lazy(() => import('pages/components-overview/Shadow')));
const AntIcons = Loadable(lazy(() => import('pages/components-overview/AntIcons')));

// ==============================|| ROUTING RENDER ||============================== //

export default function ThemeRoutes() {
  const { user } = useAuthContext();
  const { permissions } = user || {};

  return (
    <Routes>
      <Route path="/" element={!user ? <AuthLogin /> : <Navigate to="/app/dashboard" />} />

      <Route path="*" element={<SamplePage />} />

      {/* <Route path="*" element={<PageNotFound />} /> */}

      <Route path="app" element={user ? <MainLayout /> : <Navigate to="/" />}>
        <Route path="access-denied" element={<SamplePage />} />
        <Route path="dashboard" element={<DashboardDefault />} />
        {/* <Route path="profile" element={<UserForm />} /> */}

        {/* Student section */}
        <Route path="students" element={<Outlet />}>
          <Route index element={permissions?.student?.includes('read-all') ? <Students /> : <Navigate to="/app/access-denied" replace />} />
          <Route
            path="add"
            element={permissions?.student?.includes('create') ? <AddStudentForm /> : <Navigate to="/app/access-denied" replace />}
          />
          <Route
            path="update"
            element={permissions?.student?.includes('update') ? <UpdateStudentForm /> : <Navigate to="/app/access-denied" replace />}
          />
        </Route>

        {/* Course-Registrations section */}
        <Route path="course-registrations" element={<Outlet />}>
          <Route
            index
            element={
              permissions?.registrations?.includes('read-all') ? <CourseRegistrations /> : <Navigate to="/app/access-denied" replace />
            }
          />
          <Route
            path="update"
            element={
              permissions?.registrations?.includes('update') ? (
                <UpdateCourseRegistrationForm />
              ) : (
                <Navigate to="/app/access-denied" replace />
              )
            }
          />
        </Route>

        {/* Course section */}
        <Route path="courses" element={<Outlet />}>
          <Route index element={permissions?.course?.includes('read-all') ? <Courses /> : <Navigate to="/app/access-denied" replace />} />
          <Route
            path="add"
            element={permissions?.course?.includes('create') ? <AddCourseForm /> : <Navigate to="/app/access-denied" replace />}
          />
          <Route
            path="update"
            element={permissions?.course?.includes('create') ? <UpdateCourseForm /> : <Navigate to="/app/access-denied" replace />}
          />
        </Route>

        {/* Batch section */}
        <Route path="batches" element={<Outlet />}>
          <Route index element={permissions?.batch?.includes('read-all') ? <Batches /> : <Navigate to="/app/access-denied" replace />} />
          <Route
            path="add"
            element={permissions?.batch?.includes('create') ? <AddBatchForm /> : <Navigate to="/app/access-denied" replace />}
          />
          <Route
            path="update"
            element={permissions?.batch?.includes('update-all') ? <UpdateBatchForm /> : <Navigate to="/app/access-denied" replace />}
          />
        </Route>

        {/* User section */}
        <Route path="users" element={<Outlet />}>
          <Route index element={permissions?.user?.includes('read-all') ? <Users /> : <Navigate to="/app/access-denied" replace />} />
          <Route
            path="add"
            element={permissions?.user?.includes('create') ? <AddUserForm /> : <Navigate to="/app/access-denied" replace />}
          />
          <Route
            path="update"
            element={permissions?.user?.includes('update-all') ? <UpdateUserForm /> : <Navigate to="/app/access-denied" replace />}
          />
        </Route>

        <Route path="typography" element={<Typography />} />
        <Route path="color" element={<Color />} />
        <Route path="shadow" element={<Shadow />} />
        <Route path="icons/ant" element={<AntIcons />} />
      </Route>
    </Routes>
  );
}
