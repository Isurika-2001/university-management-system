import React, { useEffect, useState } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  FormLabel,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper
} from '@mui/material';
import { ArrowLeftOutlined } from '@ant-design/icons';

export default function ExamDetail() {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [selectedExam, setSelectedExam] = useState(null);
  const [marksByStudent, setMarksByStudent] = useState({});
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMarkOpen, setNewMarkOpen] = useState(false);
  const [newMarkData, setNewMarkData] = useState({ studentId: '', takeType: 'fresh', mark: '' });

  useEffect(() => {
    if (!classroomId) {
      navigate('/app/exams');
      return;
    }

    (async () => {
      try {
        setLoading(true);
        // Fetch exams for this classroom and students
        const [examsResp, classroomResp] = await Promise.all([
          examAPI.listByClassroom(classroomId),
          classroomAPI.getById(classroomId)
        ]);
        
        const exams = examsResp?.data || [];
        setStudents(classroomResp?.data?.students || []);
        
        // Automatically select the first (and likely only) exam
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
    if (!selectedExam) return;
    (async () => {
      try {
        const resp = await examAPI.get(selectedExam._id);
        const marks = resp?.data?.marks || [];
        const grouped = {};
        marks.forEach((m) => {
          grouped[m.studentId?._id || m.studentId] = m.takes || [];
        });
        setMarksByStudent(grouped);
      } catch (err) {
        console.error('Error fetching marks:', err);
      }
    })();
  }, [selectedExam]);

  const handleAddMark = async () => {
    const { studentId, takeType, mark } = newMarkData;
    if (!studentId || mark === '') {
      alert('Select student and enter mark');
      return;
    }
    try {
      await examAPI.addMark(selectedExam._id, { studentId, takeType, mark: Number(mark) });

      // Refresh marks
      const resp = await examAPI.get(selectedExam._id);
      const marks = resp?.data?.marks || [];
      const grouped = {};
      marks.forEach((m) => {
        grouped[m.studentId?._id || m.studentId] = m.takes || [];
      });
      setMarksByStudent(grouped);

      setNewMarkOpen(false);
      setNewMarkData({ studentId: '', takeType: 'fresh', mark: '' });
    } catch (err) {
      console.error('Error adding mark:', err);
      alert('Failed to add mark');
    }
  };

  const getStudentName = (student) => {
    if (student?.studentId?.firstName && student?.studentId?.lastName) {
      return `${student.studentId.firstName} ${student.studentId.lastName}`;
    }
    return student?.studentId?.name || student?.studentId?.email || 'Unknown';
  };

  const getStudentStatus = (studentId) => {
    const takes = marksByStudent[studentId] || [];
    if (takes.length === 0) return 'N/A';
    const lastTake = takes[takes.length - 1];
    return lastTake.passed ? 'PASS' : 'FAIL';
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
            selectedExam && (
              <Button variant="contained" size="small" onClick={() => setNewMarkOpen(true)}>
                Add Mark
              </Button>
            )
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
                    <TableCell sx={{ fontWeight: 'bold' }}>Takes</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>Current Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => {
                    const sid = student.studentId?._id || student._id;
                    const takes = marksByStudent[sid] || [];
                    const status = getStudentStatus(sid);

                    return (
                      <TableRow key={sid}>
                        <TableCell>{getStudentName(student)}</TableCell>
                        <TableCell>{student.enrollmentId?.enrollmentNumber || '-'}</TableCell>
                        <TableCell>
                          {takes.length > 0 ? (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                              {takes.map((t, idx) => (
                                <Box
                                  key={idx}
                                  sx={{
                                    fontSize: '0.85rem',
                                    p: 0.5,
                                    backgroundColor: '#f9f9f9',
                                    borderRadius: 1
                                  }}
                                >
                                  <strong>{t.type}</strong>: {t.mark}/100 ({t.passed ? '✓ Pass' : '✗ Fail'})
                                </Box>
                              ))}
                            </Box>
                          ) : (
                            <Box sx={{ color: '#999' }}>No marks yet</Box>
                          )}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              fontWeight: 'bold',
                              color: status === 'PASS' ? '#4caf50' : status === 'FAIL' ? '#f44336' : '#999',
                              padding: '4px 8px',
                              backgroundColor: status === 'PASS' ? '#e8f5e9' : status === 'FAIL' ? '#ffebee' : '#f5f5f5',
                              borderRadius: 1,
                              display: 'inline-block'
                            }}
                          >
                            {status}
                          </Box>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 3, textAlign: 'center', color: '#999' }}>Exam not found</Box>
          )}
        </CardContent>
      </Card>

      {/* Dialog: Add Mark */}
      <Dialog open={newMarkOpen} onClose={() => setNewMarkOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Mark</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel>Student</FormLabel>
            <Select
              size="small"
              value={newMarkData.studentId}
              onChange={(e) => setNewMarkData({ ...newMarkData, studentId: e.target.value })}
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
              value={newMarkData.takeType}
              onChange={(e) => setNewMarkData({ ...newMarkData, takeType: e.target.value })}
            >
              <MenuItem value="fresh">Fresh</MenuItem>
              <MenuItem value="retake">Retake</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <FormLabel>Mark (0-100)</FormLabel>
            <input
              type="number"
              min="0"
              max="100"
              value={newMarkData.mark}
              onChange={(e) => setNewMarkData({ ...newMarkData, mark: e.target.value })}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewMarkOpen(false)}>Cancel</Button>
          <Button onClick={handleAddMark} variant="contained">
            Save Mark
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
