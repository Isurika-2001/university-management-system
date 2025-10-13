import React, { useEffect } from 'react';
import { Field } from 'formik';
import { Card, CardContent, Box, Typography, Grid, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const StepAcademicDetails = ({ IconCmp, academicQualificationOptions, formBag, updateStepCompletion }) => {
  const { values } = formBag;

  // Update completion status when values change
  useEffect(() => {
    if (updateStepCompletion) {
      updateStepCompletion(values);
    }
  }, [values.highestAcademicQualification, values.qualificationDescription, updateStepCompletion]);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconCmp style={{ marginRight: 8, fontSize: 24 }} />
          <Typography variant="h5">Academic Details (Optional)</Typography>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          This step is optional. You can skip it and complete it later when updating the student profile.
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Field name="highestAcademicQualification">
              {({ field }) => (
                <FormControl fullWidth>
                  <InputLabel>Highest Academic Qualification</InputLabel>
                  <Select {...field} label="Highest Academic Qualification">
                    {academicQualificationOptions.map((q) => (
                      <MenuItem key={q} value={q}>
                        {q}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              )}
            </Field>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Field
              as={TextField}
              label="Qualification Description"
              variant="outlined"
              name="qualificationDescription"
              fullWidth
              InputProps={{ sx: { px: 2, py: 1 } }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StepAcademicDetails;
