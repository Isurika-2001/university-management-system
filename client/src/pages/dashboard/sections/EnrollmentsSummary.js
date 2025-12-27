import React, { useEffect, useState } from 'react';
import { Grid, Typography, Skeleton, Box, Card, CardContent, useTheme, Grow } from '@mui/material';
import { UserOutlined, BookOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAuthContext } from 'context/useAuthContext';
import { apiRoutes } from 'config';
import { useLogout } from 'hooks/useLogout';

const EnrollmentSummary = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const { logout } = useLogout();

  const [animatedCounts, setAnimatedCounts] = useState({
    totalRegistrations: 0,
    totalRunningCourses: 0,
    totalCourses: 0,
    totalRunningBatches: 0,
    totalBatches: 0,
    todaysEnrollments: 0
  });

  const animateCountIncrease = (key, finalCount) => {
    const increment = Math.ceil(finalCount / 50);
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= finalCount) {
        current = finalCount;
        clearInterval(interval);
      }
      setAnimatedCounts((prev) => ({ ...prev, [key]: current }));
    }, 30);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(apiRoutes.statRoute + 'enrollment', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          }
        });

        if (!response.ok) {
          if (response.status === 500) {
            console.error('Internal Server Error.');
          }
          if (response.status === 401) {
            logout();
            return;
          }
          setLoading(false);
          return;
        }

        const json = await response.json();

        if (json.success && json.data) {
          const dataWithDefaults = {
            totalRegistrations: 0,
            totalRunningCourses: 0,
            totalCourses: 0,
            totalRunningBatches: 0,
            totalBatches: 0,
            todaysEnrollments: 0,
            ...json.data
          };

          Object.entries(dataWithDefaults).forEach(([key, value]) => {
            if (typeof value === 'number') {
              animateCountIncrease(key, value);
            }
          });
        } else {
          console.error('Failed to fetch enrollment summary:', json.message);
        }
      } catch (error) {
        console.error('Error fetching enrollment summary:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [logout, user.token]);

  const metricCards = [
    {
      title: 'Total Students',
      count: (animatedCounts.totalRegistrations || 0).toLocaleString(),
      icon: <UserOutlined />,
      color: theme.palette.primary.main,
      bgColor: 'rgba(25, 118, 210, 0.1)',
      description: 'Registered students'
    },
    {
      title: 'Active Courses',
      count: `${(animatedCounts.totalRunningCourses || 0).toLocaleString()} / ${(animatedCounts.totalCourses || 0).toLocaleString()}`,
      icon: <BookOutlined />,
      color: theme.palette.success.main,
      bgColor: 'rgba(76, 175, 80, 0.1)',
      description: 'Running / Total courses'
    },
    {
      title: 'Active Batches',
      count: `${(animatedCounts.totalRunningBatches || 0).toLocaleString()} / ${(animatedCounts.totalBatches || 0).toLocaleString()}`,
      icon: <TeamOutlined />,
      color: theme.palette.warning.main,
      bgColor: 'rgba(255, 152, 0, 0.1)',
      description: 'Running / Total batches'
    },
    {
      title: "Today's Enrollments",
      count: (animatedCounts.todaysEnrollments || 0).toLocaleString(),
      icon: <CalendarOutlined />,
      color: theme.palette.info.main,
      bgColor: 'rgba(3, 169, 244, 0.1)',
      description: 'New enrollments today'
    }
  ];

  const renderSkeletonCard = () => (
    <Grid item xs={12} sm={6} md={3}>
      <Card
        sx={{
          height: 160,
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.12)'
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Skeleton variant="circular" width={40} height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="40%" height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" height={16} />
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Grid container spacing={3}>
      {loading ? (
        <>
          {renderSkeletonCard()}
          {renderSkeletonCard()}
          {renderSkeletonCard()}
          {renderSkeletonCard()}
        </>
      ) : (
        metricCards.map((metric, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Grow in={!loading} timeout={index * 200}>
              <Card
                sx={{
                  height: 'auto',
                  borderRadius: 3,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                  transition: 'all 0.3s ease-in-out',
                  background: `linear-gradient(135deg, ${metric.bgColor} 0%, rgba(255,255,255,0.9) 100%)`,
                  border: `1px solid ${metric.bgColor}`,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
                    borderColor: metric.color
                  }
                }}
              >
                <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        backgroundColor: metric.bgColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: metric.color,
                        fontSize: '24px'
                      }}
                    >
                      {metric.icon}
                    </Box>
                  </Box>

                  <Typography
                    variant="h4"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette.grey[800],
                      mb: 1,
                      fontSize: '1.8rem'
                    }}
                  >
                    {metric.count}
                  </Typography>

                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 600,
                      color: theme.palette.grey[700],
                      mb: 1,
                      fontSize: '1rem'
                    }}
                  >
                    {metric.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: theme.palette.grey[600],
                      fontSize: '0.875rem'
                    }}
                  >
                    {metric.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grow>
          </Grid>
        ))
      )}
    </Grid>
  );
};

export default EnrollmentSummary;
