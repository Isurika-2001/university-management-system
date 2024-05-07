import React, { useState } from 'react';
import { TextField, Button, Grid, Divider, CircularProgress } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import config from '../../config';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const AddForm = () => {
  const [submitting, setSubmitting] = useState(false);

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
    year: '',
    number: ''
  };

  const validationSchema = Yup.object().shape({
    year: Yup.string().required('Year is required'),
    number: Yup.string().required('Batch number is required')
  });

  const handleSubmit = async (values) => {
    console.log('Submitted:', values);
    try {
      setSubmitting(true);
      const response = await fetch(config.apiUrl + 'api/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(values)
      });

      if (!response.ok) {
        // display error message
        const errorMessage = await response.text();
        if (response.status === 500) {
          console.error('Internal Server Error.');
          return;
        } else if (response.status === 403) {
          showErrorSwal(errorMessage); // Show error message from response body
        }
        return;
      } else {
        const successMessage = await response.text(); // Get success message from response body
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
    <MainCard title="Add New Batch">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
        onChange={(event, form) => {
          const { year, number } = form.values;
          // Update grade field with year and number combination
          form.setFieldValue('grade', `${year}-${number}`);
        }}
      >
        {({ errors, touched }) => (
          <Form>
            <Grid container direction="column" justifyContent="center">
              <Grid container sx={{ p: 3 }} spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Year"
                    variant="outlined"
                    name="year"
                    fullWidth
                    error={touched.year && !!errors.year}
                    helperText={<ErrorMessage name="year" />}
                    InputProps={{
                      sx: { px: 2, py: 1 } // Padding added
                    }}
                    sx={{ mb: 3 }} // Margin bottom added
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Number"
                    variant="outlined"
                    type="number"
                    name="number"
                    fullWidth
                    error={touched.number && !!errors.number}
                    helperText={<ErrorMessage name="number" />}
                    InputProps={{
                      sx: { px: 2, py: 1 } // Padding added
                    }}
                    sx={{ mb: 3 }} // Margin bottom added
                  />
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
                  Add Batch
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
