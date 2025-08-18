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

  // Handle both old and new import summary formats
  let total, successCount, failedCount, errors;
  
  if (importSummary.total !== undefined) {
    // New Excel import format
    total = importSummary.total || 0;
    successCount = importSummary.successful || 0;
    failedCount = importSummary.failed || 0;
    errors = importSummary.errors || [];
  } else {
    // Old bulk upload format
    const { summary = {}, results = {} } = importSummary;
    total = summary.total || 0;
    successCount = summary.success || 0;
    failedCount = summary.failed || 0;
    errors = results.failed || [];
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Summary</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <Typography variant="h6" gutterBottom>
            Import Results
          </Typography>
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
        </Box>

        {/* Success message */}
        {successCount > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ backgroundColor: '#f0f8f0', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="h6" color="success.main" gutterBottom>
                ✅ Import Successful!
              </Typography>
              <Typography variant="body2" color="success.main">
                {successCount} student(s) have been successfully imported and enrolled in their respective courses.
              </Typography>
            </Box>
          </>
        )}

        {/* Failed records details */}
        {failedCount > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" color="error" gutterBottom>
              Failed Records ({failedCount})
            </Typography>
            
            {/* Helpful instructions */}
            <Box sx={{ backgroundColor: '#fff3cd', p: 2, borderRadius: 1, mb: 2 }}>
              <Typography variant="body2" color="warning.main">
                <strong>💡 Tips to fix import errors:</strong>
              </Typography>
                                            <Typography variant="body2" color="warning.main" sx={{ mt: 1 }}>
                 • Course Code and Batch Name are optional (leave empty if not enrolling immediately)
               </Typography>
               <Typography variant="body2" color="warning.main">
                 • If provided, ensure Course Code exactly matches existing course codes
               </Typography>
               <Typography variant="body2" color="warning.main">
                 • If provided, ensure Batch names exactly match existing batch names
               </Typography>
               <Typography variant="body2" color="warning.main">
                 • Check that NIC numbers are unique and valid
               </Typography>
               <Typography variant="body2" color="warning.main">
                 • Verify all required fields are filled
               </Typography>
               <Typography variant="body2" color="warning.main">
                 • Use YYYY-MM-DD format for dates
               </Typography>
            </Box>
            
            <List dense>
              {errors.map((error, index) => (
                <ListItem key={index} sx={{ backgroundColor: '#fff0f0', mb: 1, borderRadius: 1 }}>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <strong>Row {index + 2}</strong>
                        <Chip label="Error" color="error" size="small" sx={{ ml: 1 }} />
                      </Box>
                    }
                    secondary={error}
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
