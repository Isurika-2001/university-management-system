import React, { useState, useRef, useEffect } from 'react';
import { Box, Grid, Typography, Card, CardContent, Button } from '@mui/material';
import MainCard from 'components/MainCard';

const GeneralSummaryCards = () => {
  const [showAll, setShowAll] = useState(false);
  const [maxItems, setMaxItems] = useState(0);
  const hiddenContainerRef = useRef(null);

  const courseBatches = [
    { name: 'BTEC 2025-2', dates: ['2025-08-01', '2025-08-15'] },
    { name: 'HND Computing 2025-2', dates: ['2025-09-05'] },
    { name: 'MBA 2025-3', dates: ['2025-10-01', '2025-10-20'] },
    { name: 'English Advanced 2025-1', dates: ['2025-07-25'] },
    { name: 'BSc IT 2025-1', dates: ['2025-11-10'] },
    { name: 'Business Management 2025-1', dates: ['2025-12-05'] },
    { name: 'Psychology 2025-2', dates: ['2025-09-18'] }
  ];

  const maxVisibleHeight = 400; // adjust as needed

  useEffect(() => {
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

    calculateMaxItems();
    window.addEventListener('resize', calculateMaxItems);
    return () => window.removeEventListener('resize', calculateMaxItems);
  }, []);

  const visibleBatches = showAll ? courseBatches : courseBatches.slice(0, maxItems);

  return (
    <Grid item xs={12} md={5} lg={4}>
      <Grid container alignItems="center" justifyContent="space-between">
        <Grid item>
          <Typography variant="h5">Upcoming Batch Start Dates</Typography>
        </Grid>
      </Grid>

      <MainCard sx={{ mt: 2, minHeight: 500, maxHeight: 500 }} content={false}>
        <Box
          sx={{
            p: 3,
            pb: 0,
            maxHeight: showAll ? 400 : 'none', // enable scroll on View More
            overflowY: showAll ? 'auto' : 'visible'
          }}
        >
          {visibleBatches.map((batch, index) => (
            <Card key={index} sx={{ mb: 2 }} className="batch-card">
              <CardContent>
                <Typography variant="subtitle1">{batch.name}</Typography>
                {batch.dates.map((date, i) => (
                  <Typography key={i} variant="body2">
                    {new Date(date).toLocaleDateString()}
                  </Typography>
                ))}
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
              {batch.dates.map((date, i) => (
                <Typography key={i} variant="body2">
                  {new Date(date).toLocaleDateString()}
                </Typography>
              ))}
            </CardContent>
          </Card>
        ))}
      </Box>
    </Grid>
  );
};

export default GeneralSummaryCards;
