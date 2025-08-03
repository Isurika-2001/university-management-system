import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Avatar, 
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Skeleton
} from '@mui/material';
// Using simple icons instead of Material-UI icons to avoid import issues
const SchoolIcon = () => <span style={{ fontSize: '20px' }}>🎓</span>;
const TimeIcon = () => <span style={{ fontSize: '16px' }}>⏰</span>;
import MainCard from 'components/MainCard';
import { useAuthContext } from 'context/useAuthContext';
import { statsAPI } from '../../../api/stats';

const RecentActivities = () => {
  const { user } = useAuthContext();
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user has permission to view recent student registrations
    const hasPermission = user?.permissions?.student?.includes('update-all');
    
    // If user doesn't have permission, don't fetch data
    if (!hasPermission) {
      setLoading(false);
      return;
    }

    async function fetchRecentActivities() {
      try {
        setLoading(true);
        setError(null);

        // Fetch recent students
        const studentData = await statsAPI.getRecentActivities({ limit: 5 });
        console.log(studentData);

        if (studentData.success) {
          setRecentStudents(studentData.data || []);
        }

      } catch (err) {
        setError('Error fetching recent activities');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentActivities();
  }, [user.token, user?.permissions?.student]);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Check if user has permission to view recent student registrations
  const hasPermission = user?.permissions?.student?.includes('update-all');

  // If user doesn't have permission, don't render the component
  if (!hasPermission) {
    return null;
  }

  if (loading) {
    return (
      <Grid item xs={12} md={6} lg={6}>
        <MainCard sx={{ mt: 2, minHeight: 500 }}>
          <Box sx={{ p: 2 }}>
            <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={60} />
          </Box>
        </MainCard>
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid item xs={12} md={6} lg={6}>
        <MainCard title="Newly Added Students">
          <Box sx={{ p: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        </MainCard>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} md={12} lg={6}>
      <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Grid item>
          <Typography variant="h5">Recent Student Registrations</Typography>
        </Grid>
      </Grid>
      <MainCard sx={{ mt: 2 }} content={false}>
        <Box sx={{ p: 2, pt: 0, maxHeight: 450, overflow: 'auto' }}>
          <List>
            {recentStudents.length > 0 ? (
              recentStudents.map((student, index) => (
                <React.Fragment key={student._id || index}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <SchoolIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle2">
                          {student.firstName} {student.lastName}
                        </Typography>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            ID: {student.registration_no || student.studentId}
                          </Typography>
                          {student.email && (
                            <Typography variant="body2" color="text.secondary">
                              {student.email}
                            </Typography>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <TimeIcon />
                            <Typography variant="caption" color="text.secondary">
                              {formatTimeAgo(student.createdAt)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentStudents.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="text.secondary">
                      No newly added students
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        </Box>
      </MainCard>
    </Grid>
  );
};

export default RecentActivities; 