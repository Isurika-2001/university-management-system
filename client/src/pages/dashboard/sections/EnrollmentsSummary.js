import React, { useEffect, useState } from 'react';
import { Grid, Typography, Skeleton } from '@mui/material';
import AnalyticEcommerce from 'components/cards/statistics/AnalyticEcommerce';
import { useAuthContext } from 'context/useAuthContext';
import { apiRoutes } from 'config';
import { useLogout } from 'hooks/useLogout';

const EnrollmentSummary = () => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
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
    const increment = Math.ceil(finalCount / 100);
    let current = 0;
    const interval = setInterval(() => {
      current += increment;
      if (current >= finalCount) {
        current = finalCount;
        clearInterval(interval);
      }
      setAnimatedCounts((prev) => ({ ...prev, [key]: current }));
    }, 20);
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
            // Optional: logout or alert user
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
          // Ensure all expected fields exist with default values
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
  }, []);

  const renderSkeletonCard = () => (
    <Grid item xs={12} sm={6} md={4} lg={3}>
      <Skeleton
        variant="rectangular"
        height={100}
        sx={{
          borderRadius: 2,
          animation: 'blinker 1s linear infinite',
          backgroundColor: (theme) => theme.palette.primary.main,
          '@keyframes blinker': {
            '50%': {
              opacity: 0.4
            }
          }
        }}
      />
    </Grid>
  );

  return (
    <>
      <Grid item xs={12} sx={{ mb: -2.25 }}>
        <Typography variant="h5">Enrollment Summary</Typography>
      </Grid>

      {loading ? (
        <>
          {renderSkeletonCard()}
          {renderSkeletonCard()}
          {renderSkeletonCard()}
          {renderSkeletonCard()}
        </>
      ) : (
        <>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <AnalyticEcommerce title="Total Students Registered" count={(animatedCounts.totalRegistrations || 0).toLocaleString()} />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <AnalyticEcommerce
              title="Total Courses Offered"
              count={`${(animatedCounts.totalRunningCourses || 0).toLocaleString()} / ${(animatedCounts.totalCourses || 0).toLocaleString()}`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <AnalyticEcommerce
              title="Total Batches Running"
              count={`${(animatedCounts.totalRunningBatches || 0).toLocaleString()} / ${(animatedCounts.totalBatches || 0).toLocaleString()}`}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <AnalyticEcommerce title="Today's Enrollments" count={(animatedCounts.todaysEnrollments || 0).toLocaleString()} />
          </Grid>
        </>
      )}
    </>
  );
};

export default EnrollmentSummary;
