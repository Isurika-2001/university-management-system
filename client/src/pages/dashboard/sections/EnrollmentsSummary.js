import React, { useEffect, useState } from 'react';
import { Grid, Typography } from '@mui/material';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';

const EnrollmentSummary = () => {
  const finalCounts = {
    Mern: 442236,
    DPE: 78250,
    English: 18800
  };

  const total = finalCounts.Mern + finalCounts.DPE + finalCounts.English;

  const PTMern = Math.round((finalCounts.Mern / total) * 100);
  const PTDPE = Math.round((finalCounts.DPE / total) * 100);
  const PTEnglish = Math.round((finalCounts.English / total) * 100);

  const [MernCount, setMernCount] = useState(0);
  const [DPECount, setDPECount] = useState(0);
  const [EnglishCount, setEnglishCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const animateCountIncrease = (setter, finalCount) => {
    const increment = Math.ceil(finalCount / 100);
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= finalCount) {
        current = finalCount;
        clearInterval(interval);
      }
      setter(current);
    }, 50);
  };

  useEffect(() => {
    animateCountIncrease(setMernCount, finalCounts.Mern);
    animateCountIncrease(setDPECount, finalCounts.DPE);
    animateCountIncrease(setEnglishCount, finalCounts.English);
    animateCountIncrease(setTotalCount, total);
  }, []);

  return (
    <>
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography variant="h5">Enrollment Summary</Typography>
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce title="Total Students Registered" count={MernCount.toLocaleString()} percentage={PTMern} color="warning" />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce title="Total Courses Offered" count={DPECount.toLocaleString()} percentage={PTDPE} color="warning" />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce title="Total Batches Running" count={EnglishCount.toLocaleString()} percentage={PTEnglish} color="warning" />
      </Grid>
      <Grid item xs={12} sm={6} md={4} lg={3}>
        <AnalyticEcommerce title="Today Registrations" count={totalCount.toLocaleString()} percentage={100} isLoss />
      </Grid>
    </>
  );
};

export default EnrollmentSummary;
