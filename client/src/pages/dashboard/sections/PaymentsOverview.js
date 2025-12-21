import React from 'react';
import { useState, useEffect } from 'react';
import { Grid, Typography, Box, Card, CardContent, useTheme, Grow, Skeleton } from '@mui/material';
import { BarChartOutlined, UserOutlined, TrophyOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useAuthContext } from 'context/useAuthContext';
import { statsAPI } from '../../../api/stats';
import MonthlyBarChart from '../MonthlyBarChart';

const PaymentOverview = () => {
  const { user } = useAuthContext();
  const [totalRegistrations, setTotalRegistrations] = useState(0);
  const [mostPopularCourse, setMostPopularCourse] = useState({ name: 'Loading...', count: 0 });
  const [emergingCourse, setEmergingCourse] = useState({ name: 'Loading...', count: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const theme = useTheme();

  useEffect(() => {
    const hasPermission = user?.permissions?.student?.includes('R');

    if (!hasPermission) {
      setLoading(false);
      return;
    }

    async function fetchCourseDistribution() {
      try {
        setLoading(true);
        setError(null);

        const response = await statsAPI.getCourseDistribution();
        console.log('Course distribution response:', response);

        if (response.success && response.data) {
          setTotalRegistrations(response.data.totalRegistrations || 0);
          setMostPopularCourse(response.data.mostPopularCourse || { name: 'No data', count: 0 });
          setEmergingCourse(response.data.emergingCourse || { name: 'No data', count: 0 });
        } else {
          console.error('Failed to fetch course distribution:', response.message);
          setError('Failed to fetch course distribution data');
        }
      } catch (err) {
        console.error('Error fetching course distribution:', err);
        setError('Error fetching course distribution data');
      } finally {
        setLoading(false);
      }
    }

    fetchCourseDistribution();
  }, [user.token, user?.permissions?.student]);

  const hasPermission = user?.permissions?.student?.includes('R');

  if (!hasPermission) {
    return null;
  }

  if (loading) {
    return (
      <Grid item xs={12}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(255,255,255,0.9) 100%)'
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  backgroundColor: 'rgba(156, 39, 176, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.palette.secondary.main,
                  fontSize: '24px',
                  mr: 2
                }}
              >
                <BarChartOutlined />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.grey[800] }}>
                Students Per Course Distribution
              </Typography>
            </Box>
            <Grid container spacing={2}>
              {[1, 2, 3].map((item) => (
                <Grid item xs={12} md={4} key={item}>
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
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.05) 0%, rgba(255,255,255,0.9) 100%)'
          }}
        >
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
      <Grow in timeout={400}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.05) 0%, rgba(255,255,255,0.9) 100%)',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
            }
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  backgroundColor: 'rgba(156, 39, 176, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.palette.secondary.main,
                  fontSize: '24px',
                  mr: 2
                }}
              >
                <BarChartOutlined />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.grey[800] }}>
                  Students Per Course Distribution
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Course-wise student enrollment breakdown
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                {/* Total Registrations */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      height: '100%',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <UserOutlined style={{ fontSize: '16px', color: theme.palette.grey[600] }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        Total Registrations
                      </Typography>
                    </Box>
                    <Typography
                      variant="h4"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.secondary.main,
                        fontSize: '1.75rem'
                      }}
                    >
                      {totalRegistrations.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>

                {/* Most Popular Course */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      height: '100%',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <TrophyOutlined style={{ fontSize: '16px', color: theme.palette.success.main }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        Most Popular Course
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.grey[800],
                        fontSize: '1rem',
                        mb: 0.5,
                        lineHeight: 1.2
                      }}
                    >
                      {mostPopularCourse.courseCode}
                    </Typography>
                  </Box>
                </Grid>

                {/* Emerging Course */}
                <Grid item xs={12} md={4}>
                  <Box
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      backgroundColor: 'rgba(255,255,255,0.7)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      height: '100%',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                      }
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <InfoCircleOutlined style={{ fontSize: '16px', color: theme.palette.warning.main }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        Emerging Course
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.grey[800],
                        fontSize: '1rem',
                        mb: 0.5,
                        lineHeight: 1.2
                      }}
                    >
                      {emergingCourse.courseCode}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>

            <Box
              sx={{
                borderRadius: 2,
                backgroundColor: 'rgba(255,255,255,0.7)',
                border: '1px solid rgba(0,0,0,0.05)',
                overflow: 'hidden'
              }}
            >
              <MonthlyBarChart onTotalChange={setTotalRegistrations} />
            </Box>
          </CardContent>
        </Card>
      </Grow>
    </Grid>
  );
};

export default PaymentOverview;
