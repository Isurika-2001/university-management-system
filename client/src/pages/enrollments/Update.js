import React, { useState, useEffect } from 'react';
import { Button, Grid, LinearProgress, CircularProgress, Typography, TextField } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Formik, Form } from 'formik';
import { FileAddOutlined, DeleteOutlined, SwapOutlined } from '@ant-design/icons';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import { useLocation } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { studentsAPI } from '../../api/students';
import { enrollmentsAPI } from '../../api/enrollments';
import { coursesAPI } from '../../api/courses';
import { batchesAPI } from '../../api/batches';

const UpdateForm = () => {
  const [data, setData] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const [open, setOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  
  // Transfer dialog state
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [transferData, setTransferData] = useState({
    batchId: '',
    reason: ''
  });


  const location = useLocation();

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
    fetchData();
    fetchCourses();
    fetchEnrollments();
  }, [location.search]);
  
  useEffect(() => {
    fetchBatches(selectedCourse);
  }, [selectedCourse]);

  async function fetchData() {
    setLoading(true);
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    console.log('Fetching student data for ID:', id);
    
    if (!id) {
      console.log('No student ID found in URL');
      setData(null);
      setLoading(false);
      return;
    }
    
    try {
      const response = await studentsAPI.getById(id);
      console.log('Student response:', response);
      setData(response.data || response);
    } catch (error) {
      console.error('Error fetching student:', error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEnrollments() {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    console.log('Fetching enrollments for student ID:', id);
    
    if (!id) {
      console.log('No student ID found in URL');
      setEnrollments([]);
      return;
    }
    
    try {
      setLoading(true);
      const response = await enrollmentsAPI.getByStudentId(id);
      console.log('Enrollments response:', response);
      setEnrollments(response.data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCourses() {
    try {
      const response = await coursesAPI.getAll();
      setCourseOptions(response.data || response || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourseOptions([]);
    }
  }

  async function fetchBatches(courseId) {
    if (!courseId) {
      setBatchOptions([]);
      return;
    }
    try {
      const response = await batchesAPI.getByCourseId(courseId);
      setBatchOptions(response.data || response || []);
    } catch (error) {
      console.error('Error fetching batches:', error);
      setBatchOptions([]);
    }
  }

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);
      const searchParams = new URLSearchParams(location.search);
      const id = searchParams.get('id');
      
      if (!id) {
        showErrorSwal('Student ID not found in URL');
        return;
      }
      
      console.log('Submitting enrollment data:', values);
      const responseData = await enrollmentsAPI.createForStudent(id, values);
      showSuccessSwal(responseData.message || 'Enrollment added successfully');
      setOpen(false);
      setSelectedCourse('');
      setSelectedBatch('');
      fetchEnrollments();
    } catch (error) {
      console.error('Enrollment creation error:', error);
      showErrorSwal(error.message || 'Failed to add enrollment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (enrollmentId) => {
    try {
      setSubmitting(true);
      console.log('Deleting enrollment:', enrollmentId);
      const responseData = await enrollmentsAPI.delete(enrollmentId);
      showSuccessSwal(responseData.message || 'Enrollment deleted successfully');
      fetchEnrollments();
    } catch (error) {
      console.error('Enrollment deletion error:', error);
      showErrorSwal(error.message || 'Failed to delete enrollment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTransfer = async (enrollment) => {
    setSelectedEnrollment(enrollment);
    setTransferData({
      batchId: '',
      reason: ''
    });
    setOpenTransferDialog(true);
    
    // Fetch batches for the enrollment's course
    if (enrollment.courseId) {
      await fetchBatches(enrollment.courseId);
    }
  };

  const handleTransferSubmit = async () => {
    try {
      setSubmitting(true);
      console.log('Submitting transfer data:', transferData);
      console.log('Selected enrollment:', selectedEnrollment);
      
      if (!transferData.batchId || !transferData.reason) {
        showErrorSwal('Please select a new batch and provide a transfer reason');
        return;
      }

      const responseData = await enrollmentsAPI.addBatchTransfer(selectedEnrollment._id, transferData);
      showSuccessSwal(responseData.message || 'Batch transfer completed successfully');
      closeTransferDialog();
      fetchEnrollments();
    } catch (error) {
      console.error('Transfer error:', error);
      showErrorSwal(error.message || 'Failed to complete batch transfer');
    } finally {
      setSubmitting(false);
    }
  };

  const closeTransferDialog = () => {
    setOpenTransferDialog(false);
    setSelectedEnrollment(null);
    setTransferData({ batchId: '', reason: '' });
  };

  const initialValues = {
    courseId: '',
    batchId: ''
  };

  const validationSchema = Yup.object().shape({
    courseId: Yup.string().required('Course is required'),
    batchId: Yup.string().required('Batch is required')
  });

  if (loading) {
    return (
      <MainCard title="Update Student Enrollments">
        <LinearProgress />
      </MainCard>
    );
  }

  return (
    <MainCard title="Update Student Enrollments">
      {!data ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="textSecondary">
            No student data found. Please check the URL parameters.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Box sx={{ mb: 3 }}>
              <h3>Student Information</h3>
              <p><strong>Name:</strong> {data.firstName} {data.lastName}</p>
              <p><strong>Email:</strong> {data.email}</p>
              <p><strong>Student ID:</strong> {data.registration_no || data.registrationNo || data._id}</p>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <h3>Current Enrollments</h3>
              <Button
                variant="contained"
                startIcon={<FileAddOutlined />}
                onClick={() => setOpen(true)}
              >
                Add New Enrollment
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Course</TableCell>
                    <TableCell>Batch</TableCell>
                    <TableCell>Enrollment Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enrollments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        No enrollments found for this student. Add a new enrollment to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    enrollments.map((enrollment, index) => (
                      <TableRow key={enrollment._id || index}>
                        <TableCell>{enrollment.course?.name || 'N/A'}</TableCell>
                        <TableCell>{enrollment.batch?.name || 'N/A'}</TableCell>
                        <TableCell>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</TableCell>
                                                 <TableCell>
                           <Box sx={{ display: 'flex', gap: 1 }}>
                             <Button
                               variant="outlined"
                               color="secondary"
                               size="small"
                               onClick={() => handleTransfer(enrollment)}
                               disabled={submitting}
                               startIcon={<SwapOutlined />}
                             >
                               Transfer
                             </Button>
                             <Button
                               variant="outlined"
                               color="error"
                               size="small"
                               onClick={() => handleDelete(enrollment._id)}
                               disabled={submitting}
                               startIcon={submitting ? <CircularProgress size={16} /> : <DeleteOutlined />}
                             >
                               Delete
                             </Button>
                           </Box>
                         </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}

      {/* Add Enrollment Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Enrollment</DialogTitle>
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
          {({ errors, handleSubmit, touched, setFieldValue }) => (
            <Form onSubmit={handleSubmit}>
              <DialogContent>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Course</InputLabel>
                      <Select
                        value={selectedCourse}
                        onChange={(e) => {
                          setSelectedCourse(e.target.value);
                          setFieldValue('courseId', e.target.value);
                          setFieldValue('batchId', '');
                        }}
                        error={touched.courseId && !!errors.courseId}
                      >
                        {courseOptions.map((course) => (
                          <MenuItem key={course._id} value={course._id}>
                            {course.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.courseId && errors.courseId && (
                        <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '4px' }}>
                          {errors.courseId}
                        </div>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Batch</InputLabel>
                      <Select
                        value={selectedBatch}
                        onChange={(e) => {
                          setSelectedBatch(e.target.value);
                          setFieldValue('batchId', e.target.value);
                        }}
                        error={touched.batchId && !!errors.batchId}
                        disabled={!selectedCourse}
                      >
                        {batchOptions.map((batch) => (
                          <MenuItem key={batch._id} value={batch._id}>
                            {batch.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.batchId && errors.batchId && (
                        <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '4px' }}>
                          {errors.batchId}
                        </div>
                      )}
                    </FormControl>
                  </Grid>
                </Grid>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setOpen(false)}>Cancel</Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  endIcon={submitting ? <CircularProgress size={20} /> : null}
                >
                  Add Enrollment
                </Button>
              </DialogActions>
            </Form>
          )}
                 </Formik>
       </Dialog>

       {/* Batch Transfer Dialog */}
       <Dialog open={openTransferDialog} onClose={closeTransferDialog} maxWidth="sm" fullWidth>
         <DialogTitle>Batch Transfer</DialogTitle>
         <DialogContent>
           <Box sx={{ pt: 2 }}>
             {selectedEnrollment && (
               <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                 <Typography variant="subtitle2" color="textSecondary">
                   Current Enrollment
                 </Typography>
                 <Typography variant="body2">
                   Course: {selectedEnrollment.course?.name || 'N/A'}
                 </Typography>
                 <Typography variant="body2">
                   Current Batch: {selectedEnrollment.batch?.name || 'N/A'}
                 </Typography>
               </Box>
             )}
             
             <FormControl fullWidth sx={{ mb: 2 }}>
               <InputLabel>New Batch</InputLabel>
               <Select
                 value={transferData.batchId}
                 label="New Batch"
                 onChange={(e) => setTransferData({ ...transferData, batchId: e.target.value })}
               >
                 {batchOptions.map((batch) => (
                   <MenuItem key={batch._id} value={batch._id}>
                     {batch.name}
                   </MenuItem>
                 ))}
               </Select>
             </FormControl>
             
             <TextField
               label="Transfer Reason"
               variant="outlined"
               fullWidth
               multiline
               rows={3}
               value={transferData.reason}
               onChange={(e) => setTransferData({ ...transferData, reason: e.target.value })}
               placeholder="Please provide a reason for the batch transfer..."
             />
           </Box>
         </DialogContent>
         <DialogActions>
           <Button onClick={closeTransferDialog}>Cancel</Button>
           <Button 
             onClick={handleTransferSubmit} 
             variant="contained"
             disabled={submitting}
             endIcon={submitting ? <CircularProgress size={20} /> : null}
           >
             Transfer
           </Button>
         </DialogActions>
       </Dialog>
     </MainCard>
   );
 };

export default UpdateForm;
