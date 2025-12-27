import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Divider, CircularProgress, MenuItem } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useNavigate } from 'react-router-dom';
import { formatUserTypes } from '../../utils/userTypeUtils';
import { usersAPI } from '../../api/users';

const AddForm = () => {
  const navigate = useNavigate();
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
  }, []);

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
      const response = await usersAPI.getUserTypes();
      console.log('User types response:', response);

      // Handle both old and new response formats
      const userTypes = response.data || response;
      setUserTypes(formatUserTypes(userTypes));
    } catch (error) {
      console.error('Error fetching user types:', error);
      return [];
    }
  }

  const handleSubmit = async (values, { resetForm }) => {
    console.log('Submitted:', values);
    try {
      setSubmitting(true);
      const response = await usersAPI.create(values);
      console.log('Create user response:', response);
      showSuccessSwal(response.message || 'User added successfully');
      console.log('User added successfully');
      // Reset form and navigate back to users list
      resetForm();
      setTimeout(() => {
        navigate('/app/users');
      }, 1500);
    } catch (error) {
      console.error('Error creating user:', error);
      showErrorSwal(error.message || 'Failed to add user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainCard title="Add New User">
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
