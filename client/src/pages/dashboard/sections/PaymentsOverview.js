import React from 'react';
import { useState } from 'react';
import { Grid, Typography, Stack, Box } from '@mui/material';
import MainCard from 'components/MainCard';
import MonthlyBarChart from '../MonthlyBarChart';

const PaymentOverview = () => {
  const [totalRegistrations, setTotalRegistrations] = useState(0);

  return (
    <Grid item xs={12} md={8} lg={8}>
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
            <Typography variant="h3">{(totalRegistrations || 0).toLocaleString()}</Typography>
          </Stack>
        </Box>
        <MonthlyBarChart onTotalChange={setTotalRegistrations} />
      </MainCard>
    </Grid>
  );
};

export default PaymentOverview;
