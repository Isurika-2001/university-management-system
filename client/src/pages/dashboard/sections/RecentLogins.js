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
  Skeleton,
  Card,
  CardContent,
  useTheme,
  Chip,
  Grow
} from '@mui/material';
import { 
  LoginOutlined, 
  ClockCircleOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

import { useAuthContext } from 'context/useAuthContext';
import { statsAPI } from '../../../api/stats';

const RecentLogins = () => {
  const { user } = useAuthContext();
  const [recentLogins, setRecentLogins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const hasPermission = user?.permissions?.user?.includes('R');
    
    if (!hasPermission) {
      setLoading(false);
      return;
    }

    async function fetchRecentActivities() {
      try {
        setLoading(true);
        setError(null);

        console.log('RecentLogins - Fetching recent activities...');
        const loginData = await statsAPI.getRecentActivities({ action: 'LOGIN', limit: 3, page: 1 });
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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircleOutlined style={{ color: theme.palette.success.main }} />;
      case 'FAILED':
        return <CloseCircleOutlined style={{ color: theme.palette.error.main }} />;
      case 'PENDING':
        return <ExclamationCircleOutlined style={{ color: theme.palette.warning.main }} />;
      default:
        return <ExclamationCircleOutlined style={{ color: theme.palette.grey[500] }} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'SUCCESS':
        return theme.palette.success.main;
      case 'FAILED':
        return theme.palette.error.main;
      case 'PENDING':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const hasPermission = user?.permissions?.user?.includes('R');

  if (!hasPermission) {
    return null;
  }

  if (loading) {
    return (
      <Grid item xs={12}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(255,255,255,0.9) 100%)'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: 2, 
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.palette.success.main,
                fontSize: '24px',
                mr: 2
              }}>
                <LoginOutlined />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.grey[800] }}>
                Recent Logins
              </Typography>
            </Box>
            <Box sx={{ p: 2 }}>
              {[1, 2, 3].map((item) => (
                <Box key={item} sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 2 }} />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid item xs={12}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.05) 0%, rgba(255,255,255,0.9) 100%)'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Typography color="error" variant="h6" sx={{ textAlign: 'center' }}>
              {error}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    );
  }

  return (
    <Grid item xs={12}>
      <Grow in={!loading} timeout={300}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(255,255,255,0.9) 100%)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
          }
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: 2, 
                backgroundColor: 'rgba(76, 175, 80, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.palette.success.main,
                fontSize: '24px',
                mr: 2
              }}>
                <LoginOutlined />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.grey[800] }}>
                  Recent Logins
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Latest user login activities
                </Typography>
              </Box>
            </Box>

            <Box>
              {recentLogins.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {recentLogins.map((login, index) => (
                    <React.Fragment key={login._id || index}>
                      <ListItem 
                        sx={{ 
                          p: 2, 
                          mb: 1, 
                          borderRadius: 2,
                          backgroundColor: 'rgba(255,255,255,0.7)',
                          border: '1px solid rgba(0,0,0,0.05)',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.9)',
                            transform: 'translateX(4px)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ 
                              bgcolor: theme.palette.success.main,
                              width: 48,
                              height: 48,
                              fontSize: '18px',
                              fontWeight: 600
                            }}
                          >
                            <UserOutlined />
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.grey[800] }}>
                                {login.user?.name || login.user?.email || 'Unknown User'}
                              </Typography>
                              <Chip 
                                icon={getStatusIcon(login.status)}
                                label={login.status} 
                                size="small" 
                                sx={{ 
                                  backgroundColor: getStatusColor(login.status),
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  height: 20,
                                  '& .MuiChip-icon': {
                                    color: 'white !important'
                                  }
                                }} 
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem', mb: 0.5 }}>
                                {login.description || 'User login activity'}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ClockCircleOutlined style={{ fontSize: '14px', color: theme.palette.grey[600] }} />
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                  {formatTimeAgo(login.timestamp)}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentLogins.length - 1 && (
                        <Divider sx={{ my: 1, opacity: 0.3 }} />
                      )}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ 
                  textAlign: 'center', 
                  py: 4,
                  color: theme.palette.grey[500]
                }}>
                  <LoginOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    No Recent Logins
                  </Typography>
                  <Typography variant="body2">
                    No recent login activity found
                  </Typography>
                </Box>
              )}
            </Box>
          </CardContent>
        </Card>
      </Grow>
    </Grid>
  );
};

export default RecentLogins;
