import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Divider, CircularProgress, Select, MenuItem, Box, Typography, LinearProgress } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import { apiRoutes } from 'config';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuthContext } from 'context/useAuthContext';
import { useNavigate } from 'react-router-dom';
import { classroomAPI } from 'api/classrooms';
import { coursesAPI } from 'api/courses';
import { batchesAPI } from 'api/batches';

const AddForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [classroomName, setClassroomName] = useState('');
  const [coursesLoading, setCoursesLoading] = useState(true);

  const Toast = withReactContent(
    Swal.mixin({
      toast: true,
      position: 'bottom',
      customClass: { popup: 'colored-toast' },
      background: 'primary',
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true
    })
  );

  const showSuccessSwal = (msg) => {
    Toast.fire({ icon: 'success', title: msg });
  };

  const showErrorSwal = (msg) => {
    Toast.fire({ icon: 'error', title: msg });
  };

  useEffect(() => {
    fetchCourses();
    fetchModules();
  }, []);

  const fetchCourses = async () => {
    try {
      const data = await coursesAPI.getAll();
      setCourses(data || []);
      setCoursesLoading(false);
    } catch (error) {
      console.error(error);
      showErrorSwal('Error loading courses');
      setCoursesLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const response = await fetch(`${apiRoutes.modulesRoute}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      const data = await response.json();
      if (data?.data) setModules(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleCourseChange = async (courseId, setFieldValue) => {
    setFieldValue('courseId', courseId);
    setFieldValue('batchId', '');
    setFieldValue('moduleId', '');
    setClassroomName('');

    const course = courses.find((c) => c._id === courseId);
    setSelectedCourse(course);

    if (courseId) {
      try {
        const response = await batchesAPI.getAll({ courseId });
        const batchData = Array.isArray(response) ? response : response?.data || [];
        setBatches(batchData);
      } catch (error) {
        console.error(error);
        showErrorSwal('Error loading intakes');
      }
    } else {
      setBatches([]);
    }
  };

  const handleMonthChange = (month, courseCode, setFieldValue) => {
    setFieldValue('month', month);
    if (courseCode && month) {
      const generated = `${courseCode}-${month}`;
      setClassroomName(generated);
    } else {
      setClassroomName('');
    }
  };

  const initialValues = {
    courseId: '',
    batchId: '',
    moduleId: '',
    month: '',
    capacity: 50,
    description: ''
  };

  const validationSchema = Yup.object().shape({
    courseId: Yup.string().required('Course is required'),
    batchId: Yup.string().required('Intake is required'),
    moduleId: Yup.string().required('Module is required'),
    month: Yup.string().required('Month is required'),
    capacity: Yup.number().min(1, 'Capacity must be at least 1'),
    description: Yup.string()
  });

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      const payload = {
        name: classroomName,
        courseId: values.courseId,
        batchId: values.batchId,
        moduleId: values.moduleId,
        month: values.month,
        capacity: values.capacity,
        description: values.description
      };

      const response = await classroomAPI.create(payload);

      if (response?.success) {
        showSuccessSwal('Classroom created successfully');
        navigate('/app/classrooms');
      } else {
        showErrorSwal(response?.message || 'Failed to create classroom');
      }
    } catch (error) {
      console.error(error);
      showErrorSwal(error.message || 'Error creating classroom');
    } finally {
      setSubmitting(false);
    }
  };

  if (coursesLoading) return <LinearProgress />;

  return (
    <MainCard title="Add New Classroom">
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ errors, handleSubmit, touched, setFieldValue, values }) => (
          <Form onSubmit={handleSubmit}>
            <Grid container direction="column" justifyContent="center">
              <Grid container sx={{ p: 3 }} spacing={2}>
                {/* Course Selection */}
                <Grid item xs={12} sm={6}>
                  <Field name="courseId">
                    {({ field, form }) => (
                      <Select
                        {...field}
                        displayEmpty
                        variant="outlined"
                        fullWidth
                        error={form.touched.courseId && !!form.errors.courseId}
                        onChange={(e) => handleCourseChange(e.target.value, setFieldValue)}
                        sx={{ mb: 3, minHeight: '3.5rem' }}
                      >
                        <MenuItem value="" disabled>
                          Select Course
                        </MenuItem>
                        {courses.map((course) => (
                          <MenuItem key={course._id} value={course._id}>
                            {course.name} ({course.code})
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </Field>
                  {touched.courseId && errors.courseId && (
                    <Typography color="error" variant="caption">
                      {errors.courseId}
                    </Typography>
                  )}
                </Grid>

                {/* Intake/Batch Selection */}
                <Grid item xs={12} sm={6}>
                  <Field name="batchId">
                    {({ field, form }) => (
                      <Select
                        {...field}
                        displayEmpty
                        variant="outlined"
                        fullWidth
                        disabled={!values.courseId}
                        error={form.touched.batchId && !!form.errors.batchId}
                        onChange={(e) => form.setFieldValue('batchId', e.target.value)}
                        sx={{ mb: 3, minHeight: '3.5rem' }}
                      >
                        <MenuItem value="" disabled>
                          {values.courseId ? 'Select Intake' : 'Select Course First'}
                        </MenuItem>
                        {batches.map((batch) => (
                          <MenuItem key={batch._id} value={batch._id}>
                            {batch.name}
                          </MenuItem>
                        ))}
                      </Select>
                    )}
                  </Field>
                  {touched.batchId && errors.batchId && (
                    <Typography color="error" variant="caption">
                      {errors.batchId}
                    </Typography>
                  )}
                </Grid>

                {/* Module Selection */}
                <Grid item xs={12} sm={6}>
                  <Field name="moduleId">
                    {({ field, form }) => {
                      // Filter to get the pathway object matching the selected course
                      const selectedPathwayObj = selectedCourse ? modules.find((mod) => mod.pathway === selectedCourse.pathway) : null;

                      // Get individual module names from the selected pathway
                      const moduleOptions = selectedPathwayObj?.modules || [];

                      return (
                        <>
                          <Select
                            {...field}
                            displayEmpty
                            variant="outlined"
                            fullWidth
                            disabled={!values.courseId}
                            error={form.touched.moduleId && !!form.errors.moduleId}
                            onChange={(e) => form.setFieldValue('moduleId', e.target.value)}
                            sx={{ mb: 3, minHeight: '3.5rem' }}
                          >
                            <MenuItem value="">{values.courseId ? 'Select Module *' : 'Select Course First'}</MenuItem>
                            {moduleOptions.length > 0 ? (
                              moduleOptions.map((moduleName, idx) => (
                                <MenuItem key={idx} value={moduleName}>
                                  {moduleName}
                                </MenuItem>
                              ))
                            ) : (
                              <MenuItem disabled>No modules available for this pathway</MenuItem>
                            )}
                          </Select>
                          {form.touched.moduleId && form.errors.moduleId && (
                            <Typography color="error" variant="caption">
                              {form.errors.moduleId}
                            </Typography>
                          )}
                        </>
                      );
                    }}
                  </Field>
                </Grid>

                {/* Month Selection */}
                <Grid item xs={12} sm={6}>
                  <Field name="month">
                    {({ field, form }) => (
                      <Select
                        {...field}
                        displayEmpty
                        variant="outlined"
                        fullWidth
                        disabled={!values.courseId}
                        error={form.touched.month && !!form.errors.month}
                        onChange={(e) => handleMonthChange(e.target.value, selectedCourse?.code, setFieldValue)}
                        sx={{ mb: 3, minHeight: '3.5rem' }}
                      >
                        <MenuItem value="" disabled>
                          {values.courseId ? 'Select Month' : 'Select Course First'}
                        </MenuItem>
                        <MenuItem value="January">January</MenuItem>
                        <MenuItem value="February">February</MenuItem>
                        <MenuItem value="March">March</MenuItem>
                        <MenuItem value="April">April</MenuItem>
                        <MenuItem value="May">May</MenuItem>
                        <MenuItem value="June">June</MenuItem>
                        <MenuItem value="July">July</MenuItem>
                        <MenuItem value="August">August</MenuItem>
                        <MenuItem value="September">September</MenuItem>
                        <MenuItem value="October">October</MenuItem>
                        <MenuItem value="November">November</MenuItem>
                        <MenuItem value="December">December</MenuItem>
                      </Select>
                    )}
                  </Field>
                  {touched.month && errors.month && (
                    <Typography color="error" variant="caption">
                      {errors.month}
                    </Typography>
                  )}
                </Grid>

                {/* Capacity */}
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Capacity"
                    variant="outlined"
                    type="number"
                    name="capacity"
                    fullWidth
                    disabled={!values.courseId}
                    error={touched.capacity && !!errors.capacity}
                    helperText={<ErrorMessage name="capacity" />}
                    InputProps={{ sx: { px: 2, py: 1 } }}
                    sx={{ mb: 3 }}
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    label="Description (Optional)"
                    variant="outlined"
                    name="description"
                    fullWidth
                    multiline
                    rows={3}
                    disabled={!values.courseId}
                    InputProps={{ sx: { px: 2, py: 1 } }}
                    sx={{ mb: 3 }}
                  />
                </Grid>

                {/* Classroom Name Preview */}
                {classroomName && (
                  <Grid item xs={12}>
                    <Box sx={{ p: 2, backgroundColor: 'info.lighter', borderRadius: 1, mb: 2 }}>
                      <Typography variant="subtitle2">Classroom Name:</Typography>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 1 }}>
                        {classroomName}
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>

              <Divider sx={{ mt: 3, mb: 2 }} />

              <Grid item xs={12} sm={6} style={{ textAlign: 'right' }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="small"
                  disabled={submitting || !classroomName}
                  endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  Create Classroom
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
