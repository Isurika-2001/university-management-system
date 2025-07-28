import React, { useState, useRef, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent, Button } from '@mui/material';
import MainCard from 'components/MainCard';
import { useAuthContext } from 'context/useAuthContext';
import { apiRoutes } from 'config';

const GeneralSummaryCards = () => {
  const { user } = useAuthContext();
  const [showAll, setShowAll] = useState(false);
  const [maxItems, setMaxItems] = useState(0);
  const [courseBatches, setCourseBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const hiddenContainerRef = useRef(null);

  const maxVisibleHeight = 450; // adjust as needed

  useEffect(() => {
    // Fetch batch data from API
    async function fetchBatches() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(apiRoutes.statRoute + 'batchDates', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          }
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
  }, []);

  useEffect(() => {
    // Calculate how many items fit into the max height after batches load
    const calculateMaxItems = () => {
      const hiddenContainer = hiddenContainerRef.current;
      if (!hiddenContainer) return;

      const cards = hiddenContainer.querySelectorAll('.batch-card');
      let totalHeight = 0;
      let itemsThatFit = 0;

      cards.forEach((card) => {
        const cardHeight = card.offsetHeight + 16; // include mb:2 ~16px
        if (totalHeight + cardHeight <= maxVisibleHeight || itemsThatFit === 0) {
          totalHeight += cardHeight;
          itemsThatFit += 1;
        }
      });

      setMaxItems(itemsThatFit);
    };

    if (courseBatches.length > 0) {
      calculateMaxItems();
      window.addEventListener('resize', calculateMaxItems);
      return () => window.removeEventListener('resize', calculateMaxItems);
    }
  }, [courseBatches]);

  const visibleBatches = showAll ? courseBatches : courseBatches.slice(0, maxItems);

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
        <Typography variant="h6" color="error">{error}</Typography>
      </Grid>
    );
  }

  return (
    <Grid item xs={12} md={5} lg={4}>
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item>
          <Typography variant="h5">Upcoming Batch Dates</Typography>
        </Grid>
      </Grid>

      <MainCard sx={{ mt: 2, minHeight: 500, maxHeight: 500 }} content={false}>
        <Box
          sx={{
            p: 3,
            pb: 0,
            maxHeight: showAll ? 400 : 'none', // enable scroll on View More
            overflowY: showAll ? 'auto' : 'visible',
          }}
        >
          {visibleBatches.map((batch, index) => (
            <Card key={index} sx={{ mb: 2 }} className="batch-card">
              <CardContent>
                <Typography variant="subtitle1">{batch.name}</Typography>
                {batch.orientationDate && (
                  <Typography variant="body2">Orientation Date: {new Date(batch.orientationDate).toLocaleDateString()}</Typography>
                )}
                {batch.startDate && <Typography variant="body2">Start Date: {new Date(batch.startDate).toLocaleDateString()}</Typography>}
              </CardContent>
            </Card>
          ))}

          {courseBatches.length > maxItems && (
            <Box textAlign="center" mt={2}>
              <Button variant="outlined" size="small" onClick={() => setShowAll(!showAll)}>
                {showAll ? 'View Less' : 'View More'}
              </Button>
            </Box>
          )}
        </Box>
      </MainCard>

      {/* Hidden container to measure rendered heights */}
      <Box sx={{ position: 'absolute', visibility: 'hidden', height: 0, overflow: 'hidden' }} ref={hiddenContainerRef}>
        {courseBatches.map((batch, index) => (
          <Card key={index} sx={{ mb: 2 }} className="batch-card">
            <CardContent>
              <Typography variant="subtitle1">{batch.name}</Typography>
              {batch.orientationDate && (
                <Typography variant="body2">Orientation Date: {new Date(batch.orientationDate).toLocaleDateString()}</Typography>
              )}
              {batch.startDate && <Typography variant="body2">Start Date: {new Date(batch.startDate).toLocaleDateString()}</Typography>}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Grid>
  );
};

export default GeneralSummaryCards;
