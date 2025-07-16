import React from 'react';
import { Grid, Typography, Stack, Box } from '@mui/material';
import MainCard from 'components/MainCard';
import MonthlyBarChart from '../MonthlyBarChart';

const PaymentOverview = () => (
  <Grid item xs={12} md={5} lg={4}>
    <Grid container alignItems="center" justifyContent="space-between">
      <Grid item>
        <Typography variant="h5">Students Per Course Distribution</Typography>
      </Grid>
    </Grid>
    <MainCard sx={{ mt: 2, minHeight: 500 }} content={false}>
      <Box sx={{ p: 3, pb: 0 }}>
        <Stack spacing={2}>
          <Typography variant="h6" color="textSecondary">
            Number of Registrations
          </Typography>
          <Typography variant="h3">LKR 72,650</Typography>
        </Stack>
      </Box>
      <MonthlyBarChart />
    </MainCard>
  </Grid>
);

export default PaymentOverview;
