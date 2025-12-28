import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Divider, CircularProgress, Select, MenuItem, Box, Typography, LinearProgress } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuthContext } from 'context/useAuthContext';
import { useNavigate } from 'react-router-dom';
import { classroomAPI } from 'api/classrooms';
import { coursesAPI } from 'api/courses';
import { batchesAPI } from 'api/batches';
import { modulesAPI } from 'api/modules';

const AddForm = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [modules, setModules] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [classroomName, setClassroomName] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const Toast = withReactContent(
    Swal.mixin({
      toast: true,
      position: 'bottom',
      showConfirmButton: false,
      timer: 3000
    })
  );

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const res = await coursesAPI.getAll();
        setCourses(res || []);
      } catch {
        console.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };
    loadCourses();
  }, []);

  /* ---------- Helpers ---------- */

  const generateClassroomName = (course, batch, month) => {
    if (!course || !batch || !month) return '';
    return `${course.code}-${batch.name}-${month}`;
  };

  const handleCourseChange = async (courseId, setFieldValue) => {
    setFieldValue('courseId', courseId);
    setFieldValue('batchId', '');
    setFieldValue('month', '');
    setClassroomName('');

    const course = courses.find((c) => c._id === courseId);
    setSelectedCourse(course);

    const batchRes = await batchesAPI.getAll({ courseId });
    const batchList = Array.isArray(batchRes) ? batchRes : batchRes?.data || [];
    setBatches(batchList);

    const moduleRes = await modulesAPI.getAll({ courseId });
    const moduleList = Array.isArray(moduleRes) ? moduleRes : moduleRes?.data || [];
    setModules(moduleList);
  };

  const handleBatchChange = (batchId, values, setFieldValue) => {
    setFieldValue('batchId', batchId);

    const batch = batches.find((b) => b._id === batchId);
    setClassroomName(generateClassroomName(selectedCourse, batch, values.month));
  };

  const handleMonthChange = (month, values, setFieldValue) => {
    setFieldValue('month', month);

    const batch = batches.find((b) => b._id === values.batchId);
    setClassroomName(generateClassroomName(selectedCourse, batch, month));
  };

  /* ---------- Form ---------- */

  const initialValues = {
    courseId: '',
    batchId: '',
    moduleId: '',
    month: '',
    capacity: 50,
    description: ''
  };

  const validationSchema = Yup.object({
    courseId: Yup.string().required('Course required'),
    batchId: Yup.string().required('Intake required'),
    moduleId: Yup.string().required('Module required'),
    month: Yup.string().required('Month required'),
    capacity: Yup.number().min(1).required()
  });

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      const payload = {
        ...values,
        name: classroomName,
        createdBy: user?.id // ✅ using user
      };

      await classroomAPI.create(payload);

      Toast.fire({ icon: 'success', title: 'Classroom created successfully' });
      navigate('/app/classrooms');
    } catch {
      Toast.fire({ icon: 'error', title: 'Failed to create classroom' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LinearProgress />;

  return (
    <MainCard title="Add Classroom">
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ values, setFieldValue }) => (
          <Form>
            <Grid container spacing={2}>
              {/* COURSE */}
              <Grid item xs={12} sm={6}>
                <Field name="courseId">
                  {({ field }) => (
                    <Select
                      {...field}
                      fullWidth
                      displayEmpty
                      onChange={(e) => handleCourseChange(e.target.value, setFieldValue)}
                      sx={{ mb: 3, minHeight: '3.5rem' }}
                    >
                      <MenuItem value="" disabled>
                        Select Course
                      </MenuItem>
                      {courses.map((c) => (
                        <MenuItem key={c._id} value={c._id}>
                          {c.name} ({c.code})
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </Field>
                <ErrorMessage name="courseId" component="div" style={{ color: 'red' }} />
              </Grid>

              {/* INTAKE */}
              <Grid item xs={12} sm={6}>
                <Field name="batchId">
                  {({ field }) => (
                    <Select
                      sx={{ mb: 3, minHeight: '3.5rem' }}
                      {...field}
                      fullWidth
                      displayEmpty
                      onChange={(e) => handleBatchChange(e.target.value, values, setFieldValue)}
                    >
                      <MenuItem value="" disabled>
                        Select Intake
                      </MenuItem>
                      {batches.map((b) => (
                        <MenuItem key={b._id} value={b._id}>
                          {b.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </Field>
                <ErrorMessage name="batchId" component="div" style={{ color: 'red' }} />
              </Grid>

              {/* MODULE */}
              <Grid item xs={12} sm={6}>
                <Field name="moduleId">
                  {({ field }) => (
                    <Select sx={{ mb: 3, minHeight: '3.5rem' }} {...field} fullWidth displayEmpty>
                      <MenuItem value="">Select Module</MenuItem>
                      {modules.map((m) => (
                        <MenuItem key={m._id} value={m._id}>
                          {m.name}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </Field>
                <ErrorMessage name="moduleId" component="div" style={{ color: 'red' }} />
              </Grid>

              {/* MONTH */}
              <Grid item xs={12} sm={6}>
                <Field name="month">
                  {({ field }) => (
                    <Select
                      sx={{ mb: 3, minHeight: '3.5rem' }}
                      {...field}
                      fullWidth
                      displayEmpty
                      onChange={(e) => handleMonthChange(e.target.value, values, setFieldValue)}
                    >
                      <MenuItem value="" disabled>
                        Select Month
                      </MenuItem>
                      {[
                        'January',
                        'February',
                        'March',
                        'April',
                        'May',
                        'June',
                        'July',
                        'August',
                        'September',
                        'October',
                        'November',
                        'December'
                      ].map((m) => (
                        <MenuItem key={m} value={m}>
                          {m}
                        </MenuItem>
                      ))}
                    </Select>
                  )}
                </Field>
                <ErrorMessage name="month" component="div" style={{ color: 'red' }} />
              </Grid>

              {/* Capacity */}
              <Grid item xs={12} sm={6}>
                <Field
                  rows={3}
                  sx={{ mb: 3, minHeight: '3.5rem' }}
                  as={TextField}
                  name="capacity"
                  label="Capacity"
                  type="number"
                  fullWidth
                  InputProps={{
                    sx: { px: 2, py: 1 }
                  }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <Field
                  sx={{ mb: 3, minHeight: '3.5rem' }}
                  as={TextField}
                  name="description"
                  label="Description"
                  fullWidth
                  multiline
                  rows={3}
                />
              </Grid>

              <Divider sx={{ my: 2, width: '100%' }} />

              {/* Preview */}
              {classroomName && (
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: 'info.lighter', borderRadius: 1 }}>
                    <Typography variant="subtitle2">Classroom Name</Typography>
                    <Typography variant="h6">{classroomName}</Typography>
                  </Box>
                </Grid>
              )}

              {/* Submit */}
              <Grid item xs={12} textAlign="right">
                <Button
                  type="submit"
                  variant="contained"
                  disabled={!classroomName || submitting}
                  endIcon={submitting && <CircularProgress size={20} />}
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
