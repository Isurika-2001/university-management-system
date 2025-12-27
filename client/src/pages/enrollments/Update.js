import React, { useState, useEffect } from 'react';
import { Button, Grid, LinearProgress, CircularProgress, Typography, TextField, Collapse, IconButton } from '@mui/material';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Box } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Formik, Form } from 'formik';
import { FileAddOutlined, DeleteOutlined, SwapOutlined, DownOutlined, UpOutlined } from '@ant-design/icons';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import { useParams } from 'react-router-dom';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { studentsAPI } from '../../api/students';
import { enrollmentsAPI } from '../../api/enrollments';
import { coursesAPI } from '../../api/courses';
import { batchesAPI } from '../../api/batches';
import { classroomAPI } from '../../api/classrooms';
import ClassroomHistory from '../classrooms/ClassroomHistory';
import { PATHWAY_LIST } from '../../constants/pathways';

const UpdateForm = () => {
  const [data, setData] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [courseOptions, setCourseOptions] = useState([]);
  const [allCourseOptions, setAllCourseOptions] = useState([]);
  const [intakeOptions, setIntakeOptions] = useState([]);
  const [classroomOptions, setClassroomOptions] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedIntake, setSelectedIntake] = useState('');
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [transferData, setTransferData] = useState({
    batchId: '',
    reason: ''
  });
  const [expandedEnrollment, setExpandedEnrollment] = useState(null);
  const [openAddClassroomDialog, setOpenAddClassroomDialog] = useState(false);
  const [selectedEnrollmentForClassroom, setSelectedEnrollmentForClassroom] = useState(null);
  const [eligibleClassrooms, setEligibleClassrooms] = useState([]);
  const [selectedClassroomForAdd, setSelectedClassroomForAdd] = useState('');

  const { id } = useParams();

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
  }, [id]);

  useEffect(() => {
    if (selectedPathway) {
      const filtered = allCourseOptions.filter((course) => course.pathway === selectedPathway);
      setCourseOptions(filtered);
    } else {
      setCourseOptions(allCourseOptions);
    }
  }, [selectedPathway, allCourseOptions]);

  useEffect(() => {
    fetchIntakes(selectedCourse);
  }, [selectedCourse]);

  useEffect(() => {
    if (selectedCourse && selectedIntake) {
      fetchClassrooms(selectedCourse, selectedIntake);
    }
  }, [selectedCourse, selectedIntake]);

  async function fetchData() {
    setLoading(true);
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
      setAllCourseOptions(response || []);
      setCourseOptions(response || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourseOptions([]);
      setAllCourseOptions([]);
    }
  }

  async function fetchIntakes(courseId) {
    if (!courseId) {
      setIntakeOptions([]);
      return;
    }
    try {
      const response = await batchesAPI.getByCourseId(courseId);
      setIntakeOptions(response.data || response || []);
    } catch (error) {
      console.error('Error fetching intakes:', error);
      setIntakeOptions([]);
    }
  }

  async function fetchClassrooms(courseId, intakeId) {
    if (!courseId || !intakeId) {
      setClassroomOptions([]);
      return;
    }
    try {
      const response = await classroomAPI.getByCourseAndBatch(courseId, intakeId);
      setClassroomOptions(response || []);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      setClassroomOptions([]);
    }
  }

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      if (!id) {
        showErrorSwal('Student ID not found in URL');
        return;
      }

      console.log('Submitting enrollment data:', values);
      const responseData = await enrollmentsAPI.createForStudent(id, values);
      showSuccessSwal(responseData.message || 'Enrollment added successfully');
      setOpen(false);
      setSelectedPathway('');
      setSelectedCourse('');
      setSelectedIntake('');
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

    if (enrollment.courseId) {
      await fetchIntakes(enrollment.courseId);
    }
  };

  const handleTransferSubmit = async () => {
    try {
      setSubmitting(true);
      console.log('Submitting transfer data:', transferData);
      console.log('Selected enrollment:', selectedEnrollment);

      if (!transferData.batchId || !transferData.reason) {
        showErrorSwal('Please select a new intake and provide a transfer reason');
        return;
      }

      const responseData = await enrollmentsAPI.addBatchTransfer(selectedEnrollment._id, transferData);
      showSuccessSwal(responseData.message || 'Intake transfer completed successfully');
      closeTransferDialog();
      fetchEnrollments();
    } catch (error) {
      console.error('Transfer error:', error);
      showErrorSwal(error.message || 'Failed to complete intake transfer');
    } finally {
      setSubmitting(false);
    }
  };

  const closeTransferDialog = () => {
    setOpenTransferDialog(false);
    setSelectedEnrollment(null);
    setTransferData({ batchId: '', reason: '' });
  };

  const handleAddClassroom = async (enrollment) => {
    setSelectedEnrollmentForClassroom(enrollment);
    try {
      const response = await classroomAPI.getEligibleClassrooms(enrollment._id);
      setEligibleClassrooms(response.data || []);
      setOpenAddClassroomDialog(true);
    } catch (error) {
      showErrorSwal('Failed to fetch eligible classrooms');
      console.error('Error fetching eligible classrooms:', error);
    }
  };

  const handleAddClassroomSubmit = async () => {
    if (!selectedClassroomForAdd) {
      showErrorSwal('Please select a classroom');
      return;
    }
    try {
      setSubmitting(true);
      await classroomAPI.addStudentToClassroom({
        classroomId: selectedClassroomForAdd,
        enrollmentId: selectedEnrollmentForClassroom._id,
        studentId: data._id
      });
      showSuccessSwal('Student added to classroom successfully');
      setOpenAddClassroomDialog(false);
      setSelectedClassroomForAdd('');
      // Refresh the classroom history by closing and opening the collapse
      const enrollmentId = selectedEnrollmentForClassroom._id;
      setExpandedEnrollment(null);
      setTimeout(() => {
        setExpandedEnrollment(enrollmentId);
      }, 100);
    } catch (error) {
      showErrorSwal('Failed to add student to classroom');
      console.error('Error adding student to classroom:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const initialValues = {
    pathway: '',
    courseId: '',
    batchId: '',
    classroomId: ''
  };

  const validationSchema = Yup.object().shape({
    pathway: Yup.string().required('Pathway is required'),
    courseId: Yup.string().required('Course is required'),
    batchId: Yup.string().required('Intake is required'),
    classroomId: Yup.string().required('Classroom is required')
  });

  const handleToggleHistory = (enrollmentId) => {
    if (expandedEnrollment === enrollmentId) {
      setExpandedEnrollment(null);
    } else {
      setExpandedEnrollment(enrollmentId);
    }
  };

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
              <p>
                <strong>Name:</strong> {data.firstName} {data.lastName}
              </p>
              <p>
                <strong>Email:</strong> {data.email}
              </p>
              <p>
                <strong>Student ID:</strong> {data.registration_no || data.registrationNo || data._id}
              </p>
            </Box>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <h3>Current Enrollments</h3>
              <Button variant="contained" startIcon={<FileAddOutlined />} onClick={() => setOpen(true)}>
                Add New Enrollment
              </Button>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell />
                    <TableCell>Course</TableCell>
                    <TableCell>Intake</TableCell>
                    <TableCell>Enrollment Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {enrollments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        No enrollments found for this student. Add a new enrollment to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    enrollments.map((enrollment, index) => (
                      <React.Fragment key={enrollment._id || index}>
                        <TableRow>
                          <TableCell>
                            <IconButton aria-label="expand row" size="small" onClick={() => handleToggleHistory(enrollment._id)}>
                              {expandedEnrollment === enrollment._id ? <UpOutlined /> : <DownOutlined />}
                            </IconButton>
                          </TableCell>
                          <TableCell>{enrollment.course?.name || 'N/A'}</TableCell>
                          <TableCell>{enrollment.batch?.name || 'N/A'}</TableCell>
                          <TableCell>{new Date(enrollment.enrollmentDate).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                variant="outlined"
                                color="primary"
                                size="small"
                                onClick={() => handleAddClassroom(enrollment)}
                                disabled={submitting}
                                startIcon={<FileAddOutlined />}
                              >
                                Add Classroom
                              </Button>
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
                        <TableRow>
                          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
                            <Collapse in={expandedEnrollment === enrollment._id} timeout="auto" unmountOnExit>
                              <Box sx={{ margin: 1 }}>
                                <ClassroomHistory enrollmentId={enrollment._id} />
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
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
                      <InputLabel>Pathway</InputLabel>
                      <Select
                        value={selectedPathway}
                        onChange={(e) => {
                          setSelectedPathway(e.target.value);
                          setFieldValue('pathway', e.target.value);
                          setFieldValue('courseId', '');
                          setFieldValue('batchId', '');
                          setFieldValue('classroomId', '');
                        }}
                        error={touched.pathway && !!errors.pathway}
                      >
                        {PATHWAY_LIST.map((pathway) => (
                          <MenuItem key={pathway.id} value={pathway.id}>
                            {pathway.label}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.pathway && errors.pathway && (
                        <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '4px' }}>{errors.pathway}</div>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Course</InputLabel>
                      <Select
                        value={selectedCourse}
                        onChange={(e) => {
                          setSelectedCourse(e.target.value);
                          setFieldValue('courseId', e.target.value);
                          setFieldValue('batchId', '');
                          setFieldValue('classroomId', '');
                        }}
                        error={touched.courseId && !!errors.courseId}
                        disabled={!selectedPathway}
                      >
                        {courseOptions.map((course) => (
                          <MenuItem key={course._id} value={course._id}>
                            {course.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.courseId && errors.courseId && (
                        <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '4px' }}>{errors.courseId}</div>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Intake</InputLabel>
                      <Select
                        value={selectedIntake}
                        onChange={(e) => {
                          setSelectedIntake(e.target.value);
                          setFieldValue('batchId', e.target.value);
                          setFieldValue('classroomId', '');
                        }}
                        error={touched.batchId && !!errors.batchId}
                        disabled={!selectedCourse}
                      >
                        {intakeOptions.map((intake) => (
                          <MenuItem key={intake._id} value={intake._id}>
                            {intake.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.batchId && errors.batchId && (
                        <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '4px' }}>{errors.batchId}</div>
                      )}
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Classroom</InputLabel>
                      <Select
                        onChange={(e) => {
                          setFieldValue('classroomId', e.target.value);
                        }}
                        error={touched.classroomId && !!errors.classroomId}
                        disabled={!selectedIntake}
                      >
                        {classroomOptions.map((classroom) => (
                          <MenuItem key={classroom._id} value={classroom._id}>
                            {classroom.name}
                          </MenuItem>
                        ))}
                      </Select>
                      {touched.classroomId && errors.classroomId && (
                        <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '4px' }}>{errors.classroomId}</div>
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
        <DialogTitle>Intake Transfer</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {selectedEnrollment && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Current Enrollment
                </Typography>
                <Typography variant="body2">Course: {selectedEnrollment.course?.name || 'N/A'}</Typography>
                <Typography variant="body2">Current Intake: {selectedEnrollment.batch?.name || 'N/A'}</Typography>
              </Box>
            )}

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>New Intake</InputLabel>
              <Select
                value={transferData.batchId}
                label="New Intake"
                onChange={(e) => setTransferData({ ...transferData, batchId: e.target.value })}
              >
                {intakeOptions.map((intake) => (
                  <MenuItem key={intake._id} value={intake._id}>
                    {intake.name}
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
              placeholder="Please provide a reason for the intake transfer..."
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

      {/* Add Classroom Dialog */}
      <Dialog open={openAddClassroomDialog} onClose={() => setOpenAddClassroomDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Classroom</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {selectedEnrollmentForClassroom && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Enrollment Details
                </Typography>
                <Typography variant="body2">Course: {selectedEnrollmentForClassroom.course?.name || 'N/A'}</Typography>
                <Typography variant="body2">Intake: {selectedEnrollmentForClassroom.batch?.name || 'N/A'}</Typography>
              </Box>
            )}

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>New Classroom</InputLabel>
              <Select value={selectedClassroomForAdd} label="New Classroom" onChange={(e) => setSelectedClassroomForAdd(e.target.value)}>
                {eligibleClassrooms.map((classroom) => (
                  <MenuItem key={classroom._id} value={classroom._id}>
                    {classroom.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddClassroomDialog(false)}>Cancel</Button>
          <Button
            onClick={handleAddClassroomSubmit}
            variant="contained"
            disabled={submitting}
            endIcon={submitting ? <CircularProgress size={20} /> : null}
          >
            Add to Classroom
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default UpdateForm;
