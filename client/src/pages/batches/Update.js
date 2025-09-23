import React, { useEffect, useState } from 'react';
import { TextField, Button, Grid, MenuItem, Select, Divider, LinearProgress, CircularProgress } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import { batchesAPI } from '../../api/batches';
import { coursesAPI } from '../../api/courses';

const EditForm = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [courseOptions, setCourseOptions] = useState([]);
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const id = queryParams.get('id');

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

  const validationSchema = Yup.object().shape({
    courseId: Yup.string().required('Course is required'),
    term: Yup.string().required('Intake term is required'),
    orientationDate: Yup.date().nullable(),
    startDate: Yup.date().nullable(),
    registrationDeadline: Yup.date().nullable()
  });

  useEffect(() => {
    fetchCourses();
    fetchBatch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Fetch courses for dropdown
  async function fetchCourses() {
    try {
      const data = await coursesAPI.getAll();
      setCourseOptions(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }

  // Fetch existing intake data
  async function fetchBatch() {
    try {
      const data = await batchesAPI.getById(id);
      setInitialValues({
        courseId: data.data.courseId,
        term: data.data.name,
        orientationDate: data.data.orientationDate ? dayjs(data.data.orientationDate).format('YYYY-MM-DD') : '',
        startDate: data.data.startDate ? dayjs(data.data.startDate).format('YYYY-MM-DD') : '',
        registrationDeadline: data.data.registrationDeadline ? dayjs(data.data.registrationDeadline).format('YYYY-MM-DD') : ''
      });
    } catch (error) {
      console.error('Error fetching batch:', error);
      showErrorSwal('Error fetching batch details');
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      const updatedData = {
        courseId: values.courseId,
        term: values.term,
        orientationDate: values.orientationDate || null,
        startDate: values.startDate || null,
        registrationDeadline: values.registrationDeadline || null
      };

      await batchesAPI.update(id, updatedData);
      showSuccessSwal('Batch updated successfully');
    } catch (error) {
      console.error(error);
      showErrorSwal(error.message || 'An error occurred while updating the batch');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !initialValues) {
    return <LinearProgress />;
  }

  return (
    <MainCard title="Edit Intake">
      <Formik initialValues={initialValues} enableReinitialize validationSchema={validationSchema} onSubmit={handleSubmit}>
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
                    InputProps={{ sx: { px: 2, py: 1 } }}
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
                    InputProps={{ sx: { px: 2, py: 1 } }}
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
                  Update Intake
                </Button>
              </Grid>
            </Grid>
          </Form>
        )}
      </Formik>
    </MainCard>
  );
};

export default EditForm;
