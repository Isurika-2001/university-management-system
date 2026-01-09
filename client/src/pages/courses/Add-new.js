import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Divider,
  CircularProgress,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel
} from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import { apiRoutes } from 'config';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuthContext } from 'context/useAuthContext';
import { PATHWAY_LIST } from 'constants/pathways';

const AddForm = () => {
  const [submitting, setSubmitting] = useState(false);
  useAuthContext();

  const Toast = withReactContent(
    Swal.mixin({
      toast: true,
      position: 'bottom',
      customClass: {
        popup: 'colored-toast'
      },
      background: 'primary',
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true
    })
  );

  const showSuccessSwal = (e) => {
    Toast.fire({
      icon: 'success',
      title: e
    });
  };

  // error showErrorSwal
  const showErrorSwal = (e) => {
    Toast.fire({
      icon: 'error',
      title: e
    });
  };

  const initialValues = {
    name: '',
    code: '',
    description: '',
    pathway: '',
    prerequisites: 'None',
    courseCredits: 3,
    courseDuration: '12 months',
    weekdayBatch: false,
    weekendBatch: false
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    code: Yup.string()
      .required('Course code is required')
      .matches(/^[a-zA-Z0-9_]+$/, 'Course code can only contain letters, numbers, and underscores'),
    description: Yup.string().required('Description is required'),
    pathway: Yup.number().required('Pathway is required'),
    prerequisites: Yup.string().required('Prerequisites are required'),
    courseCredits: Yup.number().min(1, 'Course credits must be at least 1').required('Course credits are required'),
    courseDuration: Yup.string().required('Course duration is required'),
    weekdayBatch: Yup.boolean(),
    weekendBatch: Yup.boolean()
  });

  const handleSubmit = async (values) => {
    console.log('Submitted:', values);
    try {
      setSubmitting(true);
      const response = await fetch(apiRoutes.courseRoute, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Cookies are sent automatically
        body: JSON.stringify(values)
      });

      const responseData = await response.json();

      if (!response.ok) {
        // display error message
        const errorMessage = responseData.message;
        if (response.status === 500) {
          console.error('Internal Server Error.');
          return;
        } else if (response.status === 403) {
          showErrorSwal(errorMessage); // Show error message from response body
        }
        return;
      } else {
        const successMessage = responseData.message; // Get success message from response body
        showSuccessSwal(successMessage); // Show success message from response body
      }

      console.log('Student added successfully');
    } catch (error) {
      console.error(error);
      showErrorSwal(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainCard title="Add New Course">
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ errors, handleSubmit, touched }) => (
          <Form onSubmit={handleSubmit}>
            <Grid container direction="column" justifyContent="center">
              <Grid container sx={{ p: 3 }} spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Name"
                    variant="outlined"
                    name="name"
                    fullWidth
                    error={touched.name && !!errors.name}
                    helperText={<ErrorMessage name="name" />}
                    InputProps={{
                      sx: { px: 2, py: 1 } // Padding added
                    }}
                    sx={{ mb: 3 }} // Margin bottom added
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Course Code"
                    variant="outlined"
                    type="text"
                    name="code"
                    fullWidth
                    error={touched.code && !!errors.code}
                    helperText={<ErrorMessage name="code" />}
                    InputProps={{
                      sx: { px: 2, py: 1 }
                    }}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field InputProps={{ sx: { px: 2, py: 1 } }} name="pathway">
                    {({ field, form }) => (
                      <FormControl fullWidth error={form.touched.pathway && !!form.errors.pathway} sx={{ mb: 3 }}>
                        <InputLabel>Pathway</InputLabel>
                        <Select sx={{ mb: 3, minHeight: '3.5rem' }} {...field} label="Pathway">
                          <MenuItem value="">Select Pathway</MenuItem>
                          {PATHWAY_LIST.map((p) => (
                            <MenuItem key={p.id} value={p.id}>
                              {p.label}
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
                    label="Description"
                    variant="outlined"
                    type="text"
                    name="description"
                    fullWidth
                    error={touched.description && !!errors.description}
                    helperText={<ErrorMessage name="description" />}
                    InputProps={{
                      sx: { px: 2, py: 1 }
                    }}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Prerequisites"
                    variant="outlined"
                    name="prerequisites"
                    fullWidth
                    error={touched.prerequisites && !!errors.prerequisites}
                    helperText={<ErrorMessage name="prerequisites" />}
                    InputProps={{
                      sx: { px: 2, py: 1 }
                    }}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Course Credits"
                    variant="outlined"
                    type="number"
                    name="courseCredits"
                    fullWidth
                    error={touched.courseCredits && !!errors.courseCredits}
                    helperText={<ErrorMessage name="courseCredits" />}
                    InputProps={{
                      sx: { px: 2, py: 1 }
                    }}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field name="courseDuration">
                    {({ field, form }) => (
                      <Select
                        {...field}
                        displayEmpty
                        variant="outlined"
                        fullWidth
                        error={form.touched.courseDuration && !!form.errors.courseDuration}
                        sx={{ mb: 3, minHeight: '3.5rem' }}
                      >
                        <MenuItem value="" disabled>
                          Course Duration
                        </MenuItem>
                        <MenuItem value="6 months">6 Months</MenuItem>
                        <MenuItem value="9 months">9 Months</MenuItem>
                        <MenuItem value="12 months">12 Months</MenuItem>
                        <MenuItem value="15 months">15 Months</MenuItem>
                        <MenuItem value="18 months">18 Months</MenuItem>
                        <MenuItem value="24 months">24 Months</MenuItem>
                      </Select>
                    )}
                  </Field>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field name="weekdayBatch">
                    {({ field, form }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value}
                            onChange={(e) => form.setFieldValue('weekdayBatch', e.target.checked)}
                          />
                        }
                        label="Weekday Batch Available"
                        sx={{ mb: 3 }}
                      />
                    )}
                  </Field>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field name="weekendBatch">
                    {({ field, form }) => (
                      <FormControlLabel
                        control={
                          <Checkbox
                            {...field}
                            checked={field.value}
                            onChange={(e) => form.setFieldValue('weekendBatch', e.target.checked)}
                          />
                        }
                        label="Weekend Batch Available"
                        sx={{ mb: 3 }}
                      />
                    )}
                  </Field>
                </Grid>
              </Grid>
              <Divider sx={{ mt: 3, mb: 2 }} />
              <Grid item xs={12} sm={6} style={{ textAlign: 'right' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="small"
                  disabled={submitting}
                  endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  Add Course
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </MainCard>
  );
};

export default AddForm;
