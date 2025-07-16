import React from 'react';
import { Grid } from '@mui/material';

import EnrollmentSummary from './sections/EnrollmentsSummary';
import PaymentOverview from './sections/PaymentsOverview';
import AnalyticsReport from './sections/AnalyticsReport';

import GeneralSummaryCards from './sections/GeneralSummaryCards';
import UpcomingEventsAndStudentSection from './sections/UpcomingEventsAndStudents';
import UserRolePanels from './sections/UserRolePanels';

const DashboardDefault = () => {

  const upcomingEventsData = {
    batchStartDates: ['2025-08-01', '2025-09-15'],
    registrationDeadlines: ['2025-07-31'],
    feeDueDates: ['2025-08-10']
  };

  const topCourses = [
    { name: 'Computer Science', enrolledCount: 500 },
    { name: 'Business Management', enrolledCount: 300 },
    { name: 'English Literature', enrolledCount: 200 }
  ];

  const userRole = 'admin'; // or 'counselor' or 'finance'
  const userRoleData = {
    totalUsers: 120,
    assignedLeads: 10,
    pendingPayments: 80000
  };

  return (
    <Grid container spacing={3}>
      <EnrollmentSummary />
      <PaymentOverview />
      <AnalyticsReport />

      <GeneralSummaryCards />
      <UpcomingEventsAndStudentSection events={upcomingEventsData} topCourses={topCourses} />
      <UserRolePanels role={userRole} data={userRoleData} />
    </Grid>
  );
};

export default DashboardDefault;
