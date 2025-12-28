import React, { useState, useEffect, useCallback } from 'react';
import { Box, TextField, Button, Grid, Divider, CircularProgress, LinearProgress, MenuItem } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useParams, useNavigate } from 'react-router-dom';
import { usersAPI } from '../../api/users';

function UpdateUser() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const showSuccessSwal = useCallback(
    (e) => {
      Toast.fire({ icon: 'success', title: e });
    },
    [Toast]
  );

  const showErrorSwal = useCallback(
    (e) => {
      Toast.fire({ icon: 'error', title: e });
    },
    [Toast]
  );

  const [initialValues, setInitialValues] = useState({
    name: '',
    email: '',
    password: '',
    user_type: ''
  });

  const passwordInitialValues = {
    password: '',
    confirmPassword: ''
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
      .required('Confirm Password is required')
  });

  const [userTypes, setUserTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchUserTypes = useCallback(async () => {
    try {
      const response = await usersAPI.getUserTypes();
      console.log('User types response:', response);

      // Handle both old and new response formats
      const userTypes = response.data || response;
      setUserTypes(userTypes); // Assuming formatUserTypes is no longer needed
    } catch (error) {
      console.error('Error fetching user types:', error);
    }
  }, [setUserTypes]);

  const fetchUserById = useCallback(async () => {
    try {
      const response = await usersAPI.getById(id);
      console.log('User response:', response);

      // Handle both old and new response formats
      const userData = response.data || response;
      setInitialValues({
        name: userData.name,
        email: userData.email,
        password: '', // Password is not fetched
        user_type: userData.user_type?._id || userData.user_type // Handle both populated and ID
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      showErrorSwal('Error fetching user details');
    } finally {
      setLoading(false);
    }
  }, [id, setInitialValues, setLoading, showErrorSwal]);

  useEffect(() => {
    fetchUserTypes();
    fetchUserById();
  }, [fetchUserTypes, fetchUserById]);

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      const response = await usersAPI.update(id, values);
      console.log('Update user response:', response);
      showSuccessSwal(response.message || 'User updated successfully');
      // Navigate back to users list after successful update
      setTimeout(() => {
        navigate('/app/users');
      }, 1500);
    } catch (error) {
      console.error('Error updating user:', error);
      showErrorSwal(error.message || 'Error updating user');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (values, { resetForm }) => {
    setSubmitting(true);
    console.log('Password update values:', values);

    try {
      const { password, confirmPassword } = values;
      const response = await usersAPI.updatePassword(id, { password, confirmPassword });
      showSuccessSwal(response.message || 'User password updated successfully');
      // Reset the password form after successful update
      resetForm();
    } catch (error) {
      console.error('Error updating user password:', error);
      showErrorSwal(error.message || 'Error updating user password');
    } finally {
      setSubmitting(false);
    }
  };

  if (!id) {
    return (
      <Box textAlign="center" mt={5}>
        <MainCard title="Error">
          <p>User ID is required. Please go back to the users list and try again.</p>
          <Button variant="contained" onClick={() => navigate('/app/users')} sx={{ mt: 2 }}>
            Back to Users
          </Button>
        </MainCard>
      </Box>
    );
  }

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
                <Grid item xs={12} style={{ textAlign: 'right' }}>
                  <Button variant="outlined" color="secondary" size="small" onClick={() => navigate('/app/users')} sx={{ mr: 2 }}>
                    Cancel
                  </Button>
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
                <Grid item xs={12} style={{ textAlign: 'right' }}>
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
