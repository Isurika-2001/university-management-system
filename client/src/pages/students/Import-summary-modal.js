import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
} from '@mui/material';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const ImportSummaryModal = ({ open, onClose, importSummary }) => {
  if (!importSummary) return null;

  const { summary = {}, results = {} } = importSummary;

  const total = summary.total || 0;
  const successCount = summary.success || 0;
  const failedCount = summary.failed || 0;

  const successResults = results.success || [];
  const failedResults = results.failed || [];

  // Count by type for success
  const countByType = successResults.reduce((acc, item) => {
    acc[item.type] = (acc[item.type] || 0) + 1;
    return acc;
  }, {});

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Import Summary</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography variant="subtitle1" gutterBottom>
            Total Records Processed — <strong>{total}</strong>
          </Typography>
          <Box display="flex" alignItems="center" mb={1}>
            <CheckCircleOutlined style={{ color: 'green' }} />
            <Typography variant="subtitle1" sx={{ ml: 1 }}>
              Successful Records — <strong>{successCount}</strong>
            </Typography>
          </Box>
          <Box display="flex" alignItems="center" mb={2}>
            <CloseCircleOutlined style={{ color: 'red' }} />
            <Typography variant="subtitle1" sx={{ ml: 1 }}>
              Failed Records — <strong>{failedCount}</strong>
            </Typography>
          </Box>

          {/* Detailed success breakdown */}
          {Object.entries(countByType).map(([type, count]) => (
            <Box key={type} display="flex" alignItems="center" mb={1}>
              <CheckCircleOutlined style={{ color: 'green' }} />
              <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                {type.replace(/_/g, ' ')} — <strong>{count}</strong>
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Show details for no-course reasons (optional) */}
        {successResults.some(r => r.courseReg === false) && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Records Without Course Registration
            </Typography>
            <List dense>
              {successResults
                .filter(item => item.courseReg === false)
                .map((item, index) => (
                  <ListItem key={index} sx={{ backgroundColor: '#fff8e1', mb: 1, borderRadius: 1 }}>
                    <ListItemText
                      primary={
                        <>
                          <strong>Registration No: {item.registration_no}</strong>
                          <Chip
                            label={item.type.replace(/_/g, ' ')}
                            size="small"
                            sx={{ ml: 1, textTransform: 'capitalize' }}
                            color="warning"
                          />
                        </>
                      }
                      secondary={item.courseRegReason || 'No reason provided'}
                    />
                  </ListItem>
                ))}
            </List>
          </>
        )}

        {/* Failed records details */}
        {failedCount > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" color="error" gutterBottom>
              Failed Records
            </Typography>
            <List dense>
              {failedResults.map((item, index) => (
                <ListItem key={index} sx={{ backgroundColor: '#fff0f0', mb: 1, borderRadius: 1 }}>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        {item.entry ? (
                          <>
                            <strong>
                              {item.entry.firstName} {item.entry.lastName}
                            </strong>
                          </>
                        ) : (
                          <strong>Reg No: {item.registration_no || 'N/A'}</strong>
                        )}
                        <Chip label={item.type || 'unknown'} color="error" size="small" sx={{ ml: 1, textTransform: 'capitalize' }} />
                      </Box>
                    }
                    secondary={`Error: ${item.error || item.reason || 'Unknown error'}`}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained" color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImportSummaryModal;
