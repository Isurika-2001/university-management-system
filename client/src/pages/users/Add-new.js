import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Divider, CircularProgress, MenuItem } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import config from '../../config';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const AddForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [userTypes, setUserTypes] = useState([]);

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

  useEffect(() => {
    fetchUserTypes();
  }, [userTypes]);

  const initialValues = {
    name: '',
    email: '',
    password: '',
    user_type: ''
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().required('Password is required'),
    user_type: Yup.string().required('User Type is required')
  });

  // fetch user types
  async function fetchUserTypes() {
    try {
      // Fetch batch options
      const response = await fetch(config.apiUrl + 'api/user_types', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        // if (response.status === 401) {
        //   console.error('Unauthorized access. Logging out.');
        //   logout();
        // }
        if (response.status === 500) {
          console.error('Internal Server Error.');
          // logout();
          return;
        }
        return;
      }
      setUserTypes(data);
    } catch (error) {
      console.error('Error fetching batches:', error);
      return [];
    }
  }

  const handleSubmit = async (values) => {
    console.log('Submitted:', values);
    try {
      setSubmitting(true);
      const response = await fetch(config.apiUrl + 'api/user', {
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
                    label="Email"
                    variant="outlined"
                    type="text"
                    name="email"
                    fullWidth
                    error={touched.email && !!errors.email}
                    helperText={<ErrorMessage name="email" />}
                    InputProps={{
                      sx: { px: 2, py: 1 } // Padding added
                    }}
                    sx={{ mb: 3 }} // Margin bottom added
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Password"
                    variant="outlined"
                    type="password"
                    name="password"
                    fullWidth
                    error={touched.password && !!errors.password}
                    helperText={<ErrorMessage name="password" />}
                    InputProps={{
                      sx: { px: 2, py: 1 } // Padding added
                    }}
                    sx={{ mb: 3 }} // Margin bottom added
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    select // Render as select box
                    label="User Type"
                    variant="outlined"
                    name="user_type"
                    fullWidth
                    error={touched.user_type && !!errors.user_type}
                    helperText={<ErrorMessage name="user_type" />}
                    InputProps={{
                      sx: { px: 2, py: 1 } // Padding added
                    }}
                    sx={{ mb: 3 }} // Margin bottom added
                  >
                    {userTypes.map((option) => (
                      <MenuItem key={option.id} value={option.name}>
                        {option.name}
                      </MenuItem>
                    ))}
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
                  Add User
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
