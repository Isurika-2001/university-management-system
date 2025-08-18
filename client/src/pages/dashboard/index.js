import React from 'react';
import { Grid, Box, Typography, useTheme } from '@mui/material';
import { RiseOutlined } from '@ant-design/icons';

import EnrollmentSummary from './sections/EnrollmentsSummary';
import PaymentOverview from './sections/PaymentsOverview';
import AnalyticsReport from './sections/AnalyticsReport';
import RecentStudents from './sections/RecentStudents';
import RecentLogins from './sections/RecentLogins';
import GeneralSummaryCards from './sections/GeneralSummaryCards';

const DashboardDefault = () => {
  const theme = useTheme();

  return (
    <Box sx={{ p: 3, backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      {/* Dashboard Header */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h3" 
          sx={{ 
            fontWeight: 700, 
            color: theme.palette.primary.main,
            mb: 1,
            background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Dashboard Overview
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          Welcome back! Here&apos;s what&apos;s happening with your university management system.
        </Typography>
      </Box>

      {/* Key Metrics Section */}
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h5" 
          sx={{ 
            fontWeight: 600, 
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            color: theme.palette.grey[800]
          }}
        >
          <RiseOutlined style={{ color: theme.palette.primary.main }} />
          Key Performance Metrics
        </Typography>
        <EnrollmentSummary />
      </Box>

      {/* Main Content Grid */}
      <Grid container spacing={3}>

        {/* Left Column - Recent Activities */}
        <Grid item xs={12} lg={6}>
          <Grid container spacing={3}>

            {/* Payment Overview */}
            <Grid item xs={12}>
              <PaymentOverview />
            </Grid>
            
            {/* Recent Students */}
            <Grid item xs={12}>
              <RecentStudents />
            </Grid>
          </Grid>
        </Grid>

        {/* Right Column - Quick Stats & Events */}
        <Grid item xs={12} lg={6}>
          <Grid container spacing={3}>
            
            {/* Recent Logins */}
            <Grid item xs={12}>
              <RecentLogins />
            </Grid>
            
            {/* Analytics Report */}
            <Grid item xs={12}>
              <AnalyticsReport />
            </Grid>
          </Grid>
        </Grid>        
        
        {/* Full Column - Events */}
        <Grid item xs={12} lg={12}>
          <Grid container spacing={3}>
            
            {/* Upcoming Events */}
            <Grid item xs={12}>
              <GeneralSummaryCards />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default DashboardDefault;
