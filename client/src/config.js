// ==============================|| THEME CONFIG  ||============================== //

const config = {
  defaultPath: '/app/dashboard',
  fontFamily: `'Public Sans', sans-serif`,
  i18n: 'en',
  miniDrawer: false,
  container: true,
  mode: 'light',
  presetColor: 'default',
  themeDirection: 'ltr',
  basename: '/',

  // Base API URL
  apiUrl: 'https://ums-demo-be.vercel.app/api/',
};

// Route endpoints based on your Express routes
export const apiRoutes = {
  studentRoute: `${config.apiUrl}student/`,
  courseRoute: `${config.apiUrl}course/`,
  batchRoute: `${config.apiUrl}batch/`,
  courseRegistrationRoute: `${config.apiUrl}course-registration/`,
  userTypeRoute: `${config.apiUrl}user-type/`,
  userRoute: `${config.apiUrl}user/`,
  authRoute: `${config.apiUrl}auth/`,
};

export default config;
export const drawerWidth = 260;

export const twitterColor = '#1DA1F2';
export const facebookColor = '#3b5998';
export const linkedInColor = '#0e76a8';
