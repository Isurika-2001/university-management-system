import React, { useEffect } from 'react';
import { Field, ErrorMessage } from 'formik';
import { Card, CardContent, Box, Typography, Grid, TextField } from '@mui/material';

const StepPersonalDetails = ({ IconCmp, formBag, updateStepCompletion }) => {
  const { errors, touched, values } = formBag;

  // Update completion status when values change
  useEffect(() => {
    if (updateStepCompletion) {
      updateStepCompletion(values);
    }
  }, [values.firstName, values.lastName, values.dob, values.nic, values.address, values.mobile, values.email, updateStepCompletion]);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconCmp style={{ marginRight: 8, fontSize: 24 }} />
          <Typography variant="h5">Personal Details</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Field
              as={TextField}
              label="First Name"
              variant="outlined"
              name="firstName"
              fullWidth
              error={touched.firstName && !!errors.firstName}
              helperText={<ErrorMessage name="firstName" />}
              InputProps={{ sx: { px: 2, py: 1 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Field
              as={TextField}
              label="Last Name"
              variant="outlined"
              name="lastName"
              fullWidth
              error={touched.lastName && !!errors.lastName}
              helperText={<ErrorMessage name="lastName" />}
              InputProps={{ sx: { px: 2, py: 1 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Field
              as={TextField}
              label="Date of Birth"
              variant="outlined"
              name="dob"
              InputLabelProps={{ shrink: true }}
              type="date"
              fullWidth
              error={touched.dob && !!errors.dob}
              helperText={<ErrorMessage name="dob" />}
              InputProps={{ sx: { px: 2, py: 1 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Field
              as={TextField}
              label="NIC"
              variant="outlined"
              name="nic"
              fullWidth
              error={touched.nic && !!errors.nic}
              helperText={<ErrorMessage name="nic" />}
              InputProps={{ sx: { px: 2, py: 1 } }}
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              as={TextField}
              label="Address"
              variant="outlined"
              name="address"
              fullWidth
              multiline
              rows={3}
              error={touched.address && !!errors.address}
              helperText={<ErrorMessage name="address" />}
              InputProps={{ sx: { px: 2, py: 1 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Field
              as={TextField}
              label="Mobile"
              variant="outlined"
              name="mobile"
              fullWidth
              error={touched.mobile && !!errors.mobile}
              helperText={<ErrorMessage name="mobile" />}
              InputProps={{ sx: { px: 2, py: 1 } }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Field
              as={TextField}
              label="Home Contact (Optional)"
              variant="outlined"
              name="homeContact"
              fullWidth
              error={touched.homeContact && !!errors.homeContact}
              helperText={<ErrorMessage name="homeContact" />}
              InputProps={{ sx: { px: 2, py: 1 } }}
            />
          </Grid>
          <Grid item xs={12}>
            <Field
              as={TextField}
              label="Email"
              variant="outlined"
              name="email"
              fullWidth
              error={touched.email && !!errors.email}
              helperText={<ErrorMessage name="email" />}
              InputProps={{ sx: { px: 2, py: 1 } }}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StepPersonalDetails;
