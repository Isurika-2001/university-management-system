import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Divider, LinearProgress, CircularProgress } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { FileAddOutlined } from '@ant-design/icons';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import { useLocation } from 'react-router-dom';
import config from '../../config';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const UpdateForm = () => {
  const [data, setData] = useState(null);
  const [courseRegistrations, setCourseRegistrations] = useState([]);
  const [courseOptions, setCouseOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [dialogErrors, setDialogErrors] = useState({});

  const location = useLocation();

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
    fetchdata();
    fetchCourses();
    fetchBatches();
    console.log(courseRegistrations, courseOptions, batchOptions);
  }, [location.search]);

  useEffect(() => {
    fetchCourseRegistrations();
  }, []);

  async function fetchdata() {
    setLoading(true);
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
      setLoading(false);
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  // fetch add course registrations belongs to the student
  async function fetchCourseRegistrations() {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    try {
      setLoading(true);
      // Fetch course registrations
      const response = await fetch(config.apiUrl + 'api/course_registrations/student/' + id, {
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
      setCourseRegistrations(data);
      setLoading(false);
      console.log(data);
    } catch (error) {
      console.error('Error fetching course registrations:', error);
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
    email: data ? data.email : ''
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
    email: Yup.string().required('Email is required')
  });

  const handleSubmit = async (values) => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    console.log('Submitting:', values, id);
    try {
      setSubmitting(true);
      const response = await fetch(config.apiUrl + 'api/students/' + id, {
        method: 'PUT',
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

        setOpen(false);
        showSuccessSwal(successMessage); // Show success message from response body
      }

      console.log('Student updated successfully');
    } catch (error) {
      console.error(error);
      showErrorSwal(error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!data) {
    return (
      <div>
        <LinearProgress />
      </div>
    );
  }

  // const handleAddNewReg = (studentId) => {
  //   console.log('Add new course registration', studentId);
  // };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
  };

  const handleBatchChange = (event) => {
    setSelectedBatch(event.target.value);
  };

  // Function to validate the selected course and batch
  const validateDialog = () => {
    const errors = {};
    if (!selectedCourse) {
      errors.course = 'Course is required';
    }
    if (!selectedBatch) {
      errors.batch = 'Batch is required';
    }
    return errors;
  };

  // Function to handle the submission of the dialog form
  const handleAddCourseRegistration = () => {
    const errors = validateDialog();
    if (Object.keys(errors).length === 0) {
      // Perform your action here (e.g., adding a new course registration)
      // Reset dialog state
      setSelectedCourse('');
      setSelectedBatch('');
      handleClose();
    } else {
      // Set dialog errors
      setDialogErrors(errors);
    }
  };

  const AddCourseRegistration = async () => {
    // get the student id from the url
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    console.log('Adding course registration:', id, selectedCourse, selectedBatch);
    // define the values to be sent to the server
    const values = {
      courseId: selectedCourse,
      batchId: selectedBatch
    };

    try {
      setSubmitting(true);
      const response = await fetch(config.apiUrl + 'api/students/course_registration/' + id, {
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
          console.error(errorMessage);
          return;
        } else if (response.status === 403) {
          showErrorSwal(errorMessage); // Show error message from response body
        }
        return;
      } else {
        const successMessage = await response.text(); // Get success message from response body
        showSuccessSwal(successMessage); // Show success message from response body
        // Close the dialog
        handleClose();
      }
      fetchCourseRegistrations();
      console.log('Student updated successfully');
    } catch (error) {
      console.error(error);
      showErrorSwal(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id) => async () => {
    try {
      const response = await fetch(config.apiUrl + 'api/students/course_registration/' + id, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // display error message
        const errorMessage = await response.text();
        if (response.status === 500) {
          console.error(errorMessage);
          return;
        } else if (response.status === 403) {
          showErrorSwal(errorMessage); // Show error message from response body
        }
        return;
      } else {
        const successMessage = await response.text(); // Get success message from response body
        showSuccessSwal(successMessage); // Show success message from response body
      }
      fetchCourseRegistrations();
      console.log('Course registration deleted successfully');
    } catch (error) {
      console.error(error);
      showErrorSwal(error);
    }
  }

  return (
    <>
      {loading && (
        <div>
          <LinearProgress />
        </div>
      )}
      <MainCard title="Update Student Details">
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
                </Grid>
                <Grid item xs={12} sm={6} style={{ textAlign: 'right' }}>
                  <Button
                    disabled={submitting}
                    endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="small"
                  >
                    Update Student
                  </Button>
                </Grid>
                <Divider sx={{ mt: 3, mb: 2 }} />
              </Grid>
            </Form>
          )}
        </Formik>
        <Divider sx={{ mt: 3, mb: 2 }} />
      </MainCard>

      <MainCard
        title="Update Course Details"
        sx={{
          marginTop: 5
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'right',
            marginBottom: 2,
            flexDirection: 'row' // Ensure items are aligned horizontally
          }}
        >
          <div>
            <Button variant="contained" startIcon={<FileAddOutlined />} onClick={handleOpen}>
              New Course Registration
            </Button>
          </div>
        </Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Batch</TableCell>
                <TableCell>Action</TableCell> {/* Add column for actions */}
              </TableRow>
            </TableHead>
            <TableBody>
              {courseRegistrations.map((registration, index) => (
                <TableRow key={index}>
                  <TableCell>{registration.courseId.name}</TableCell>
                  <TableCell>{registration.batchId.name}</TableCell>
                  <TableCell>
                    <Button onClick={handleDelete(registration._id)} variant="contained" color="error">
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>
      <Dialog open={open} onClose={handleClose} maxWidth="md">
        <DialogTitle>Add New Course Registration</DialogTitle>
        <DialogContent>
          <Formik initialValues={{}} onSubmit={handleAddCourseRegistration}>
            {({ handleSubmit }) => (
              <Form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth error={!!dialogErrors.course}>
                      <InputLabel>Select Course</InputLabel>
                      <Select
                        value={selectedCourse}
                        onChange={handleCourseChange}
                        fullWidth
                        sx={{ minWidth: 240 }} // Increase the size of the select box
                      >
                        {courseOptions.map((course) => (
                          <MenuItem key={course._id} value={course._id}>
                            {course.name}
                          </MenuItem>
                        ))}
                      </Select>
                      <ErrorMessage name="course" component="div" className="error-message" />
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth error={!!dialogErrors.batch}>
                      <InputLabel>Select Batch</InputLabel>
                      <Select
                        value={selectedBatch}
                        onChange={handleBatchChange}
                        fullWidth
                        sx={{ minWidth: 240 }} // Increase the size of the select box
                      >
                        {batchOptions.map((batch) => (
                          <MenuItem key={batch._id} value={batch._id}>
                            {batch.name}
                          </MenuItem>
                        ))}
                      </Select>
                      <ErrorMessage name="batch" component="div" className="error-message" />
                    </FormControl>
                  </Grid>
                </Grid>
              </Form>
            )}
          </Formik>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={AddCourseRegistration} type="submit" color="primary" variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UpdateForm;
