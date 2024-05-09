// material-ui
import { Typography } from '@mui/material';

// project import
import MainCard from 'components/MainCard';

// ==============================|| SAMPLE PAGE ||============================== //

const SamplePage = () => (
  <MainCard title="Sample Card">
    <Typography variant="body2">Access Denied</Typography>
    <Typography variant="body2">Sorry, you do not have permission to access this page.</Typography>
  </MainCard>
);

export default SamplePage;
