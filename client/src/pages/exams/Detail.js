import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { examAPI } from 'api/exams';
import { classroomAPI } from 'api/classrooms';
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
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  Select,
  MenuItem
} from '@mui/material';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';

const TakeCells = ({ student, take, examId, onMarkSave }) => {
  const [mark, setMark] = useState(take?.mark ?? '');
  const isEditable = take?.mark == null;

  const handleSave = async () => {
    try {
      if (take?._id) {
        // Existing take, update it
        const examMark = student.examMark;
        await examAPI.updateMark(examMark._id, take._id, { mark: Number(mark) });
      } else {
        // New take, add it
        await examAPI.addMark(examId, {
          studentId: student.studentId._id,
          takeType: take.type,
          mark: Number(mark)
        });
      }
      onMarkSave(); // Refresh data
    } catch (err) {
      console.error('Error saving mark', err);
      alert('Failed to save mark');
    }
  };

  return (
    <>
      <TableCell>{take.type}</TableCell>
      <TableCell>
        <input type="number" value={mark} disabled={!isEditable} onChange={(e) => setMark(e.target.value)} style={{ width: '80px' }} />
      </TableCell>
      <TableCell>
        {isEditable && (
          <Button onClick={handleSave} size="small" variant="contained">
            Save
          </Button>
        )}
      </TableCell>
    </>
  );
};

export default function ExamDetail() {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState(null);
  const [marksByStudent, setMarksByStudent] = useState({});
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openAddTake, setOpenAddTake] = useState(false);
  const [newTakeData, setNewTakeData] = useState({ studentId: '', takeType: 'resit', mark: '' });

  const fetchExamData = useCallback(async () => {
    if (!selectedExam) return;
    try {
      const resp = await examAPI.get(selectedExam._id);
      const marks = resp?.data?.marks || [];
      const grouped = {};
      marks.forEach((m) => {
        const studentData = students.find((s) => (s.studentId?._id || s._id) === (m.studentId?._id || m.studentId));
        grouped[m.studentId?._id || m.studentId] = {
          takes: m.takes || [],
          examMark: m,
          student: studentData
        };
      });
      setMarksByStudent(grouped);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching exam data:', err);
      setLoading(false);
    }
  }, [selectedExam, students]);

  useEffect(() => {
    if (!classroomId) {
      navigate('/app/exams');
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const [examsResp, classroomResp] = await Promise.all([examAPI.listByClassroom(classroomId), classroomAPI.getById(classroomId)]);

        const exams = examsResp?.data || [];
        setStudents(classroomResp?.data?.students || []);

        if (exams.length > 0) {
          setSelectedExam(exams[0]);
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [classroomId, navigate]);

  useEffect(() => {
    fetchExamData();
  }, [selectedExam, students, fetchExamData]);

  const handleAddTake = async () => {
    const { studentId, takeType, mark } = newTakeData;
    if (!studentId) {
      alert('Please select a student');
      return;
    }
    try {
      await examAPI.addMark(selectedExam._id, { studentId, takeType, mark: mark ? Number(mark) : null });
      setOpenAddTake(false);
      setNewTakeData({ studentId: '', takeType: 'resit', mark: '' });
      fetchExamData();
    } catch (err) {
      console.error('Error adding take', err);
      alert('Failed to add take');
    }
  };

  const getStudentName = (student) => {
    if (student?.studentId?.firstName && student?.studentId?.lastName) {
      return `${student.studentId.firstName} ${student.studentId.lastName}`;
    }
    return student?.studentId?.name || student?.studentId?.email || 'Unknown';
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Button startIcon={<ArrowLeftOutlined />} onClick={() => navigate('/app/exams')}>
          Back to Exams
        </Button>
      </Box>

      <Card>
        <CardHeader
          title={selectedExam ? `Exam: ${selectedExam.name}` : 'Exam not found'}
          action={
            <Button variant="contained" size="small" startIcon={<PlusOutlined />} onClick={() => setOpenAddTake(true)}>
              Add New Take
            </Button>
          }
        />
        <CardContent>
          {selectedExam ? (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Student Name</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Enrollment ID</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Take</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Mark</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => {
                    const sid = student.studentId?._id || student._id;
                    const studentMarks = marksByStudent[sid];
                    let takes = [...(studentMarks?.takes || [])];

                    const hasFreshTake = takes.some((take) => take.type === 'fresh');
                    if (!hasFreshTake) {
                      takes.unshift({ type: 'fresh', mark: null });
                    }

                    const studentWithMarkInfo = { ...student, examMark: studentMarks?.examMark };

                    return takes.map((take, index) => (
                      <TableRow key={`${sid}-${take.type}-${index}`}>
                        {index === 0 && (
                          <>
                            <TableCell rowSpan={takes.length} sx={{ verticalAlign: 'top' }}>
                              {getStudentName(student)}
                            </TableCell>
                            <TableCell rowSpan={takes.length} sx={{ verticalAlign: 'top' }}>
                              {student.enrollmentId?.enrollment_no || '-'}
                            </TableCell>
                          </>
                        )}
                        <TakeCells take={take} examId={selectedExam._id} onMarkSave={fetchExamData} student={studentWithMarkInfo} />
                      </TableRow>
                    ));
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center', color: '#999' }}>Exam not found</Box>
          )}
        </CardContent>
      </Card>
      <Dialog open={openAddTake} onClose={() => setOpenAddTake(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Take</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel>Student</FormLabel>
            <Select
              size="small"
              value={newTakeData.studentId}
              onChange={(e) => setNewTakeData({ ...newTakeData, studentId: e.target.value })}
            >
              <MenuItem value="">-- Select Student --</MenuItem>
              {students.map((s) => (
                <MenuItem key={s.studentId?._id || s._id} value={s.studentId?._id || s._id}>
                  {getStudentName(s)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel>Take Type</FormLabel>
            <Select
              size="small"
              value={newTakeData.takeType}
              onChange={(e) => setNewTakeData({ ...newTakeData, takeType: e.target.value })}
            >
              <MenuItem value="fresh">Fresh</MenuItem>
              <MenuItem value="resit">Resit</MenuItem>
              <MenuItem value="resit-retake">Resit-Retake</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <FormLabel>Mark (0-100) (Optional)</FormLabel>
            <input
              type="number"
              min="0"
              max="100"
              value={newTakeData.mark}
              onChange={(e) => setNewTakeData({ ...newTakeData, mark: e.target.value })}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAddTake(false)}>Cancel</Button>
          <Button onClick={handleAddTake} variant="contained">
            Save Take
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
