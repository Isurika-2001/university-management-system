import { Box, Typography, Button, useTheme } from '@mui/material';
import { WarningOutlined } from '@ant-design/icons';

const SamplePage = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        minHeight: '65vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        py: { xs: 8, md: 12 }
      }}
    >
      <Box
        sx={{
          borderRadius: 3,
          boxShadow: '0 4px 28px 0 rgba(76, 78, 100, 0.08)',
          bgcolor: 'background.paper',
          px: { xs: 4, md: 8 },
          py: { xs: 5, md: 8 },
          textAlign: 'center',
          maxWidth: 400
        }}
      >
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <WarningOutlined
            style={{
              color: theme.palette.warning.main,
              fontSize: 54,
              background: theme.palette.mode === 'dark' ? 'rgba(255,200,0,0.09)' : 'rgba(255,191,0,0.09)',
              borderRadius: '50%',
              padding: 10
            }}
          />
        </Box>
        <Typography
          component="h1"
          variant="h4"
          sx={{
            fontWeight: 800,
            color: theme.palette.warning.dark,
            letterSpacing: '.01em',
            mb: 1
          }}
        >
          Access Denied
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Sorry, you do not have permission to access this page.
        </Typography>
        <Button
          variant="contained"
          sx={{
            background: theme.palette.warning.main,
            color: theme.palette.getContrastText(theme.palette.warning.main),
            boxShadow: 'none',
            fontWeight: 600,
            textTransform: 'none',
            px: 4,
            py: 1.2,
            borderRadius: 2,
            transition: 'all 0.22s',
            '&:hover': {
              background: theme.palette.warning.dark,
              boxShadow: '0 2px 16px rgba(255,191,0,0.13)'
            }
          }}
          href="/app/dashboard"
        >
          Go to Dashboard
        </Button>
      </Box>
    </Box>
  );
};

export default SamplePage;
