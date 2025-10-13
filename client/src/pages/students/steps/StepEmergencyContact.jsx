import React, { useEffect } from 'react';
import { Field } from 'formik';
import { Card, CardContent, Box, Typography, Grid, TextField } from '@mui/material';

const StepEmergencyContact = ({ IconCmp, formBag, updateStepCompletion }) => {
  const { values } = formBag;

  // Update completion status when values change
  useEffect(() => {
    if (updateStepCompletion) {
      updateStepCompletion(values);
    }
  }, [values.emergencyContact, updateStepCompletion]);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconCmp style={{ marginRight: 8, fontSize: 24 }} />
          <Typography variant="h5">Emergency Contact (Optional)</Typography>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          This step is optional. You can skip it and complete it later when updating the student profile.
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Field
              as={TextField}
              label="Contact Name"
              variant="outlined"
              name="emergencyContact.name"
              fullWidth
              InputProps={{ sx: { px: 2, py: 1 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Field
              as={TextField}
              label="Relationship"
              variant="outlined"
              name="emergencyContact.relationship"
              fullWidth
              InputProps={{ sx: { px: 2, py: 1 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Field
              as={TextField}
              label="Phone"
              variant="outlined"
              name="emergencyContact.phone"
              fullWidth
              InputProps={{ sx: { px: 2, py: 1 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Field
              as={TextField}
              label="Email (Optional)"
              variant="outlined"
              name="emergencyContact.email"
              fullWidth
              InputProps={{ sx: { px: 2, py: 1 } }}
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              as={TextField}
              label="Address (Optional)"
              variant="outlined"
              name="emergencyContact.address"
              fullWidth
              multiline
              rows={2}
              InputProps={{ sx: { px: 2, py: 1 } }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StepEmergencyContact;
