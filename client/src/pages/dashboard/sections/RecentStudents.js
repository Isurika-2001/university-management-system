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
  UserOutlined, 
  ClockCircleOutlined,
  MailOutlined
} from '@ant-design/icons';

import { useAuthContext } from 'context/useAuthContext';
import { statsAPI } from '../../../api/stats';

const RecentStudents = () => {
  const { user } = useAuthContext();
  const [recentStudents, setRecentStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const hasPermission = user?.permissions?.student?.includes('R');
    
    if (!hasPermission) {
      setLoading(false);
      return;
    }

    async function fetchRecentActivities() {
      try {
        setLoading(true);
        setError(null);

        const studentData = await statsAPI.getRecentStudents({ limit: 3 });
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

  const hasPermission = user?.permissions?.student?.includes('R');

  if (!hasPermission) {
    return null;
  }

  if (loading) {
    return (
      <Grid item xs={12}>
        <Card sx={{ 
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(255,255,255,0.9) 100%)'
        }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: 2, 
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.palette.primary.main,
                fontSize: '24px',
                mr: 2
              }}>
                <UserOutlined />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.grey[800] }}>
                Recent Student Registrations
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
          background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(255,255,255,0.9) 100%)',
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
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: theme.palette.primary.main,
                fontSize: '24px',
                mr: 2
              }}>
                <UserOutlined />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.grey[800] }}>
                  Recent Student Registrations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Latest student registrations in the system
                </Typography>
              </Box>
            </Box>

            <Box>
              {recentStudents.length > 0 ? (
                <List sx={{ p: 0 }}>
                  {recentStudents.map((student, index) => (
                    <React.Fragment key={student._id || index}>
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
                              bgcolor: theme.palette.primary.main,
                              width: 48,
                              height: 48,
                              fontSize: '18px',
                              fontWeight: 600
                            }}
                          >
                            {student.firstName?.charAt(0)?.toUpperCase() || 'S'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.grey[800] }}>
                                {student.firstName} {student.lastName}
                              </Typography>
                              <Chip 
                                label="New" 
                                size="small" 
                                sx={{ 
                                  backgroundColor: theme.palette.success.main,
                                  color: 'white',
                                  fontSize: '0.7rem',
                                  height: 20
                                }} 
                              />
                            </Box>
                          }
                          secondary={
                            <Box>
                              {student.email && (
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                  <MailOutlined style={{ fontSize: '14px', color: theme.palette.grey[600] }} />
                                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                                    {student.email}
                                  </Typography>
                                </Box>
                              )}
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ClockCircleOutlined style={{ fontSize: '14px', color: theme.palette.grey[600] }} />
                                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                  {formatTimeAgo(student.createdAt)}
                                </Typography>
                              </Box>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < recentStudents.length - 1 && (
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
                  <UserOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                  <Typography variant="h6" sx={{ mb: 1 }}>
                    No Recent Registrations
                  </Typography>
                  <Typography variant="body2">
                    No new students have been registered recently
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

export default RecentStudents; 