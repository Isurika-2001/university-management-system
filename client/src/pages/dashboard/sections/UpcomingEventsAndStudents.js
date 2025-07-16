import React from 'react';
import { Grid, Typography, List, ListItem, ListItemText, Card, CardContent } from '@mui/material';

const UpcomingEventsAndStudentSection = ({ events, topCourses }) => {
  const formatDate = (d) => new Date(d).toLocaleDateString();

  return (
    <Grid item xs={12} md={12} container spacing={2}>
      {/* Upcoming Events / Deadlines */}
      <Grid item xs={12} md={6}>
        <Typography variant="h5" gutterBottom>Upcoming Events / Deadlines</Typography>
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="h6">Registration Deadlines</Typography>
            <List dense>
              {events.registrationDeadlines.map((date, i) => (
                <ListItem key={i}>
                  <ListItemText primary={formatDate(date)} />
                </ListItem>
              ))}
            </List>
            <Typography variant="h6">Batch Start Dates</Typography>
            <List dense>
              {events.batchStartDates.map((date, i) => (
                <ListItem key={i}>
                  <ListItemText primary={formatDate(date)} />
                </ListItem>
              ))}
            </List>
            <Typography variant="h6">Fee Due Dates</Typography>
            <List dense>
              {events.feeDueDates.map((date, i) => (
                <ListItem key={i}>
                  <ListItemText primary={formatDate(date)} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>

      {/* Students Section */}
      <Grid item xs={12} md={6}>
        <Typography variant="h5" gutterBottom>Students Section</Typography>
        <Card>
          <CardContent>
            <Typography variant="h6">Top Enrolled Courses</Typography>
            <List dense>
              {topCourses.map((course, i) => (
                <ListItem key={i}>
                  <ListItemText primary={`${course.name} (${course.enrolledCount})`} />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default UpcomingEventsAndStudentSection;
