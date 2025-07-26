// project import
import { Box, Typography } from '@mui/material';
import Navigation from './Navigation';
import SimpleBar from 'components/third-party/SimpleBar';

// ==============================|| DRAWER CONTENT ||============================== //

const DrawerContent = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <SimpleBar
      style={{ flexGrow: 1 }}
      sx={{
        '& .simplebar-content': {
          display: 'flex',
          flexDirection: 'column',
          height: '100%'
        }
      }}
    >
      <Navigation />
    </SimpleBar>

    <Box
      sx={{
        pl: 4,
        pb: 1,
      }}
    >
      <Typography variant="caption" color="textSecondary">
        Version 1.0.2
      </Typography>
    </Box>
  </Box>
);

export default DrawerContent;
