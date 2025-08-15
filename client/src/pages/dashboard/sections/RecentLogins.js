import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Avatar, 
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider,
  Skeleton
} from '@mui/material';
// Using simple icons instead of Material-UI icons to avoid import issues
const PersonIcon = () => <span style={{ fontSize: '20px' }}>👤</span>;
const TimeIcon = () => <span style={{ fontSize: '16px' }}>⏰</span>;
import MainCard from 'components/MainCard';
import { useAuthContext } from 'context/useAuthContext';
import { statsAPI } from '../../../api/stats';

const RecentActivities = () => {
  const { user } = useAuthContext();
  const [recentLogins, setRecentLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user has permission to view recent logins
    const hasPermission = user?.permissions?.user?.includes('R');
    
    // If user doesn't have permission, don't fetch data
    if (!hasPermission) {
      setLoading(false);
      return;
    }

    async function fetchRecentActivities() {
      try {
        setLoading(true);
        setError(null);

        // Fetch recent logins
        console.log('RecentLogins - Fetching recent activities...');
        const loginData = await statsAPI.getRecentActivities({ action: 'LOGIN', limit: 5, page: 1 });
        console.log('RecentLogins - API response:', loginData);

        if (loginData.success) {
          setRecentLogins(loginData.data.logs || []);
          console.log('RecentLogins - Set logs:', loginData.data.logs || []);
        } else {
          console.log('RecentLogins - API failed:', loginData);
        }

      } catch (err) {
        setError('Error fetching recent activities');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchRecentActivities();
  }, [user.token, user?.permissions?.user]);

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return 'success';
      case 'FAILED':
        return 'error';
      case 'PENDING':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Check if user has permission to view recent logins
  const hasPermission = user?.permissions?.user?.includes('R');

  console.log('RecentLogins - User permissions:', user?.permissions);
  console.log('RecentLogins - Has permission:', hasPermission);

  // Temporarily allow all users to see the component for debugging
  // if (!hasPermission) {
  //   console.log('RecentLogins - No permission, returning null');
  //   return null;
  // }

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
        <MainCard title="Recent Logins">
          <Box sx={{ p: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        </MainCard>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} md={6} lg={6}>
      <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Grid item>
          <Typography variant="h5">Recent Logins</Typography>
        </Grid>
      </Grid>
      <MainCard sx={{ mt: 2 }} content={false}>
        <Box sx={{ p: 2, pt: 0, maxHeight: 450, overflow: 'auto' }}>
          <List>
            {recentLogins.length > 0 ? (
              recentLogins.map((login, index) => (
                <React.Fragment key={login._id || index}>
                  <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <PersonIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2">
                            {login.user?.name || login.user?.email || 'Unknown User'}
                          </Typography>
                          <Chip 
                            label={login.status} 
                            size="small" 
                            color={getStatusColor(login.status)}
                            variant="outlined"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {login.description}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                            <TimeIcon />
                            <Typography variant="caption" color="text.secondary">
                              {formatTimeAgo(login.timestamp)}
                            </Typography>
                          </Box>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentLogins.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))
            ) : (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography variant="body2" color="text.secondary">
                      No recent login activity
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