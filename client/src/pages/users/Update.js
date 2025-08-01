import React, { useState, useEffect } from 'react';
import { Box, TextField, Button, Grid, Divider, CircularProgress, LinearProgress, MenuItem } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import { apiRoutes } from 'config';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuthContext } from 'context/useAuthContext';
import { useLocation } from 'react-router-dom';
import { formatUserTypes } from '../../utils/userTypeUtils';

function UpdateUser() {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [submitting, setSubmitting] = useState(false);

  const id = queryParams.get('id');

  const { user } = useAuthContext();

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
    Toast.fire({ icon: 'success', title: e });
  };

  const showErrorSwal = (e) => {
    Toast.fire({ icon: 'error', title: e });
  };

  const [initialValues, setInitialValues] = useState({
    name: '',
    email: '',
    password: '',
    user_type: ''
  });

  const passwordInitialValues = {
    password: '',
    consirmPassword: ''
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    user_type: Yup.string().required('User Type is required')
  });

  const passwordValidationSchema = Yup.object().shape({
    password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm Password is required'),
  });

  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserTypes();
    fetchUserById();
  }, []);

  const fetchUserTypes = async () => {
    try {
      const response = await fetch(apiRoutes.userTypeRoute, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setUserTypes(formatUserTypes(data));
      } else {
        console.error('Failed to fetch user types');
      }
    } catch (error) {
      console.error('Error fetching user types:', error);
    }
  };

  const fetchUserById = async () => {
    try {
      const response = await fetch(`${apiRoutes.userRoute}${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        setInitialValues({
          name: data.name,
          email: data.email,
          user_type: data.user_type // Using ID directly
        });
      } else {
        showErrorSwal(data.message || 'User not found');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      showErrorSwal('Error fetching user details');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const response = await fetch(`${apiRoutes.userRoute}${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(values)
      });

      const data = await response.json();

      if (response.ok) {
        showSuccessSwal(data.message || 'User updated successfully');
      } else {
        showErrorSwal(data.message || 'Failed to update user');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      showErrorSwal('Error updating user');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (values) => {
    setSubmitting(true);
    console.log('Values', values);

    try {
      const { password, confirmPassword } = values; // Only send the required field

      const response = await fetch(`${apiRoutes.userRoute}password/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify({ password, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccessSwal(data.message || 'User password updated successfully');
      } else {
        showErrorSwal(data.message || 'Failed to update user password');
      }
    } catch (error) {
      console.error('Error updating user password:', error);
      showErrorSwal('Error updating user password');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box textAlign="center" mt={5}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <>
      <MainCard title="Update User">
        <Formik enableReinitialize initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ errors, handleSubmit, touched }) => (
            <Form onSubmit={handleSubmit}>
              <Grid container direction="column" justifyContent="center">
                <Grid container sx={{ p: 3 }} spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label="Name"
                      name="name"
                      fullWidth
                      error={touched.name && !!errors.name}
                      helperText={<ErrorMessage name="name" />}
                      sx={{ mb: 3 }}
                      InputProps={{ sx: { px: 2, py: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label="Email"
                      name="email"
                      type="email"
                      fullWidth
                      error={touched.email && !!errors.email}
                      helperText={<ErrorMessage name="email" />}
                      sx={{ mb: 3 }}
                      InputProps={{ sx: { px: 2, py: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      select
                      label="User Type"
                      name="user_type"
                      fullWidth
                      error={touched.user_type && !!errors.user_type}
                      helperText={<ErrorMessage name="user_type" />}
                      sx={{ mb: 3 }}
                      InputProps={{ sx: { px: 2, py: 1 } }}
                    >
                      {userTypes.map((option) => (
                        <MenuItem key={option._id} value={option._id}>
                          {option.displayName}
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
                    Update User
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </MainCard>

      <MainCard title="Update Password" sx={{ marginTop: 5 }}>
        <Formik
          enableReinitialize
          initialValues={passwordInitialValues}
          validationSchema={passwordValidationSchema}
          onSubmit={handlePasswordSubmit}
        >
          {({ errors, handleSubmit, touched }) => (
            <Form onSubmit={handleSubmit}>
              <Grid container direction="column" justifyContent="center">
                <Grid container sx={{ p: 3 }} spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label="Password"
                      name="password"
                      type="password"
                      fullWidth
                      error={touched.password && !!errors.password}
                      helperText={<ErrorMessage name="password" />}
                      sx={{ mb: 3 }}
                      InputProps={{ sx: { px: 2, py: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label="Confirm Password"
                      type="password"
                      name="confirmPassword"
                      fullWidth
                      error={touched.confirmPassword && !!errors.confirmPassword}
                      helperText={<ErrorMessage name="confirmPassword" />}
                      sx={{ mb: 3 }}
                      InputProps={{ sx: { px: 2, py: 1 } }}
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
                    Update Password
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </MainCard>
    </>
  );
}

export default UpdateUser;
