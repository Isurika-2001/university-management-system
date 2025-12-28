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
const Modules = Loadable(lazy(() => import('pages/modules/View')));
const Enrollments = Loadable(lazy(() => import('pages/enrollments/View')));
const Classrooms = Loadable(lazy(() => import('pages/classrooms/View')));
const ClassroomDetail = Loadable(lazy(() => import('pages/classrooms/Detail')));
const Users = Loadable(lazy(() => import('pages/users/View')));
const RequiredDocuments = Loadable(lazy(() => import('pages/required-documents/View')));
const Exams = Loadable(lazy(() => import('pages/exams/View')));
const ExamDetail = Loadable(lazy(() => import('pages/exams/Detail')));

// add new pages
const AddStudentForm = Loadable(lazy(() => import('pages/students/Add-new')));
const AddBatchForm = Loadable(lazy(() => import('pages/batches/Add-new')));
const AddCourseForm = Loadable(lazy(() => import('pages/courses/Add-new')));
const AddEnrollmentForm = Loadable(lazy(() => import('pages/enrollments/Add-new')));
const AddRequiredDocumentForm = Loadable(lazy(() => import('pages/required-documents/Add-new')));
// const AddCourseRegistrationForm = Loadable(lazy(() => import('pages/course-registrations/Add-new')));
const AddUserForm = Loadable(lazy(() => import('pages/users/Add-new')));
const AddClassroom = Loadable(lazy(() => import('pages/classrooms/Add-new')));

// update pages
const UpdateStudentForm = Loadable(lazy(() => import('pages/students/Update')));
const UpdateBatchForm = Loadable(lazy(() => import('pages/batches/Update')));
const UpdateCourseForm = Loadable(lazy(() => import('pages/courses/Update')));
const UpdateEnrollmentForm = Loadable(lazy(() => import('pages/enrollments/Update')));
const UpdateRequiredDocumentForm = Loadable(lazy(() => import('pages/required-documents/Update')));
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
          <Route index element={permissions?.student?.includes('R') ? <Students /> : <Navigate to="/app/access-denied" replace />} />
          <Route
            path="add"
            element={permissions?.student?.includes('C') ? <AddStudentForm /> : <Navigate to="/app/access-denied" replace />}
          />

          <Route
            path="update/:id"
            element={permissions?.student?.includes('U') ? <UpdateStudentForm /> : <Navigate to="/app/access-denied" replace />}
          />
        </Route>

        {/* Enrollments section */}
        <Route path="enrollments" element={<Outlet />}>
          <Route index element={permissions?.enrollments?.includes('R') ? <Enrollments /> : <Navigate to="/app/access-denied" replace />} />
          <Route
            path="add"
            element={permissions?.enrollments?.includes('C') ? <AddEnrollmentForm /> : <Navigate to="/app/access-denied" replace />}
          />
          <Route
            path="update/:id"
            element={permissions?.enrollments?.includes('U') ? <UpdateEnrollmentForm /> : <Navigate to="/app/access-denied" replace />}
          />
        </Route>

        {/* Course section */}
        <Route path="courses" element={<Outlet />}>
          <Route index element={permissions?.course?.includes('R') ? <Courses /> : <Navigate to="/app/access-denied" replace />} />
          <Route
            path="add"
            element={permissions?.course?.includes('C') ? <AddCourseForm /> : <Navigate to="/app/access-denied" replace />}
          />
          <Route
            path="update/:id"
            element={permissions?.course?.includes('U') ? <UpdateCourseForm /> : <Navigate to="/app/access-denied" replace />}
          />
        </Route>

        {/* Modules section */}
        <Route path="modules" element={<Outlet />}>
          <Route index element={permissions?.modules?.includes('R') ? <Modules /> : <Navigate to="/app/access-denied" replace />} />
        </Route>

        {/* Classrooms section */}
        <Route path="classrooms" element={<Outlet />}>
          <Route index element={permissions?.classrooms?.includes('R') ? <Classrooms /> : <Navigate to="/app/access-denied" replace />} />
          <Route
            path="add"
            element={permissions?.classrooms?.includes('C') ? <AddClassroom /> : <Navigate to="/app/access-denied" replace />}
          />
          <Route
            path="detail/:id"
            element={permissions?.classrooms?.includes('R') ? <ClassroomDetail /> : <Navigate to="/app/access-denied" replace />}
          />
        </Route>

        {/* Exams section */}
        <Route path="exams" element={<Outlet />}>
          <Route index element={permissions?.exams?.includes('R') ? <Exams /> : <Navigate to="/app/access-denied" replace />} />
          <Route
            path=":classroomId"
            element={permissions?.exams?.includes('R') ? <ExamDetail /> : <Navigate to="/app/access-denied" replace />}
          />
        </Route>

        {/* Batch section */}
        <Route path="intakes" element={<Outlet />}>
          <Route index element={permissions?.batch?.includes('R') ? <Batches /> : <Navigate to="/app/access-denied" replace />} />
          <Route path="add" element={permissions?.batch?.includes('C') ? <AddBatchForm /> : <Navigate to="/app/access-denied" replace />} />
          <Route
            path="update/:id"
            element={permissions?.batch?.includes('U') ? <UpdateBatchForm /> : <Navigate to="/app/access-denied" replace />}
          />
        </Route>

        {/* User section */}
        <Route path="users" element={<Outlet />}>
          <Route index element={permissions?.user?.includes('R') ? <Users /> : <Navigate to="/app/access-denied" replace />} />
          <Route path="add" element={permissions?.user?.includes('C') ? <AddUserForm /> : <Navigate to="/app/access-denied" replace />} />
          <Route
            path="update/:id"
            element={permissions?.user?.includes('U') ? <UpdateUserForm /> : <Navigate to="/app/access-denied" replace />}
          />
        </Route>

        {/* Required Documents section */}
        <Route path="required-documents" element={<Outlet />}>
          <Route
            index
            element={permissions?.student?.includes('R') ? <RequiredDocuments /> : <Navigate to="/app/access-denied" replace />}
          />
          <Route
            path="add"
            element={permissions?.student?.includes('C') ? <AddRequiredDocumentForm /> : <Navigate to="/app/access-denied" replace />}
          />
          <Route
            path="update/:id"
            element={permissions?.student?.includes('U') ? <UpdateRequiredDocumentForm /> : <Navigate to="/app/access-denied" replace />}
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
