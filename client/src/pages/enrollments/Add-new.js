import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Grid, 
  Divider, 
  Select, 
  MenuItem, 
  CircularProgress,
  FormControl,
  InputLabel,
  FormHelperText,
  Typography,
  Box,
  Autocomplete,
  ListItemText
} from '@mui/material';
import { 
  UserOutlined, 
  BookOutlined, 
  BranchesOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import { apiRoutes } from 'config';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuthContext } from 'context/useAuthContext';

const AddEnrollment = () => {
  const [studentOptions, setStudentOptions] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [searchingStudents, setSearchingStudents] = useState(false);
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
    Toast.fire({
      icon: 'success',
      title: e
    });
  };

  const showErrorSwal = (e) => {
    Toast.fire({
      icon: 'error',
      title: e
    });
  };

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch students when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm.trim() !== '') {
      searchStudents(debouncedSearchTerm);
    } else {
      // Only fetch all students if we don't have any loaded yet
      if (studentOptions.length === 0) {
        fetchStudents();
      }
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    fetchCourses();
    fetchStudents(); // Load initial students
  }, []);

  useEffect(() => {
    fetchBatches(selectedCourse);
  }, [selectedCourse]);

  // Fetch student options
  async function fetchStudents() {
    try {
      const response = await fetch(apiRoutes.studentRoute, {
        method: 'GET',   
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 500) {
          console.error('Internal Server Error.');
          return;
        }
        return;
      }
      setStudentOptions(data.data || data);
    } catch (error) {
      console.error('Error fetching students:', error);
      return [];
    }
  }

  // Search students with debounced search
  async function searchStudents(searchTerm) {
    try {
      setSearchingStudents(true);
      const response = await fetch(`${apiRoutes.studentRoute}?search=${encodeURIComponent(searchTerm)}`, {
        method: 'GET',   
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 500) {
          console.error('Internal Server Error.');
          return;
        }
        return;
      }
      setStudentOptions(data.data || data);
    } catch (error) {
      console.error('Error searching students:', error);
      return [];
    } finally {
      setSearchingStudents(false);
    }
  }

  // Fetch course options
  async function fetchCourses() {
    try {
      const response = await fetch(apiRoutes.courseRoute, {
        method: 'GET',   
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 500) {
          console.error('Internal Server Error.');
          return;
        }
        return;
      }
      setCourseOptions(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  // Fetch batch options
  async function fetchBatches(courseId) {
    if (!courseId) {
      setBatchOptions([]);
      return;
    }

    try {
      const response = await fetch(apiRoutes.batchRoute + `course/${courseId}`, {
        method: 'GET',   
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 500) {
          console.error('Internal Server Error.');
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
    studentId: '',
    courseId: '',
    batchId: '',
    enrollmentDate: new Date().toISOString().split('T')[0] // Default to today
  };

  const validationSchema = Yup.object().shape({
    studentId: Yup.string().required('Student is required'),
    courseId: Yup.string().required('Course is required'),
    batchId: Yup.string().required('Batch is required'),
    enrollmentDate: Yup.string().required('Enrollment date is required')
  });

  const handleSubmit = async (values) => {
    console.log('Submitting enrollment:', values);
    try {
      setSubmitting(true);

      const response = await fetch(apiRoutes.enrollmentRoute, {
        method: 'POST',   
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(values)
      });

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || 'Failed to create enrollment';
        if (response.status === 500) {
          console.error('Internal Server Error.');
          return;
        } else if (response.status === 403) {
          showErrorSwal(errorMessage);
        } else {
          showErrorSwal(errorMessage);
        }
        return;
      } else {
        const successMessage = responseData.message || 'Enrollment created successfully';
        showSuccessSwal(successMessage);
        // Reset form
        window.location.reload();
      }

      console.log('Enrollment created successfully');
    } catch (error) {
      console.error(error);
      showErrorSwal('Failed to create enrollment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainCard title="Add New Enrollment">
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ errors, handleSubmit, touched }) => (
          <Form onSubmit={handleSubmit}>
            <Grid container direction="column" spacing={3}>
              
              {/* Student Selection */}
              <Grid item>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <UserOutlined style={{ marginRight: 8 }} />
                  <Typography variant="h6">Student Information</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field name="studentId">
                      {({ field, form }) => (
                        <FormControl fullWidth error={form.touched.studentId && !!form.errors.studentId}>
                          <Autocomplete
                            options={studentOptions}
                            getOptionLabel={(option) => {
                              if (typeof option === 'string') return option;
                              return `${option.firstName} ${option.lastName} - ${option.registration_no || option.registrationNo} (${option.nic})`;
                            }}
                            value={studentOptions.find(student => student._id === field.value) || null}
                            onChange={(event, newValue) => {
                              form.setFieldValue('studentId', newValue ? newValue._id : '');
                            }}
                            onInputChange={(event, newInputValue, reason) => {
                              if (reason === 'input') {
                                setSearchTerm(newInputValue);
                              } else if (reason === 'clear') {
                                setSearchTerm('');
                                fetchStudents(); // Reload all students when cleared
                              }
                            }}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label="Search Student"
                                placeholder="Type to search by name, registration number, or NIC"
                                error={form.touched.studentId && !!form.errors.studentId}
                                helperText={form.touched.studentId && form.errors.studentId ? form.errors.studentId : ''}
                                InputProps={{
                                  ...params.InputProps,
                                  endAdornment: (
                                    <>
                                      {searchingStudents ? <CircularProgress color="inherit" size={20} /> : null}
                                      {params.InputProps.endAdornment}
                                    </>
                                  ),
                                }}
                              />
                            )}
                            renderOption={(props, option) => (
                              <li {...props}>
                                <ListItemText
                                  primary={`${option.firstName} ${option.lastName}`}
                                  secondary={`Reg: ${option.registration_no || option.registrationNo} | NIC: ${option.nic}`}
                                />
                              </li>
                            )}
                            loading={searchingStudents}
                            filterOptions={(x) => x} // Disable built-in filtering since we're using server-side search
                            noOptionsText={searchingStudents ? "Searching..." : searchTerm ? "No students found" : "Start typing to search students"}
                            clearOnBlur={false}
                            clearOnEscape={false}
                          />
                        </FormControl>
                      )}
                    </Field>
                  </Grid>
                </Grid>
              </Grid>

              <Divider />

              {/* Course and Batch Selection */}
              <Grid item>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BookOutlined style={{ marginRight: 8 }} />
                  <Typography variant="h6">Course Information</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field name="courseId">
                      {({ field, form }) => (
                        <FormControl fullWidth error={form.touched.courseId && !!form.errors.courseId}>
                          <InputLabel>Course</InputLabel>
                          <Select
                            {...field}
                            label="Course"
                            onChange={(e) => {
                              const selected = e.target.value;
                              form.setFieldValue('courseId', selected);
                              setSelectedCourse(selected);
                              form.setFieldValue('batchId', '');
                            }}
                          >
                            {courseOptions.map((course) => (
                              <MenuItem key={course._id} value={course._id}>
                                {course.name}
                              </MenuItem>
                            ))}
                          </Select>
                          {form.touched.courseId && form.errors.courseId && (
                            <FormHelperText>{form.errors.courseId}</FormHelperText>
                          )}
                        </FormControl>
                      )}
                    </Field>
                  </Grid>
                  {selectedCourse && (
                    <Grid item xs={12} sm={6}>
                      <Field name="batchId">
                        {({ field, form }) => (
                          <FormControl fullWidth error={form.touched.batchId && !!form.errors.batchId}>
                            <InputLabel>Batch</InputLabel>
                            <Select {...field} label="Batch">
                              {batchOptions.map((batch) => (
                                <MenuItem key={batch._id} value={batch._id}>
                                  {batch.name}
                                </MenuItem>
                              ))}
                            </Select>
                            {form.touched.batchId && form.errors.batchId && (
                              <FormHelperText>{form.errors.batchId}</FormHelperText>
                            )}
                          </FormControl>
                        )}
                      </Field>
                    </Grid>
                  )}
                </Grid>
              </Grid>

              <Divider />

              {/* Enrollment Date */}
              <Grid item>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BranchesOutlined style={{ marginRight: 8 }} />
                  <Typography variant="h6">Enrollment Details</Typography>
                </Box>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label="Enrollment Date"
                      variant="outlined"
                      name="enrollmentDate"
                      InputLabelProps={{ shrink: true }}
                      type="date"
                      fullWidth
                      error={touched.enrollmentDate && !!errors.enrollmentDate}
                      helperText={<ErrorMessage name="enrollmentDate" />}
                      InputProps={{ sx: { px: 2, py: 1 } }}
                    />
                  </Grid>
                </Grid>
              </Grid>

              {/* Submit Button */}
              <Grid item>
                <Divider sx={{ my: 2 }} />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    size="large"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveOutlined />}
                  >
                    {submitting ? 'Creating...' : 'Create Enrollment'}
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </MainCard>
  );
};

export default AddEnrollment;
