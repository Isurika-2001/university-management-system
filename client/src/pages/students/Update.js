import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Divider, LinearProgress, MenuItem, Select } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import { useLocation } from 'react-router-dom';
import config from '../../config';

const UpdateForm = () => {
  const [data, setData] = useState(null);
  const [courseOptions, setCouseOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const location = useLocation();

  useEffect(() => {
    fetchdata();
    fetchCourses();
    fetchBatches();
  }, [location.search]);

  async function fetchdata() {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    // Fetch student data based on the id
    try {
      const response = await fetch(config.apiUrl + 'api/students/' + id, {
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
      setData(data);
      console.log(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  // fetch course options
  async function fetchCourses() {
    try {
      // Fetch course options
      const response = await fetch(config.apiUrl + 'api/courses', {
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
      setCouseOptions(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  // fetch batch options
  async function fetchBatches() {
    try {
      // Fetch batch options
      const response = await fetch(config.apiUrl + 'api/batches', {
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
      setBatchOptions(data);
    } catch (error) {
      console.error('Error fetching batches:', error);
      return [];
    }
  }

  const initialValues = {
    firstName: data ? data.firstName : '',
    lastName: data ? data.lastName : '',
    dob: data ? new Date(data.dob).toISOString().split('T')[0] : '',
    nic: data ? data.nic : '',
    address: data ? data.address : '',
    mobile: data ? data.mobile : '',
    homeContact: data ? data.homeContact : '',
    email: data ? data.email : '',
    courseId: data ? data.courseId._id : '',
    batchId: data ? data.batchId._id : ''
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    dob: Yup.string().required('Date of Birth is required'),
    nic: Yup.string()
      .matches(
        /^(?:\d{9}[vVxX]|\d{12})$/,
        'NIC should either contain 9 digits with an optional last character as a letter (v/V/x/X) or have exactly 12 digits'
      )
      .required('NIC is required'),
    address: Yup.string().required('Address is required'),
    mobile: Yup.string()
      .matches(/^\+?\d{10,12}$/, 'Contact No should be 10 to 12 digits with an optional leading + sign')
      .required('Contact No is required'),
    homeContact: Yup.string().matches(/^\+?\d{10,12}$/, 'Contact No should be 10 to 12 digits with an optional leading + sign'),
    email: Yup.string().required('Email is required'),
    courseId: Yup.string().required('Course is required'),
    batchId: Yup.string().required('Batch is required')
  });

  const handleSubmit = (values) => {
    // Handle form submission, you can update the student data here
    console.log('Submitted:', values);
  };

  if (!data) {
    return (
      <div>
        <LinearProgress />
      </div>
    );
  }

  return (
    <MainCard title="Update Student">
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ errors, handleSubmit, touched }) => (
          <Form onSubmit={handleSubmit}>
            <Grid container direction="column" justifyContent="center">
              <Grid container sx={{ p: 3 }} spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="First Name"
                    variant="outlined"
                    name="firstName"
                    fullWidth
                    error={touched.firstName && !!errors.firstName}
                    helperText={<ErrorMessage name="firstName" />}
                    InputProps={{
                      sx: { px: 2, py: 1 } // Padding added
                    }}
                    sx={{ mb: 3 }} // Margin bottom added
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
                    InputProps={{
                      sx: { px: 2, py: 1 } // Padding added
                    }}
                    sx={{ mb: 3 }} // Margin bottom added
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
                    InputProps={{
                      sx: { px: 2, py: 1 } // Padding added
                    }}
                    sx={{ mb: 3 }} // Margin bottom added
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
                    InputProps={{
                      sx: { px: 2, py: 1 } // Padding added
                    }}
                    sx={{ mb: 3 }} // Margin bottom added
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Address"
                    variant="outlined"
                    name="address"
                    fullWidth
                    error={touched.address && !!errors.address}
                    helperText={<ErrorMessage name="address" />}
                    InputProps={{
                      sx: { px: 2, py: 1 } // Padding added
                    }}
                    sx={{ mb: 3 }} // Margin bottom added
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
                    InputProps={{
                      sx: { px: 2, py: 1 } // Padding added
                    }}
                    sx={{ mb: 3 }} // Margin bottom added
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Home Contact"
                    variant="outlined"
                    name="homeContact"
                    fullWidth
                    error={touched.homeContact && !!errors.homeContact}
                    helperText={<ErrorMessage name="homeContact" />}
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
                    as={Select}
                    displayEmpty
                    variant="outlined"
                    name="courseId"
                    fullWidth
                    error={touched.courseId && !!errors.courseId}
                    helperText={<ErrorMessage name="courseId" />}
                    InputProps={{
                      sx: { px: 2, py: 1 }
                    }}
                    sx={{ mb: 3, minHeight: '3.5rem' }}
                  >
                    <MenuItem value="" disabled>
                      Course
                    </MenuItem>
                    {courseOptions.map((course) => (
                      <MenuItem key={course._id} value={course._id}>
                        {course.name}
                      </MenuItem>
                    ))}
                  </Field>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={Select}
                    displayEmpty
                    variant="outlined"
                    name="batchId"
                    SelectProps={{ native: true }}
                    fullWidth
                    error={touched.batchId && !!errors.batchId}
                    helperText={<ErrorMessage name="batchId" />}
                    InputProps={{
                      sx: { px: 2, py: 1 }
                    }}
                    sx={{ mb: 3, minHeight: '3.5rem' }}
                  >
                    <option value="" disabled>
                      Batch
                    </option>
                    {batchOptions.map((batch) => (
                      <option key={batch._id} value={batch._id}>
                        {batch.name}
                      </option>
                    ))}
                  </Field>
                </Grid>
              </Grid>
              <Divider sx={{ mt: 3, mb: 2 }} />
              <Grid item xs={12} sm={6} style={{ textAlign: 'right' }}>
                <Button type="submit" variant="contained" color="primary" size="small">
                  Update Student
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </MainCard>
  );
};

export default UpdateForm;
