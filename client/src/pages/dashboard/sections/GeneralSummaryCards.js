import React, { useState, useRef, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent } from '@mui/material';
import MainCard from 'components/MainCard';
import { useAuthContext } from 'context/useAuthContext';
import { apiRoutes } from 'config';

const GeneralSummaryCards = () => {
  const { user } = useAuthContext();
  const [courseBatches, setCourseBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const visibleContainerRef = useRef(null);
  const [contentHeight, setContentHeight] = useState(0);

  useEffect(() => {
    async function fetchBatches() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(apiRoutes.statRoute + 'batchDates', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
          },
        });
        const json = await response.json();

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
  }, [user.token]);

  // Update contentHeight whenever courseBatches changes or window resizes
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

  if (loading) {
    return (
      <Grid item xs={12} md={5} lg={4}>
        <Typography variant="h6">Loading batch data...</Typography>
      </Grid>
    );
  }

  if (error) {
    return (
      <Grid item xs={12} md={5} lg={4}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} md={12} lg={12}>
      <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Grid item>
          <Typography variant="h5">Upcoming Batch Dates</Typography>
        </Grid>
      </Grid>

      <MainCard
        sx={{
          mt: 2,
          pb: 3,
          // Set maxHeight to 450 and show scroll if content exceeds 450
          maxHeight: 450,
          overflowY: contentHeight > 450 ? 'auto' : 'visible',
          height: contentHeight > 450 ? 450 : 'auto',
          transition: 'height 0.3s ease',
        }}
        content={false}
      >
        <Box sx={{ p: 3, pb: 0 }} ref={visibleContainerRef}>
          <Grid container spacing={2}>
            {courseBatches.map((batch, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card className="batch-card" sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="subtitle1">
                      {batch.courseName} - {batch.name}
                    </Typography>
                    {batch.orientationDate && (
                      <Typography variant="body2">Orientation Date: {new Date(batch.orientationDate).toLocaleDateString()}</Typography>
                    )}
                    {batch.startDate && (
                      <Typography variant="body2">Start Date: {new Date(batch.startDate).toLocaleDateString()}</Typography>
                    )}
                    {batch.registrationDeadline && (
                      <Typography variant="body2">
                        Registration Deadline: {new Date(batch.registrationDeadline).toLocaleDateString()}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </MainCard>
    </Grid>
  );
};

export default GeneralSummaryCards;
