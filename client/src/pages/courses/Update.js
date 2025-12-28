import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  TextField,
  Button,
  Grid,
  Divider,
  Typography,
  CircularProgress,
  LinearProgress,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel
} from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import { apiRoutes } from 'config';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuthContext } from 'context/useAuthContext';
import { useParams } from 'react-router-dom';
import { PATHWAY_LIST } from 'constants/pathways';

const UpdateCourseForm = () => {
  const [loading, setLoading] = useState([]);
  const [batchData, setBatchData] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState(null);
  const [, setTotalRows] = useState(0);
  const { user } = useAuthContext();
  const { id: courseId } = useParams();

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

  const showSuccessSwal = (msg) => {
    Toast.fire({ icon: 'success', title: msg });
  };

  const showErrorSwal = useCallback(
    (msg) => {
      Toast.fire({ icon: 'error', title: msg });
    },
    [Toast]
  );

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    code: Yup.string()
      .required('Course code is required')
      .matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
    description: Yup.string().required('Description is required'),
    prerequisites: Yup.string().required('Prerequisites are required'),
    courseCredits: Yup.number().min(1, 'Course credits must be at least 1').required('Course credits are required'),
    courseDuration: Yup.string().required('Course duration is required'),
    pathway: Yup.number().required('Pathway is required'),
    weekdayBatch: Yup.boolean(),
    weekendBatch: Yup.boolean()
  });

  // Fetch existing course data
  useEffect(() => {
    console.log('id', courseId);
    const fetchCourse = async () => {
      try {
        const res = await fetch(`${apiRoutes.courseRoute}${courseId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        const data = await res.json();
        if (res.ok && data?.data) {
          const { name, code, description, prerequisites, courseCredits, courseDuration, pathway, weekdayBatch, weekendBatch } = data.data;
          setInitialValues({
            name,
            code,
            description,
            prerequisites,
            courseCredits,
            courseDuration,
            pathway: pathway || '',
            weekdayBatch,
            weekendBatch
          });
        } else {
          showErrorSwal('Failed to load course');
        }
      } catch (error) {
        console.error(error);
        showErrorSwal('Error loading course');
      }
    };

    if (courseId) fetchCourse();
  }, [courseId, user.token, showErrorSwal]);

  const fetchBatchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const courseFilter = courseId;
      if (courseFilter) params.append('courseId', courseFilter);

      const response = await fetch(`${apiRoutes.batchRoute}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch batches');

      const result = await response.json();

      setBatchData(result.data || []);
      setTotalRows(result.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [courseId, user.token]);

  useEffect(() => {
    fetchBatchData();
  }, [fetchBatchData]);

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const response = await fetch(`${apiRoutes.courseRoute}${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(values)
      });

      const responseData = await response.json();

      if (!response.ok) {
        showErrorSwal(responseData.message || 'Update failed');
        return;
      }

      showSuccessSwal(responseData.message || 'Course updated');
    } catch (error) {
      console.error(error);
      showErrorSwal('Unexpected error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBatch = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`${apiRoutes.batchRoute}${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        const data = await response.json();

        if (response.ok) {
          // Remove from UI
          setBatchData((prev) => prev.filter((batch) => batch._id !== id));
          showSuccessSwal('Batch has been deleted successfully');
        } else {
          showErrorSwal(data.message || 'Failed to delete batch');
        }
      } catch (error) {
        console.error(error);
        showErrorSwal('Something went wrong');
      }
    }
  };

  if (!initialValues) return <LinearProgress />;

  return (
    <>
      <MainCard title="Update Course">
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
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label="Course Code"
                      variant="outlined"
                      name="code"
                      disabled
                      fullWidth
                      error={touched.code && !!errors.code}
                      helperText={<ErrorMessage name="code" />}
                      InputProps={{
                        sx: { px: 2, py: 1 } // Padding added
                      }}
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="pathway">
                      {({ field, form }) => (
                        <FormControl fullWidth error={form.touched.pathway && !!form.errors.pathway} sx={{ mb: 3 }}>
                          <InputLabel>Pathway</InputLabel>
                          <Select {...field} label="Pathway" displayEmpty>
                            <MenuItem value="" disabled>
                              Select Pathway
                            </MenuItem>
                            {PATHWAY_LIST.map((p) => (
                              <MenuItem key={p.id} value={p.id}>
                                {p.label}
                              </MenuItem>
                            ))}
                          </Select>
                          {form.touched.pathway && form.errors.pathway && (
                            <Box sx={{ color: '#d32f2f', fontSize: '0.75rem', mt: 0.5 }}>{form.errors.pathway}</Box>
                          )}
                        </FormControl>
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label="Description"
                      variant="outlined"
                      name="description"
                      fullWidth
                      error={touched.description && !!errors.description}
                      helperText={<ErrorMessage name="description" />}
                      InputProps={{
                        sx: { px: 2, py: 1 } // Padding added
                      }}
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label="Prerequisites"
                      variant="outlined"
                      name="prerequisites"
                      fullWidth
                      error={touched.prerequisites && !!errors.prerequisites}
                      helperText={<ErrorMessage name="prerequisites" />}
                      InputProps={{
                        sx: { px: 2, py: 1 }
                      }}
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label="Course Credits"
                      variant="outlined"
                      type="number"
                      name="courseCredits"
                      fullWidth
                      error={touched.courseCredits && !!errors.courseCredits}
                      helperText={<ErrorMessage name="courseCredits" />}
                      InputProps={{
                        sx: { px: 2, py: 1 }
                      }}
                      sx={{ mb: 3 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="courseDuration">
                      {({ field, form }) => (
                        <Select
                          {...field}
                          displayEmpty
                          variant="outlined"
                          fullWidth
                          error={form.touched.courseDuration && !!form.errors.courseDuration}
                          sx={{ mb: 3, minHeight: '3.5rem' }}
                        >
                          <MenuItem value="" disabled>
                            Course Duration
                          </MenuItem>
                          <MenuItem value="6 months">6 Months</MenuItem>
                          <MenuItem value="9 months">9 Months</MenuItem>
                          <MenuItem value="12 months">12 Months</MenuItem>
                          <MenuItem value="15 months">15 Months</MenuItem>
                          <MenuItem value="18 months">18 Months</MenuItem>
                          <MenuItem value="24 months">24 Months</MenuItem>
                        </Select>
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="weekdayBatch">
                      {({ field, form }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                              onChange={(e) => form.setFieldValue('weekdayBatch', e.target.checked)}
                            />
                          }
                          label="Weekday Batch Available"
                          sx={{ mb: 3 }}
                        />
                      )}
                    </Field>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field name="weekendBatch">
                      {({ field, form }) => (
                        <FormControlLabel
                          control={
                            <Checkbox
                              {...field}
                              checked={field.value}
                              onChange={(e) => form.setFieldValue('weekendBatch', e.target.checked)}
                            />
                          }
                          label="Weekend Batch Available"
                          sx={{ mb: 3 }}
                        />
                      )}
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
                    Update Course
                  </Button>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </MainCard>

      {loading ? (
        <LinearProgress />
      ) : (
        <MainCard title="Intake List" sx={{ marginTop: 5 }}>
          <Grid container direction="column" justifyContent="center">
            <Grid container sx={{ p: 3 }} spacing={2} direction="column">
              {/* Hardcoded list of batches */}
              {batchData.map((batch, index) => (
                <Grid item key={index}>
                  <Box
                    width={{ xs: '100%', sm: '100%', md: '40%' }}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    border={1}
                    borderColor="grey.300"
                    borderRadius={2}
                    p={2}
                    sx={{ backgroundColor: 'grey.50' }}
                  >
                    <Typography>{batch.name}</Typography>
                    <Button onClick={() => handleDeleteBatch(batch._id)} variant="outlined" color="error" size="small">
                      Delete
                    </Button>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </MainCard>
      )}
    </>
  );
};

export default UpdateCourseForm;
