import React from 'react';
import { Grid } from '@mui/material';

import EnrollmentSummary from './sections/EnrollmentsSummary';
import PaymentOverview from './sections/PaymentsOverview';
import AnalyticsReport from './sections/AnalyticsReport';

import GeneralSummaryCards from './sections/GeneralSummaryCards';
const DashboardDefault = () => {

  return (
    <Grid container spacing={3}>
      <EnrollmentSummary />
      <PaymentOverview />
      <AnalyticsReport />

      <GeneralSummaryCards />
    </Grid>
  );
};

export default DashboardDefault;
