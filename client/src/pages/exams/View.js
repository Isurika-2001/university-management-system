import React, { useEffect, useState } from 'react';
import { examAPI } from 'api/exams';
import { classroomAPI } from 'api/classrooms';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardHeader,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  Alert
} from '@mui/material';
import { PlusOutlined } from '@ant-design/icons';

export default function ExamsView() {
  const [exams, setExams] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [dialogError, setDialogError] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [examsResp, classroomsResp] = await Promise.all([examAPI.listAll(), classroomAPI.getAll()]);
      setExams(examsResp?.data || []);
      setClassrooms(classroomsResp?.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleAddExamClick = () => {
    setOpenDialog(true);
    setDialogError(null);
    setSelectedClassroom('');
  };

  const handleCreateExam = async () => {
    if (!selectedClassroom) {
      setDialogError('Please select a classroom');
      return;
    }

    // Check if exam already exists for selected classroom
    const existingExam = exams.find((e) => e.classroomId === selectedClassroom || e.classroomId?._id === selectedClassroom);
    if (existingExam) {
      setDialogError('An exam already exists for the selected classroom');
      return;
    }

    try {
      setDialogLoading(true);
      const classroomData = classrooms.find((c) => c._id === selectedClassroom);

      await examAPI.create({
        classroomId: selectedClassroom,
        name: `${classroomData?.name || 'Exam'} - Exam`,
        date: null,
        description: `Exam for classroom ${classroomData?.name || ''}`
      });

      // Refresh exams list
      await fetchData();

      setOpenDialog(false);
      setSelectedClassroom('');
      setDialogError(null);
    } catch (err) {
      console.error('Error creating exam:', err);
      setDialogError(err.message || 'Failed to create exam');
    } finally {
      setDialogLoading(false);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <>
      <Card>
        <CardHeader
          title="Exams"
          action={
            <Button variant="contained" icon={<PlusOutlined />} onClick={handleAddExamClick}>
              Add Exam
            </Button>
          }
        />
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>Exam Name</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Classroom</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Course</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Batch</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {exams.map((exam) => {
                  const classroom = classrooms.find((c) => c._id === exam.classroomId || c._id === exam.classroomId?._id);
                  return (
                    <TableRow key={exam._id}>
                      <TableCell>{exam.name}</TableCell>
                      <TableCell>{classroom?.name || '-'}</TableCell>
                      <TableCell>{classroom?.courseId?.name || '-'}</TableCell>
                      <TableCell>{classroom?.batchId?.name || '-'}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => navigate(`/app/exams/${exam.classroomId?._id || exam.classroomId}`)}
                        >
                          Mark
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          {exams.length === 0 && (
            <Box sx={{ p: 2, textAlign: 'center', color: '#999' }}>No exams found. Click &quot;Add Exam&quot; to create one.</Box>
          )}
        </CardContent>
      </Card>

      {/* Add Exam Dialog */}
      <Dialog open={openDialog} onClose={() => !dialogLoading && setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Exam</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}

          <FormControl fullWidth>
            <FormLabel sx={{ mb: 1 }}>Select Classroom</FormLabel>
            <Select
              value={selectedClassroom}
              onChange={(e) => {
                setSelectedClassroom(e.target.value);
                setDialogError(null);
              }}
              disabled={dialogLoading}
            >
              <MenuItem value="">-- Choose Classroom --</MenuItem>
              {classrooms.map((classroom) => {
                const hasExam = exams.some((e) => e.classroomId === classroom._id || e.classroomId?._id === classroom._id);
                return (
                  <MenuItem key={classroom._id} value={classroom._id} disabled={hasExam}>
                    {classroom.name} {hasExam ? '(exam exists)' : ''}
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={dialogLoading}>
            Cancel
          </Button>
          <Button onClick={handleCreateExam} variant="contained" disabled={dialogLoading || !selectedClassroom}>
            {dialogLoading ? 'Creating...' : 'Create Exam'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
