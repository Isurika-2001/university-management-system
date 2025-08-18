import React, { useState, useRef, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Typography, 
  Card, 
  CardContent, 
  useTheme,
  Chip,
  Grow,
  Skeleton
} from '@mui/material';
import { 
  CalendarOutlined, 
  ClockCircleOutlined,
  TeamOutlined,
  BookOutlined
} from '@ant-design/icons';
import { statsAPI } from '../../../api/stats';

const GeneralSummaryCards = () => {
  const [courseBatches, setCourseBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();
  
  const visibleContainerRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    async function fetchBatches() {
      try {
        setLoading(true);
        setError(null);

        const json = await statsAPI.getBatchStats();
        if (json.success && Array.isArray(json.data)) {
          setCourseBatches(json.data);
        } else {
          setError('Failed to load batch data');
        }
      } catch (err) {
        setError('Error fetching batch data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchBatches();
  }, []);

  useEffect(() => {
    const updateContentHeight = () => {
      if (visibleContainerRef.current) {
        const height = visibleContainerRef.current.scrollHeight;
        setContentHeight(height);
      }
    };

    updateContentHeight();
    window.addEventListener('resize', updateContentHeight);
    return () => window.removeEventListener('resize', updateContentHeight);
  }, [courseBatches]);

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntil = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (dateString) => {
    if (!dateString) return 'default';
    const daysUntil = getDaysUntil(dateString);
    if (daysUntil < 0) return 'error';
    if (daysUntil <= 7) return 'warning';
    return 'success';
  };

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
                <CalendarOutlined />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.grey[800] }}>
                Upcoming Events & Deadlines
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={12} sm={6} md={4} key={item}>
                  <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
                </Grid>
              ))}
            </Grid>
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
                <CalendarOutlined />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.grey[800] }}>
                  Upcoming Events & Deadlines
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Important dates for courses and batches
                </Typography>
              </Box>
            </Box>

            <Box 
              ref={visibleContainerRef}
              sx={{ 
                maxHeight: 450, 
                overflowY: contentHeight > 450 ? 'auto' : 'visible',
                transition: 'height 0.3s ease',
              }}
            >
              <Grid container spacing={2}>
                {courseBatches.length > 0 ? (
                  courseBatches.map((batch, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Grow in={!loading} timeout={index * 100}>
                        <Card sx={{ 
                          height: '100%',
                          borderRadius: 2,
                          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                          transition: 'all 0.2s ease-in-out',
                          border: '1px solid rgba(0,0,0,0.05)',
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            borderColor: theme.palette.primary.main
                          }
                        }}>
                          <CardContent sx={{ p: 2.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                              <BookOutlined style={{ 
                                fontSize: '20px', 
                                color: theme.palette.primary.main,
                                marginRight: '8px'
                              }} />
                              <Typography variant="subtitle2" sx={{ 
                                fontWeight: 600, 
                                color: theme.palette.grey[800],
                                fontSize: '0.9rem'
                              }}>
                                {batch.courseName}
                              </Typography>
                            </Box>
                            
                            <Typography variant="body2" sx={{ 
                              fontWeight: 500, 
                              color: theme.palette.grey[700],
                              mb: 2,
                              fontSize: '0.85rem'
                            }}>
                              {batch.name}
                            </Typography>

                            <Box sx={{ space: 1 }}>
                              {batch.orientationDate && (
                                <Box sx={{ mb: 1.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <TeamOutlined style={{ 
                                      fontSize: '14px', 
                                      color: theme.palette.info.main,
                                      marginRight: '6px'
                                    }} />
                                    <Typography variant="caption" sx={{ 
                                      fontWeight: 500, 
                                      color: theme.palette.grey[600],
                                      fontSize: '0.75rem'
                                    }}>
                                      Orientation
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ 
                                      color: theme.palette.grey[700],
                                      fontSize: '0.8rem'
                                    }}>
                                      {formatDate(batch.orientationDate)}
                                    </Typography>
                                    <Chip 
                                      label={getDaysUntil(batch.orientationDate) < 0 ? 'Past' : `${getDaysUntil(batch.orientationDate)}d`}
                                      size="small"
                                      color={getStatusColor(batch.orientationDate)}
                                      sx={{ height: 20, fontSize: '0.7rem' }}
                                    />
                                  </Box>
                                </Box>
                              )}

                              {batch.startDate && (
                                <Box sx={{ mb: 1.5 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <ClockCircleOutlined style={{ 
                                      fontSize: '14px', 
                                      color: theme.palette.warning.main,
                                      marginRight: '6px'
                                    }} />
                                    <Typography variant="caption" sx={{ 
                                      fontWeight: 500, 
                                      color: theme.palette.grey[600],
                                      fontSize: '0.75rem'
                                    }}>
                                      Start Date
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ 
                                      color: theme.palette.grey[700],
                                      fontSize: '0.8rem'
                                    }}>
                                      {formatDate(batch.startDate)}
                                    </Typography>
                                    <Chip 
                                      label={getDaysUntil(batch.startDate) < 0 ? 'Started' : `${getDaysUntil(batch.startDate)}d`}
                                      size="small"
                                      color={getStatusColor(batch.startDate)}
                                      sx={{ height: 20, fontSize: '0.7rem' }}
                                    />
                                  </Box>
                                </Box>
                              )}

                              {batch.registrationDeadline && (
                                <Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                                    <CalendarOutlined style={{ 
                                      fontSize: '14px', 
                                      color: theme.palette.error.main,
                                      marginRight: '6px'
                                    }} />
                                    <Typography variant="caption" sx={{ 
                                      fontWeight: 500, 
                                      color: theme.palette.grey[600],
                                      fontSize: '0.75rem'
                                    }}>
                                      Registration Deadline
                                    </Typography>
                                  </Box>
                                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" sx={{ 
                                      color: theme.palette.grey[700],
                                      fontSize: '0.8rem'
                                    }}>
                                      {formatDate(batch.registrationDeadline)}
                                    </Typography>
                                    <Chip 
                                      label={getDaysUntil(batch.registrationDeadline) < 0 ? 'Closed' : `${getDaysUntil(batch.registrationDeadline)}d`}
                                      size="small"
                                      color={getStatusColor(batch.registrationDeadline)}
                                      sx={{ height: 20, fontSize: '0.7rem' }}
                                    />
                                  </Box>
                                </Box>
                              )}
                            </Box>
                          </CardContent>
                        </Card>
                      </Grow>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Box sx={{ 
                      textAlign: 'center', 
                      py: 4,
                      color: theme.palette.grey[500]
                    }}>
                      <CalendarOutlined style={{ fontSize: '48px', marginBottom: '16px' }} />
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        No Upcoming Events
                      </Typography>
                      <Typography variant="body2">
                        No upcoming events or deadlines found
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Box>
          </CardContent>
        </Card>
      </Grow>
    </Grid>
  );
};

export default GeneralSummaryCards;
