import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Button,
  Box,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Chip,
  Grid,
  CircularProgress
} from '@mui/material';
import { ArrowLeftOutlined, UserAddOutlined, DeleteOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { classroomAPI } from 'api/classrooms';
import { STATUSES, STATUS_LIST } from 'constants/statuses';

const Detail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [classroom, setClassroom] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [eligibleClassrooms, setEligibleClassrooms] = useState([]);
  const [selectedNewClassroom, setSelectedNewClassroom] = useState(null);
  const [isHolding, setIsHolding] = useState(false); // New state for hold button loading
  const [isAddingToNew, setIsAddingToNew] = useState(false); // New state for confirm add to new button loading
  const [isRemoving, setIsRemoving] = useState(false); // State for remove button loading

  const Toast = useMemo(
    () =>
      withReactContent(
        Swal.mixin({
          toast: true,
          position: 'bottom',
          customClass: { popup: 'colored-toast' },
          background: 'primary',
          showConfirmButton: false,
          timer: 3500,
          timerProgressBar: true
        })
      ),
    []
  );

  const showSuccessSwal = useCallback(
    (msg) => {
      Toast.fire({ icon: 'success', title: msg });
    },
    [Toast]
  );

  const showErrorSwal = useCallback(
    (msg) => {
      Toast.fire({ icon: 'error', title: msg });
    },
    [Toast]
  );

  const fetchClassroom = useCallback(async () => {
    try {
      const response = await classroomAPI.getById(id);
      if (response?.data) {
        setClassroom(response.data);
        setStudents(response.data.students || []);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      showErrorSwal('Error loading classroom');
      setLoading(false);
    }
  }, [id, setClassroom, setStudents, setLoading, showErrorSwal]);

  useEffect(() => {
    fetchClassroom();
  }, [fetchClassroom]);

  const getStatusColor = (status) => {
    const statusObj = STATUS_LIST.find((s) => s.value === status);
    return statusObj?.color || 'default';
  };

  const getStatusLabel = (status) => {
    const statusObj = STATUS_LIST.find((s) => s.value === status);
    return statusObj?.label || status;
  };

  const isEligibleForTransfer = (status) => {
    return [STATUSES.PASS, STATUSES.FAIL, STATUSES.HOLD].includes(status);
  };

  const handleHoldStatus = async (classroomStudentId) => {
    try {
      setIsHolding(true);
      await classroomAPI.updateStudentStatus(classroomStudentId, STATUSES.HOLD);
      showSuccessSwal('Classroom student status updated to Hold');
      fetchClassroom(); // Refresh data
    } catch (error) {
      console.error('Error updating classroom student status:', error);
      showErrorSwal('Error updating student status');
    } finally {
      setIsHolding(false);
    }
  };

  const handleContinueStatus = async (classroomStudentId) => {
    try {
      setIsHolding(true);
      await classroomAPI.updateStudentStatus(classroomStudentId, STATUSES.ACTIVE);
      showSuccessSwal('Classroom student status updated to Active');
      fetchClassroom(); // Refresh data
    } catch (error) {
      console.error('Error updating classroom student status:', error);
      showErrorSwal('Error updating student status');
    } finally {
      setIsHolding(false);
    }
  };

  const handleRemoveFromClassroom = async (classroomStudentId, studentName) => {
    try {
      const result = await Swal.fire({
        title: 'Remove Student',
        text: `Are you sure you want to remove ${studentName} from this classroom?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d32f2f',
        cancelButtonColor: '#757575',
        confirmButtonText: 'Yes, Remove',
        cancelButtonText: 'Cancel'
      });

      if (result.isConfirmed) {
        setIsRemoving(true);
        await classroomAPI.removeStudent(classroomStudentId);
        showSuccessSwal('Student removed from classroom');
        fetchClassroom(); // Refresh data
      }
    } catch (error) {
      console.error('Error removing student from classroom:', error);
      showErrorSwal('Error removing student from classroom');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleAddToNew = async (student) => {
    try {
      const response = await classroomAPI.getEligibleClassrooms(student.enrollmentId._id, id);
      if (response?.data && response.data.length > 0) {
        setEligibleClassrooms(response.data);
        setSelectedStudent(student);
        setOpenAddDialog(true);
      } else {
        Swal.fire('Info', 'No eligible classrooms available for this student', 'info');
      }
    } catch (error) {
      console.error(error);
      showErrorSwal('Error fetching eligible classrooms');
    }
  };

  const handleConfirmAddToNew = async () => {
    if (!selectedNewClassroom) {
      showErrorSwal('Please select a classroom');
      return;
    }

    try {
      setIsAddingToNew(true); // Set loading true
      await classroomAPI.addStudentToClassroom({
        classroomId: selectedNewClassroom._id,
        enrollmentId: selectedStudent.enrollmentId._id,
        studentId: selectedStudent.studentId._id,
        status: 'active'
      });
      showSuccessSwal('Student added to new classroom');
      setOpenAddDialog(false);
      setSelectedStudent(null);
      setSelectedNewClassroom(null);
    } catch (error) {
      console.error(error);
      showErrorSwal('Error adding student to classroom');
    } finally {
      setIsAddingToNew(false); // Set loading false
    }
  };

  if (loading) return <LinearProgress />;
  if (!classroom) return <Typography>Classroom not found</Typography>;

  return (
    <>
      <MainCard
        title={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Button variant="text" startIcon={<ArrowLeftOutlined />} onClick={() => navigate('/app/classrooms')} size="small">
                Back
              </Button>
              <span>{classroom.name}</span>
            </Box>
          </Box>
        }
      >
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Course
              </Typography>
              <Typography variant="body1">{classroom.courseId?.name || 'N/A'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Intake
              </Typography>
              <Typography variant="body1">{classroom.batchId?.name || 'N/A'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Module
              </Typography>
              <Typography variant="body1">{classroom.moduleName || 'N/A'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Month
              </Typography>
              <Typography variant="body1">{classroom.month || 'N/A'}</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Box>
              <Typography variant="subtitle2" color="textSecondary">
                Total Students
              </Typography>
              <Typography variant="body1">{students.length}</Typography>
            </Box>
          </Grid>
        </Grid>
      </MainCard>

      <MainCard title="Students in Classroom" sx={{ mt: 3 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Enrollment No</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student._id}>
                    <TableCell>{student.enrollmentId?.enrollment_no || 'N/A'}</TableCell>
                    <TableCell>{`${student.studentId?.firstName || ''} ${student.studentId?.lastName || ''}`.trim() || 'N/A'}</TableCell>
                    <TableCell>
                      <Chip label={getStatusLabel(student.status)} color={getStatusColor(student.status)} size="small" />
                    </TableCell>
                    <TableCell>
                      {student.status !== STATUSES.HOLD &&
                        student.status !== STATUSES.PASS &&
                        student.status !== STATUSES.FAIL &&
                        student.status !== STATUSES.TRANSFERRED && (
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => handleHoldStatus(student._id)}
                            color="warning"
                            sx={{ mr: 1 }}
                            disabled={isHolding}
                          >
                            Hold
                          </Button>
                        )}
                      {student.status === STATUSES.HOLD && (
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleContinueStatus(student._id)}
                          color="success"
                          sx={{ mr: 1 }}
                          disabled={isHolding}
                        >
                          Continue
                        </Button>
                      )}
                      {isEligibleForTransfer(student.status) ? (
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<UserAddOutlined />}
                          onClick={() => handleAddToNew(student)}
                          color="primary"
                          sx={{ mr: 1 }}
                        >
                          Add to New
                        </Button>
                      ) : // nothing
                      null}
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<DeleteOutlined />}
                        onClick={() =>
                          handleRemoveFromClassroom(
                            student._id,
                            `${student.studentId?.firstName || ''} ${student.studentId?.lastName || ''}`.trim()
                          )
                        }
                        color="error"
                        disabled={isRemoving}
                      >
                        Remove
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No students in this classroom
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>

      {/* Dialog for adding to new classroom */}
      <Dialog open={openAddDialog} onClose={() => setOpenAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Student to New Classroom</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {selectedStudent && (
            <>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                <strong>Student:</strong>{' '}
                {`${selectedStudent.studentId?.firstName || ''} ${selectedStudent.studentId?.lastName || ''}`.trim()}
              </Typography>
              <Typography variant="subtitle2" sx={{ mb: 2 }}>
                <strong>Enrollment No:</strong> {selectedStudent.enrollmentId?.enrollment_no || 'N/A'}
              </Typography>

              {eligibleClassrooms.length > 0 ? (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Select Classroom:
                  </Typography>
                  {eligibleClassrooms.map((cls) => (
                    <Box
                      key={cls._id}
                      sx={{
                        p: 2,
                        mb: 1,
                        border: selectedNewClassroom?._id === cls._id ? '2px solid primary.main' : '1px solid grey.300',
                        borderRadius: 1,
                        cursor: 'pointer',
                        backgroundColor: selectedNewClassroom?._id === cls._id ? 'action.selected' : 'transparent'
                      }}
                      onClick={() => setSelectedNewClassroom(cls)}
                    >
                      <Typography variant="body2">
                        <strong>{cls.name}</strong>
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        Intake: {cls.batchId?.name || 'N/A'} | Month: {cls.month}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography color="error">No eligible classrooms available</Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
          <Button onClick={handleConfirmAddToNew} variant="contained" disabled={!selectedNewClassroom || isAddingToNew}>
            {isAddingToNew ? <CircularProgress size={20} color="inherit" /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Detail;
