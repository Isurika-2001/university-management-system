import React from 'react';
import { Grid, Typography, Card, CardContent } from '@mui/material';
import { getUserRoleDisplayName } from '../../../utils/userTypeUtils';

const UserRolePanels = ({ role, data }) => {
  // data structure depends on role

  if (role === 'system_administrator') {
    return (
      <Grid item xs={4}>
        <Typography variant="h5" gutterBottom>
          System Administrator Panel
        </Typography>
        <Card>
          <CardContent>
            <Typography>Total Users: {data.totalUsers}</Typography>
            <Typography>System Status: Active</Typography>
            <Typography>Database Health: Good</Typography>
            {/* more admin info and shortcuts */}
          </CardContent>
        </Card>
      </Grid>
    );
  }

  if (role === 'academic_administrator') {
    return (
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Academic Administrator Panel
        </Typography>
        <Card>
          <CardContent>
            <Typography>Total Students: {data.totalStudents}</Typography>
            <Typography>Active Enrollments: {data.activeEnrollments}</Typography>
            <Typography>Pending Registrations: {data.pendingRegistrations}</Typography>
            {/* upcoming followups, etc */}
          </CardContent>
        </Card>
      </Grid>
    );
  }

  if (role === 'finance_admin') {
    return (
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Finance Administrator Panel
        </Typography>
        <Card>
          <CardContent>
            <Typography>Pending Payments: {data.pendingPayments}</Typography>
            <Typography>Total Revenue: ${data.totalRevenue}</Typography>
            <Typography>Outstanding Invoices: {data.outstandingInvoices}</Typography>
            {/* financial reports and reminders */}
          </CardContent>
        </Card>
      </Grid>
    );
  }

  if (role === 'accountant') {
    return (
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Accountant Panel
        </Typography>
        <Card>
          <CardContent>
            <Typography>Pending Payments: {data.pendingPayments}</Typography>
            <Typography>Monthly Reports: {data.monthlyReports}</Typography>
            <Typography>Reconciliation Tasks: {data.reconciliationTasks}</Typography>
            {/* accounting tasks and reminders */}
          </CardContent>
        </Card>
      </Grid>
    );
  }

  // Legacy support for old roles
  if (role === 'admin') {
    return (
      <Grid item xs={4}>
        <Typography variant="h5" gutterBottom>
          Admin Panel
        </Typography>
        <Card>
          <CardContent>
            <Typography>Total Users: {data.totalUsers}</Typography>
            {/* more admin info and shortcuts */}
          </CardContent>
        </Card>
      </Grid>
    );
  }

  if (role === 'counselor') {
    return (
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Counselor Panel
        </Typography>
        <Card>
          <CardContent>
            <Typography>Assigned Leads: {data.assignedLeads}</Typography>
            {/* upcoming followups, etc */}
          </CardContent>
        </Card>
      </Grid>
    );
  }

  if (role === 'finance') {
    return (
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>
          Finance Officer Panel
        </Typography>
        <Card>
          <CardContent>
            <Typography>Pending Payments: {data.pendingPayments}</Typography>
            {/* reminders */}
          </CardContent>
        </Card>
      </Grid>
    );
  }

  return null;
};

export default UserRolePanels;
