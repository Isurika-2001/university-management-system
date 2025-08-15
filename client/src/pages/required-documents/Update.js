import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Skeleton
} from '@mui/material';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { requiredDocumentsAPI } from '../../api/requiredDocuments';

const UpdateRequiredDocument = () => {
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [documentData, setDocumentData] = useState(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const documentId = searchParams.get('id');

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
    type: Yup.string()
      .required('Document type is required'),
    isRequired: Yup.boolean()
      .required('Required status is required'),
    maxFileSize: Yup.number()
      .required('Maximum file size is required')
      .min(1, 'Maximum file size must be at least 1 MB')
      .max(50, 'Maximum file size must be less than 50 MB'),
    allowedExtensions: Yup.string()
      .required('Allowed file extensions are required')
      .matches(/^[a-zA-Z0-9,\s]+$/, 'Only letters, numbers, commas, and spaces are allowed')
  });

  // Fetch document data
  useEffect(() => {
    if (!documentId) {
      setError('Document ID is required');
      setLoading(false);
      return;
    }

    const fetchDocument = async () => {
      try {
        const result = await requiredDocumentsAPI.getById(documentId);
        setDocumentData(result.data);
      } catch (err) {
        console.error('Error fetching document:', err);
        setError('Failed to load document data');
        showErrorSwal('Failed to load document data');
      } finally {
        setLoading(false);
      }
    };

         fetchDocument();
   }, [documentId]);

  const formik = useFormik({
    initialValues: {
      name: '',
      description: '',
      type: '',
      isRequired: true,
      maxFileSize: 5,
      allowedExtensions: 'pdf,doc,docx,jpg,jpeg,png'
    },
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values) => {
      setSubmitting(true);
      setError('');

             try {
         await requiredDocumentsAPI.update(documentId, {
           ...values,
           allowedExtensions: values.allowedExtensions.split(',').map(ext => ext.trim())
         });

         showSuccessSwal('Required document updated successfully!');
         navigate('/app/required-documents');
       } catch (err) {
        console.error('Error updating required document:', err);
        setError(err.message || 'Network error. Please try again.');
        showErrorSwal(err.message || 'Network error. Please try again.');
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Update form values when document data is loaded
  useEffect(() => {
    if (documentData) {
      formik.setValues({
        name: documentData.name || '',
        description: documentData.description || '',
        type: documentData.type || '',
        isRequired: documentData.isRequired !== undefined ? documentData.isRequired : true,
        maxFileSize: documentData.maxFileSize || 5,
        allowedExtensions: Array.isArray(documentData.allowedExtensions) 
          ? documentData.allowedExtensions.join(', ') 
          : documentData.allowedExtensions || 'pdf,doc,docx,jpg,jpeg,png'
      });
    }
  }, [documentData]);

  const handleCancel = () => {
    navigate('/app/required-documents');
  };

  if (loading) {
    return (
      <MainCard title="Update Required Document">
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" height={120} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
            <Grid item xs={12} md={6}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
            <Grid item xs={12}>
              <Skeleton variant="rectangular" height={56} />
            </Grid>
          </Grid>
        </Box>
      </MainCard>
    );
  }

  if (!documentId) {
    return (
      <MainCard title="Update Required Document">
        <Box sx={{ p: 3 }}>
          <Alert severity="error">
            Document ID is required. Please go back and select a document to edit.
          </Alert>
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={handleCancel}>
              Back to Documents
            </Button>
          </Box>
        </Box>
      </MainCard>
    );
  }

  return (
    <MainCard title="Update Required Document">
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
                  <MenuItem value="personal">Personal</MenuItem>
                  <MenuItem value="financial">Financial</MenuItem>
                  <MenuItem value="medical">Medical</MenuItem>
                  <MenuItem value="legal">Legal</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
                {formik.touched.type && formik.errors.type && (
                  <FormHelperText>{formik.errors.type}</FormHelperText>
                )}
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
                {formik.touched.isRequired && formik.errors.isRequired && (
                  <FormHelperText>{formik.errors.isRequired}</FormHelperText>
                )}
              </FormControl>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                id="maxFileSize"
                name="maxFileSize"
                label="Maximum File Size (MB)"
                type="number"
                value={formik.values.maxFileSize}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.maxFileSize && Boolean(formik.errors.maxFileSize)}
                helperText={formik.touched.maxFileSize && formik.errors.maxFileSize}
                disabled={submitting}
                inputProps={{ min: 1, max: 50 }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                id="allowedExtensions"
                name="allowedExtensions"
                label="Allowed File Extensions"
                value={formik.values.allowedExtensions}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.allowedExtensions && Boolean(formik.errors.allowedExtensions)}
                helperText={
                  (formik.touched.allowedExtensions && formik.errors.allowedExtensions) ||
                  "Enter file extensions separated by commas (e.g., pdf,doc,docx,jpg,jpeg,png)"
                }
                disabled={submitting}
              />
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                <Button
                  variant="outlined"
                  onClick={handleCancel}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting || !formik.isValid}
                  startIcon={submitting ? <CircularProgress size={20} /> : null}
                >
                  {submitting ? 'Updating...' : 'Update Required Document'}
                </Button>
              </Box>
            </Grid>
          </Grid>
        </form>
      </Box>
    </MainCard>
  );
};

export default UpdateRequiredDocument;
