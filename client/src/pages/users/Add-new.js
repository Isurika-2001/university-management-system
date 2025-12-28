import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Button,
  Grid,
  Divider,
  CircularProgress,
  MenuItem,
  Switch,
  FormControlLabel,
  Box,
  Tooltip,
  IconButton,
  InputAdornment
} from '@mui/material';
import { EyeOutlined, EyeInvisibleOutlined, DownloadOutlined } from '@ant-design/icons';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useNavigate } from 'react-router-dom';
import { formatUserTypes } from '../../utils/userTypeUtils';
import { usersAPI } from '../../api/users';

const AddForm = () => {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [userTypes, setUserTypes] = useState([]);
  const [suggestPassword, setSuggestPassword] = useState(false); // State to toggle password suggestion
  const [generatedPasswordDisplay, setGeneratedPasswordDisplay] = useState(''); // State to store generated password
  const [showPassword, setShowPassword] = useState(false); // State for password visibility

  const formikRef = useRef();

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

  useEffect(() => {
    fetchUserTypes();
  }, []);

  const initialValues = {
    name: '',
    email: '',
    password: '', // Initialize password as empty
    user_type: ''
  };

  const validationSchema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().when('suggestPassword', {
      is: false, // Only validate if suggestPassword is false
      then: (schema) => schema.required('Password is required'),
      otherwise: (schema) => schema.notRequired()
    }),
    user_type: Yup.string().required('User Type is required')
  });

  async function fetchUserTypes() {
    try {
      const response = await usersAPI.getUserTypes();
      console.log('User types response:', response);

      const userTypes = response.data || response;
      setUserTypes(formatUserTypes(userTypes));
    } catch (error) {
      console.error('Error fetching user types:', error);
      showErrorSwal(error.message || 'Failed to fetch user types');
    }
  }

  const handleDownload = (email, password) => {
    const content = `Email: ${email}\nPassword: ${password}`;
    const filename = `${email}_credentials.txt`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showSuccessSwal('Credentials downloaded successfully!');
  };

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setSubmitting(true);
      const dataToSend = { ...values };

      // If suggestPassword is true, remove password from dataToSend so backend generates it
      if (suggestPassword) {
        delete dataToSend.password;
      }

      const response = await usersAPI.create(dataToSend);
      console.log('Create user response:', response);

      if (response.data && response.data.generatedPassword) {
        setGeneratedPasswordDisplay(response.data.generatedPassword);
        showSuccessSwal('User added successfully! Generated password displayed and downloaded.');
        handleDownload(values.email, response.data.generatedPassword); // Automatically download
        resetForm({ values: { ...initialValues, password: '' } });
      } else {
        showSuccessSwal(response.message || 'User added successfully');
        // If password was manually entered, download it
        if (!suggestPassword && values.password) {
          handleDownload(values.email, values.password);
        }
        resetForm();
        setGeneratedPasswordDisplay(''); // Clear any previous generated password
      }

      setTimeout(() => {
        navigate('/app/users');
      }, 1500);
    } catch (error) {
      console.error('Error creating user:', error);
      showErrorSwal(error.message || 'Failed to add user');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainCard title="Add New User">
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit} innerRef={formikRef}>
        {({ errors, handleSubmit, touched, values, setFieldValue }) => (
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
                      sx: { px: 2, py: 1 }
                    }}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Email"
                    variant="outlined"
                    type="text"
                    name="email"
                    fullWidth
                    error={touched.email && !!errors.email}
                    helperText={<ErrorMessage name="email" />}
                    InputProps={{
                      sx: { px: 2, py: 1 }
                    }}
                    sx={{ mb: 3 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={suggestPassword}
                        onChange={(event) => {
                          setSuggestPassword(event.target.checked);
                          setFieldValue('password', ''); // Clear password field when toggling
                          setGeneratedPasswordDisplay(''); // Clear generated password display
                        }}
                        name="suggestPassword"
                        color="primary"
                      />
                    }
                    label="Suggest Password"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  {suggestPassword ? (
                    generatedPasswordDisplay ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                        <TextField
                          label="Generated Password"
                          variant="outlined"
                          fullWidth
                          value={generatedPasswordDisplay}
                          InputProps={{
                            readOnly: true,
                            sx: { px: 2, py: 1 },
                            endAdornment: (
                              <InputAdornment position="end">
                                <Tooltip title="Download Credentials">
                                  <IconButton onClick={() => handleDownload(values.email, generatedPasswordDisplay)} edge="end">
                                    <DownloadOutlined />
                                  </IconButton>
                                </Tooltip>
                              </InputAdornment>
                            )
                          }}
                        />
                      </Box>
                    ) : (
                      <TextField
                        label="Generated Password"
                        variant="outlined"
                        fullWidth
                        value="Password will be generated by the system"
                        disabled
                        InputProps={{
                          sx: { px: 2, py: 1 }
                        }}
                        sx={{ mb: 3 }}
                      />
                    )
                  ) : (
                    <Field
                      as={TextField}
                      label="Password"
                      variant="outlined"
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      fullWidth
                      error={touched.password && !!errors.password}
                      helperText={<ErrorMessage name="password" />}
                      InputProps={{
                        sx: { px: 2, py: 1 },
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton aria-label="toggle password visibility" onClick={() => setShowPassword(!showPassword)} edge="end">
                              {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                            </IconButton>
                          </InputAdornment>
                        )
                      }}
                      sx={{ mb: 3 }}
                    />
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    select
                    label="User Type"
                    variant="outlined"
                    name="user_type"
                    fullWidth
                    error={touched.user_type && !!errors.user_type}
                    helperText={<ErrorMessage name="user_type" />}
                    InputProps={{
                      sx: { px: 2, py: 1 }
                    }}
                    sx={{ mb: 3 }}
                  >
                    {userTypes.map((option) => (
                      <MenuItem key={option._id} value={option._id}>
                        {option.displayName}
                      </MenuItem>
                    ))}
                  </Field>
                </Grid>
              </Grid>
              <Divider sx={{ mt: 3, mb: 2 }} />
              <Grid item xs={12} style={{ textAlign: 'right' }}>
                <Button variant="outlined" color="secondary" size="small" onClick={() => navigate('/app/users')} sx={{ mr: 2 }}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  size="small"
                  disabled={submitting}
                  endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : null}
                >
                  Add User
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
