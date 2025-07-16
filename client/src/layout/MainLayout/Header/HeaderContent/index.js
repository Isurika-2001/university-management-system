// material-ui
import { Box, useMediaQuery } from '@mui/material';
// import { GithubOutlined } from '@ant-design/icons';

// project import
import Profile from './Profile';
// import Notification from './Notification';
import MobileSection from './MobileSection';

// ==============================|| HEADER - CONTENT ||============================== //

const HeaderContent = () => {
  const matchesXs = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <>
      {matchesXs && <Box sx={{ width: '100%', ml: 1 }} />}

      {/* <Notification /> */}

      {!matchesXs && (
        <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <Profile />
        </Box>
      )}

      {matchesXs && <MobileSection />}
    </>
  );
};

export default HeaderContent;
