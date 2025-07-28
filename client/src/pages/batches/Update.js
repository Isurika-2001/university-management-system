import React, { useEffect, useState } from 'react';
import { TextField, Button, Grid, MenuItem, Select, Divider, LinearProgress, CircularProgress } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import { apiRoutes } from 'config';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuthContext } from 'context/useAuthContext';
import { useLocation } from 'react-router-dom';

const EditForm = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const [courseOptions, setCourseOptions] = useState([]);
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuthContext();

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
    year: Yup.string().required('Year is required'),
    number: Yup.string().required('Batch number is required')
  });

  useEffect(() => {
    fetchCourses();
    fetchBatch();
  }, []);

  // Fetch courses for dropdown
  async function fetchCourses() {
    try {
      const response = await fetch(apiRoutes.courseRoute, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        setCourseOptions(data);
      }
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }

  // Fetch existing batch data
  async function fetchBatch() {
    try {
      const response = await fetch(`${apiRoutes.batchRoute}${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        const [year, number] = data.data.name.split('.');
        setInitialValues({
          courseId: data.data.courseId,
          year: year,
          number: number
        });
      } else {
        showErrorSwal(data.message || 'Batch not found');
      }
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
        year: values.year,
        number: values.number
      };

      const response = await fetch(`${apiRoutes.batchRoute}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(updatedData)
      });

      const responseData = await response.json();

      if (!response.ok) {
        showErrorSwal(responseData.message || 'Error updating batch');
        return;
      }

      showSuccessSwal('Batch updated successfully');
    } catch (error) {
      console.error(error);
      showErrorSwal('An error occurred while updating the batch');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !initialValues) {
    return <LinearProgress />;
  }

  return (
    <MainCard title="Edit Batch">
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
                    label="Year"
                    variant="outlined"
                    name="year"
                    fullWidth
                    error={touched.year && !!errors.year}
                    helperText={<ErrorMessage name="year" />}
                    InputProps={{ sx: { px: 2, py: 1 } }}
                    sx={{ mb: 3 }}
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
                    InputProps={{ sx: { px: 2, py: 1 } }}
                    sx={{ mb: 3 }}
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
                  Update Batch
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
