import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Divider, CircularProgress } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import { apiRoutes } from 'config';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuthContext } from 'context/useAuthContext';
import { useLocation } from 'react-router-dom';

const UpdateCourseForm = () => {
  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState(null);
  const { user } = useAuthContext();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const courseId = queryParams.get('id');

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

  const showErrorSwal = (msg) => {
    Toast.fire({ icon: 'error', title: msg });
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    code: Yup.string()
      .required('Course code is required')
      .matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores'),
    description: Yup.string().required('Description is required')
  });

  // Fetch existing course data
  useEffect(() => {
    console.log('id', courseId);
    const fetchCourse = async () => {
      try {
        const res = await fetch(`${apiRoutes.courseRoute}/${courseId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });
        const data = await res.json();
        if (res.ok && data?.data) {
          const { name, code, description } = data.data;
          setInitialValues({ name, code, description });
        } else {
          showErrorSwal('Failed to load course');
        }
      } catch (error) {
        console.error(error);
        showErrorSwal('Error loading course');
      }
    };

    if (courseId) fetchCourse();
  }, [courseId, user.token]);

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const response = await fetch(`${apiRoutes.courseRoute}/${courseId}`, {
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

  if (!initialValues) return <CircularProgress />;

  return (
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
  );
};

export default UpdateCourseForm;
