import React from 'react';
import { useState } from 'react';
import { Grid, Typography, Box, Card, CardContent, useTheme, Grow, Chip } from '@mui/material';
import { LineChartOutlined, CalendarOutlined, RiseOutlined, PercentageOutlined } from '@ant-design/icons';
import ReportAreaChart from '../ReportAreaChart';

const AnalyticsReport = () => {
  const [stats, setStats] = useState({
    annualEnrollment: 0,
    monthlyEnrollment: 0,
    percentageOverAnnual: '0.00'
  });
  const theme = useTheme();

  const getPercentageColor = (percentage) => {
    const num = parseFloat(percentage);
    if (num > 0) return theme.palette.success.main;
    if (num < 0) return theme.palette.error.main;
    return theme.palette.grey[500];
  };

  const getPercentageIcon = (percentage) => {
    const num = parseFloat(percentage);
    if (num > 0) return <RiseOutlined />;
    if (num < 0) return <RiseOutlined style={{ transform: 'rotate(180deg)' }} />;
    return null;
  };

  return (
    <Grid item xs={12}>
      <Grow in timeout={500}>
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.05) 0%, rgba(255,255,255,0.9) 100%)',
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
                  backgroundColor: 'rgba(255, 152, 0, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.palette.warning.main,
                  fontSize: '24px',
                  mr: 2
                }}
              >
                <LineChartOutlined />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.grey[800] }}>
                  Enrollment Trends Over Months
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monthly enrollment analytics and trends
                </Typography>
              </Box>
            </Box>

            <Box sx={{ mb: 3 }}>
              <Grid container spacing={2}>
                {/* Annual Total Enrollment */}
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
                      <CalendarOutlined style={{ fontSize: '16px', color: theme.palette.grey[600] }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        Annual Total Enrollment
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
                      {stats.annualEnrollment.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>

                {/* This Month Enrollment */}
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
                      <CalendarOutlined style={{ fontSize: '16px', color: theme.palette.success.main }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        This Month Enrollment
                      </Typography>
                    </Box>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color: theme.palette.success.main,
                        fontSize: '1.5rem'
                      }}
                    >
                      {stats.monthlyEnrollment.toLocaleString()}
                    </Typography>
                  </Box>
                </Grid>

                {/* Percentage Over Annual */}
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
                      <PercentageOutlined style={{ fontSize: '16px', color: theme.palette.warning.main }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                        Percentage Over Annual
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography
                        variant="h5"
                        sx={{
                          fontWeight: 700,
                          color: getPercentageColor(stats.percentageOverAnnual),
                          fontSize: '1.5rem'
                        }}
                      >
                        {Math.round(stats.percentageOverAnnual)}%
                      </Typography>
                      {getPercentageIcon(stats.percentageOverAnnual) && (
                        <Chip
                          icon={getPercentageIcon(stats.percentageOverAnnual)}
                          label="" // No text, only icon
                          size="small"
                          sx={{
                            backgroundColor: getPercentageColor(stats.percentageOverAnnual),
                            color: 'white',
                            fontSize: '0.7rem',
                            height: 20,
                            minWidth: 24,
                            '& .MuiChip-icon': {
                              color: 'white !important'
                            }
                          }}
                        />
                      )}
                    </Box>
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
              <ReportAreaChart onStatsChange={setStats} />
            </Box>
          </CardContent>
        </Card>
      </Grow>
    </Grid>
  );
};

export default AnalyticsReport;
