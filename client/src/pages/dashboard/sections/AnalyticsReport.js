import React from 'react';
import { useState } from 'react';
import { Grid, Typography, List, ListItemButton, ListItemText } from '@mui/material';
import MainCard from 'components/MainCard';
import ReportAreaChart from '../ReportAreaChart';

const AnalyticsReport = () => {
    const [stats, setStats] = useState({
    annualEnrollment: 0,
    monthlyEnrollment: 0,
    percentageOverAnnual: '0.00'
  });

  return (
    <Grid item xs={12} md={5} lg={4}>
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item>
          <Typography variant="h5">Enrollment Trends Over Months</Typography>
        </Grid>
      </Grid>
      <MainCard sx={{ mt: 2, maxHeight: 500 }} content={false}>
        <List sx={{ p: 0, '& .MuiListItemButton-root': { py: 2 } }}>
          <ListItemButton divider>
            <ListItemText primary="Annual Total Enrollment Numbers" />
            <Typography variant="h5">{stats.annualEnrollment}</Typography>
          </ListItemButton>
          <ListItemButton divider>
            <ListItemText primary="This Month Enrollment Numbers" />
            <Typography variant="h5">{stats.monthlyEnrollment}</Typography>
          </ListItemButton>
          <ListItemButton>
            <ListItemText primary="Percentage Over Annual Numbers" />
            <Typography variant="h5">{stats.percentageOverAnnual}%</Typography>
          </ListItemButton>
        </List>
        <ReportAreaChart onStatsChange={setStats} />
      </MainCard>
    </Grid>
  );
};

export default AnalyticsReport;
