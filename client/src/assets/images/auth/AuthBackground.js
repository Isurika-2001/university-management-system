// material-ui
import { useTheme } from '@mui/material/styles';
import { Box } from '@mui/material';

// ==============================|| AUTH BLUR BACK SVG ||============================== //

const AuthBackground = () => {
  const theme = useTheme();
  return (
   <Box sx={{ position: 'absolute', filter: 'blur(18px)', zIndex: -1, bottom: 0 }}>
      <svg width="100%" height="calc(100vh - 175px)" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="200" height="200" fill={theme.palette.primary.light} />
        <rect x="200" y="200" width="200" height="200" fill={theme.palette.secondary.light} />
        <rect x="0" y="200" width="200" height="200" fill={theme.palette.error.light} />
        <rect x="200" y="0" width="200" height="200" fill={theme.palette.success.light} />
      </svg>
    </Box>
  );
};

export default AuthBackground;
