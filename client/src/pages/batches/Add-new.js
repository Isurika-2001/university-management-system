import React, { useEffect, useState } from 'react';
import { TextField, Button, Grid, MenuItem, Select, Divider, CircularProgress } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { batchesAPI } from '../../api/batches';
import { coursesAPI } from '../../api/courses';

const AddForm = () => {
  const [courseOptions, setCouseOptions] = useState([]);
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
    courseId: '',
    term: '',
    orientationDate: '',
    startDate: '',
    registrationDeadline: ''
  };

  const validationSchema = Yup.object().shape({
    courseId: Yup.string().required('Course is required'),
    term: Yup.string().required('Intake term is required'),
    orientationDate: Yup.date().nullable(),
    startDate: Yup.date().nullable(),
    registrationDeadline: Yup.date().nullable()
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  // fetch course options
  async function fetchCourses() {
    try {
      const data = await coursesAPI.getAll();
      setCouseOptions(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  const handleSubmit = async (values) => {
    console.log('Submitted:', values);
    try {
      setSubmitting(true);
      const responseData = await batchesAPI.create(values);
      showSuccessSwal(responseData.message || 'Batch added successfully');
      console.log('Batch added successfully');
    } catch (error) {
      console.error(error);
      showErrorSwal(error.message || 'Failed to add intake');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainCard title="Add New Intake">
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} onChange={undefined}>
        {({ errors, touched }) => (
          <Form>
            <Grid container direction="column" justifyContent="center">
              <Grid container sx={{ p: 3 }} spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={Select}
                    label="Course"
                    variant="outlined"
                    displayEmpty
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
                    as={TextField}
                    label="Intake Term"
                    variant="outlined"
                    name="term"
                    fullWidth
                    error={touched.term && !!errors.term}
                    helperText={<ErrorMessage name="term" />}
                    InputProps={{
                      sx: { px: 2, py: 1 }
                    }}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Orientation Date"
                    variant="outlined"
                    name="orientationDate"
                    InputLabelProps={{ shrink: true }}
                    type="date"
                    fullWidth
                    error={touched.orientationDate && !!errors.orientationDate}
                    helperText={<ErrorMessage name="orientationDate" />}
                    InputProps={{
                      sx: { px: 2, py: 1 } // Padding added
                    }}
                    sx={{ mb: 3 }} // Margin bottom added
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Start Date"
                    variant="outlined"
                    name="startDate"
                    InputLabelProps={{ shrink: true }}
                    type="date"
                    fullWidth
                    error={touched.startDate && !!errors.startDate}
                    helperText={<ErrorMessage name="startDate" />}
                    InputProps={{
                      sx: { px: 2, py: 1 } // Padding added
                    }}
                    sx={{ mb: 3 }} // Margin bottom added
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Registration Deadline"
                    variant="outlined"
                    name="registrationDeadline"
                    InputLabelProps={{ shrink: true }}
                    type="date"
                    fullWidth
                    error={touched.registrationDeadline && !!errors.registrationDeadline}
                    helperText={<ErrorMessage name="registrationDeadline" />}
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
                  Add Intake
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
