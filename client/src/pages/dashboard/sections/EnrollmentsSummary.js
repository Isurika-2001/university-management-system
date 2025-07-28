import React, { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import { useAuthContext } from 'context/useAuthContext';
import { apiRoutes } from 'config';

const EnrollmentSummary = () => {
  const { user } = useAuthContext();
  const [animatedCounts, setAnimatedCounts] = useState({
    totalRegistrations: 0,
    totalRunningCourses: 0,
    totalCourses: 0,
    totalRunningBatches: 0,
    totalBatches: 0,
    todaysRegistrations: 0
  });

  const animateCountIncrease = (key, finalCount) => {
    const increment = Math.ceil(finalCount / 100);
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= finalCount) {
        current = finalCount;
        clearInterval(interval);
      }
      setAnimatedCounts((prev) => ({ ...prev, [key]: current }));
    }, 20);
  };

  useEffect(() => {
    console.log('Fetching enrollment summary data...');
    async function fetchData() {
      try {
        const response = await fetch(apiRoutes.statRoute + 'enrollment', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          }
        });
        const json = await response.json();

        if (json.success && json.data) {
          Object.entries(json.data).forEach(([key, value]) => {
            animateCountIncrease(key, value);
          });
        } else {
          console.error('Failed to fetch enrollment summary:', json.message);
        }
      } catch (error) {
        console.error('Error fetching enrollment summary:', error);
      }
    }
    fetchData();
  }, []);

  return (
    <>
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography variant="h5">Enrollment Summary</Typography>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce title="Total Students Registered" count={animatedCounts.totalRegistrations.toLocaleString()} />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce
          title="Total Courses Offered"
          count={`${animatedCounts.totalRunningCourses.toLocaleString()} / ${animatedCounts.totalCourses.toLocaleString()}`}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce
          title="Total Batches Running"
          count={`${animatedCounts.totalRunningBatches.toLocaleString()} / ${animatedCounts.totalBatches.toLocaleString()}`}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce title="Today's Course Registrations" count={animatedCounts.todaysRegistrations.toLocaleString()} />
      </Grid>
    </>
  );
};

export default EnrollmentSummary;
