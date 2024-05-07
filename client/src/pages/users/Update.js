import React, { useState, useEffect } from 'react';
import { TextField, Button, Grid, Divider, LinearProgress } from '@mui/material';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import { useLocation } from 'react-router-dom';

const UpdateForm = () => {
  const [data, setData] = useState(null);
  const location = useLocation();

  useEffect(() => {
    // Function to extract id from URL params and fetch course data
    const fetchdata = async () => {
      const searchParams = new URLSearchParams(location.search);
      const id = searchParams.get('id');
      // Fetch course data based on the id
      try {
        if (id) {
          console.log('id:', id);
          const fetchedData = {
            name: 'John Doe',
            age: 20,
            grade: 'A'
          };
          setData(fetchedData);
        }
      } catch (error) {
        console.error('Error fetching course data:', error);
      }
    };

    fetchdata();
  }, [location.search]);

  const initialValues = {
    name: data ? data.name : '',
    age: data ? data.age : '',
    grade: data ? data.grade : ''
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    age: Yup.number().positive().integer().required('Age is required'),
    grade: Yup.string().required('Grade is required')
  });

  const handleSubmit = (values) => {
    // Handle form submission, you can update the course data here
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
    <MainCard title="Update Course">
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
        {({ errors, touched }) => (
          <Form>
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
                    sx={{ mb: 3 }} // Margin bottom added
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Age"
                    variant="outlined"
                    type="number"
                    name="age"
                    fullWidth
                    error={touched.age && !!errors.age}
                    helperText={<ErrorMessage name="age" />}
                    InputProps={{
                      sx: { px: 2, py: 1 } // Padding added
                    }}
                    sx={{ mb: 3 }} // Margin bottom added
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Grade"
                    variant="outlined"
                    name="grade"
                    fullWidth
                    error={touched.grade && !!errors.grade}
                    helperText={<ErrorMessage name="grade" />}
                    InputProps={{
                      sx: { px: 2, py: 1 } // Padding added
                    }}
                    sx={{ mb: 3 }} // Margin bottom added
                  />
                </Grid>
              </Grid>
              <Divider sx={{ mt: 3, mb: 2 }} />
              <Grid item xs={12} sm={6} style={{ textAlign: 'right' }}>
                <Button type="submit" variant="contained" color="primary" size="small">
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

export default UpdateForm;
