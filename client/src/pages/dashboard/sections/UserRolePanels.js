import React from 'react';
import { Grid, Typography, Card, CardContent } from '@mui/material';

const UserRolePanels = ({ role, data }) => {
  // data structure depends on role

  if (role === 'admin') {
    return (
      <Grid item xs={12}>
        <Typography variant="h5" gutterBottom>Admin Panel</Typography>
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
        <Typography variant="h5" gutterBottom>Counselor Panel</Typography>
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
        <Typography variant="h5" gutterBottom>Finance Officer Panel</Typography>
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
