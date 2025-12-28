import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { requiredDocumentsAPI } from '../../api/requiredDocuments';

const AddRequiredDocument = () => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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

  const showSuccessSwal = (message) => {
    Toast.fire({
      icon: 'success',
      title: message
    });
  };

  const showErrorSwal = (message) => {
    Toast.fire({
      icon: 'error',
      title: message
    });
  };

  // Validation schema
  const validationSchema = Yup.object({
    name: Yup.string()
      .required('Document name is required')
      .min(2, 'Document name must be at least 2 characters')
      .max(100, 'Document name must be less than 100 characters'),
    description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must be less than 500 characters'),
    type: Yup.string().required('Document type is required'),
    isRequired: Yup.boolean().required('Required status is required')
  });

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      type: '',
      isRequired: true
    },
    validationSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      setError('');

      try {
        await requiredDocumentsAPI.create(values);

        showSuccessSwal('Required document created successfully!');
        navigate('/app/required-documents');
      } catch (err) {
        console.error('Error creating required document:', err);
        setError(err.message || 'Network error. Please try again.');
        showErrorSwal(err.message || 'Network error. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleCancel = () => {
    navigate('/app/required-documents');
  };

  return (
    <MainCard title="Add Required Document">
      <Box sx={{ p: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="name"
                name="name"
                label="Document Name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={formik.touched.type && Boolean(formik.errors.type)}>
                <InputLabel id="type-label">Document Type</InputLabel>
                <Select
                  labelId="type-label"
                  id="type"
                  name="type"
                  value={formik.values.type}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={submitting}
                  label="Document Type"
                >
                  <MenuItem value="academic">Academic</MenuItem>
                  <MenuItem value="identity">Identity</MenuItem>
                  <MenuItem value="financial">Financial</MenuItem>
                  <MenuItem value="medical">Medical</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {formik.touched.type && formik.errors.type && <FormHelperText>{formik.errors.type}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="description"
                name="description"
                label="Description"
                multiline
                rows={4}
                value={formik.values.description}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={formik.touched.isRequired && Boolean(formik.errors.isRequired)}>
                <InputLabel id="isRequired-label">Required Status</InputLabel>
                <Select
                  labelId="isRequired-label"
                  id="isRequired"
                  name="isRequired"
                  value={formik.values.isRequired}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={submitting}
                  label="Required Status"
                >
                  <MenuItem value={true}>Required</MenuItem>
                  <MenuItem value={false}>Optional</MenuItem>
                </Select>
                {formik.touched.isRequired && formik.errors.isRequired && <FormHelperText>{formik.errors.isRequired}</FormHelperText>}
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button variant="outlined" onClick={handleCancel} disabled={submitting}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting || !formik.isValid}
                  startIcon={submitting ? <CircularProgress size={20} /> : null}
                >
                  {submitting ? 'Creating...' : 'Create Required Document'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </MainCard>
  );
};

export default AddRequiredDocument;
