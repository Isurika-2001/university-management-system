import PropTypes from 'prop-types';
import { Box, Grid } from '@mui/material';
import AuthCard from './AuthCard';
import Logo from 'components/Logo';
import AuthFooter from 'components/cards/AuthFooter';
import AuthBackground from 'assets/images/auth/AuthBackground';

const AuthWrapper = ({ children }) => (
  <Box sx={{ minHeight: '100vh' }}>
    <AuthBackground />
    <Grid
      container
      direction="column"
      justifyContent="flex-end"
      alignItems="center" // Align items to center vertically
      sx={{
        minHeight: '100vh'
      }}
    >
      <Grid item xs={12} sx={{ mb:-11 }}>
        <Logo />
      </Grid>
      <Grid item xs={12}>
        <Grid
          item
          xs={12}
          container
          justifyContent="center"
          alignItems="center"
          sx={{ minHeight: { xs: 'calc(100vh - 134px)', md: 'calc(100vh - 112px)' } }}
        >
          <Grid item>
            <AuthCard>{children}</AuthCard>
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={12} sx={{ m: 3, mt: 1 }}>
        <AuthFooter />
      </Grid>
    </Grid>
  </Box>
);

AuthWrapper.propTypes = {
  children: PropTypes.node
};

export default AuthWrapper;
