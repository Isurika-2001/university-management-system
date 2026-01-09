import React, { useEffect, useState, useCallback } from 'react';
import { examAPI } from 'api/exams';
import { classroomAPI } from 'api/classrooms';
import { coursesAPI } from 'api/courses';
import { batchesAPI } from 'api/batches';
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
  InputLabel,
  Alert,
  TablePagination,
  TableSortLabel,
  TextField,
  Typography,
  IconButton
} from '@mui/material';
import { PlusOutlined, ArrowUpOutlined, ArrowDownOutlined, UpOutlined, DownOutlined } from '@ant-design/icons'; // Add sort icons

export default function ExamsView() {
  const [exams, setExams] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [dialogError, setDialogError] = useState(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const navigate = useNavigate();

  // Pagination & Sorting state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedBatch, setSelectedBatch] = useState('');
  const [expandedCourses, setExpandedCourses] = useState(new Set()); // Track which course categories are expanded

  // Debounce searchTerm
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const [examsResp, classroomsResp, coursesResp] = await Promise.all([
        examAPI.listAll({
          page,
          limit: rowsPerPage,
          sortBy,
          sortOrder,
          search: debouncedSearchTerm,
          courseId: selectedCourse || undefined,
          batchId: selectedBatch || undefined
        }),
        classroomAPI.getAll(),
        coursesAPI.getAll()
      ]);

      setExams(examsResp?.data || []);
      setTotalCount(examsResp?.pagination?.total || 0);
      setClassrooms(classroomsResp?.data || []);
      setCourses(coursesResp?.data || coursesResp || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load exams');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, sortBy, sortOrder, debouncedSearchTerm, selectedCourse, selectedBatch]); // Dependencies for fetchData

  // Fetch batches when course is selected
  useEffect(() => {
    const fetchBatchesForCourse = async () => {
      if (selectedCourse) {
        try {
          const batchesResp = await batchesAPI.getByCourseId(selectedCourse);
          setBatches(batchesResp?.data || batchesResp || []);
        } catch (err) {
          console.error('Error fetching batches:', err);
          setBatches([]);
        }
      } else {
        setBatches([]);
        setSelectedBatch('');
      }
    };
    fetchBatchesForCourse();
  }, [selectedCourse]);

  useEffect(() => {
    fetchData();
  }, [fetchData]); // Only re-run if fetchData changes

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleSort = (property) => {
    const isAsc = sortBy === property && sortOrder === 'asc';
    setSortBy(property);
    setSortOrder(isAsc ? 'desc' : 'asc');
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleCourseChange = (event) => {
    setSelectedCourse(event.target.value);
    setSelectedBatch('');
    setPage(0);
  };

  const handleBatchChange = (event) => {
    setSelectedBatch(event.target.value);
    setPage(0);
  };

  const toggleCourseExpansion = (courseId) => {
    setExpandedCourses((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(courseId)) {
        newSet.delete(courseId);
      } else {
        newSet.add(courseId);
      }
      return newSet;
    });
  };

  // Expand all courses by default on initial load
  useEffect(() => {
    if (exams.length > 0 && expandedCourses.size === 0) {
      const grouped = groupExamsByCourse(exams);
      const allCourseIds = new Set(grouped.map((g) => g.courseId));
      setExpandedCourses(allCourseIds);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exams.length]); // Only run when exams are first loaded

  // Group exams by course
  const groupExamsByCourse = (examsList) => {
    const grouped = {};
    examsList.forEach((exam) => {
      // Check if classroomId is populated (from backend) or needs to be found in classrooms array
      const classroom = exam.classroomId?.courseId
        ? exam.classroomId
        : classrooms.find((c) => c._id === exam.classroomId || c._id === exam.classroomId?._id);

      const courseId = classroom?.courseId?._id?.toString() || classroom?.courseId?.toString() || 'unknown';
      const courseName = classroom?.courseId?.name || 'Unknown Course';

      if (!grouped[courseId]) {
        grouped[courseId] = {
          courseId,
          courseName,
          exams: []
        };
      }
      grouped[courseId].exams.push(exam);
    });
    return Object.values(grouped).sort((a, b) => a.courseName.localeCompare(b.courseName));
  };

  const renderSortIcon = (column) => {
    if (sortBy !== column) {
      return null;
    }
    return sortOrder === 'asc' ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
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

          <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
            <TextField label="Search" variant="outlined" onChange={handleSearch} value={searchTerm} sx={{ minWidth: 300, maxWidth: 400 }} />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Course</InputLabel>
              <Select value={selectedCourse} onChange={handleCourseChange} label="Filter by Course">
                <MenuItem value="">All Courses</MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {selectedCourse && (
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Intake</InputLabel>
                <Select value={selectedBatch} onChange={handleBatchChange} label="Filter by Intake">
                  <MenuItem value="">All Intakes</MenuItem>
                  {batches.map((batch) => (
                    <MenuItem key={batch._id} value={batch._id}>
                      {batch.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>
                    <TableSortLabel
                      active={sortBy === 'name'}
                      direction={sortBy === 'name' ? sortOrder : 'asc'}
                      onClick={() => handleSort('name')}
                    >
                      Exam Name {renderSortIcon('name')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Classroom</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Course</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Batch</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>No of Students</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="right">
                    Action
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(() => {
                  const groupedExams = groupExamsByCourse(exams);
                  return groupedExams.map((group) => {
                    const isExpanded = expandedCourses.has(group.courseId);
                    return (
                      <React.Fragment key={group.courseId}>
                        <TableRow
                          sx={{ backgroundColor: '#e3f2fd', cursor: 'pointer' }}
                          onClick={() => toggleCourseExpansion(group.courseId)}
                        >
                          <TableCell colSpan={6} sx={{ fontWeight: 'bold', py: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleCourseExpansion(group.courseId);
                                }}
                              >
                                {isExpanded ? <UpOutlined /> : <DownOutlined />}
                              </IconButton>
                              <Typography variant="subtitle1">
                                {group.courseName} ({group.exams.length} exam{group.exams.length !== 1 ? 's' : ''})
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                        {group.exams.map((exam) => {
                          // Check if classroomId is populated (from backend) or needs to be found in classrooms array
                          const examClassroomId = exam.classroomId?._id || exam.classroomId;
                          // Always try to get from classrooms array first (has studentCount), fallback to exam.classroomId
                          const classroomFromArray = classrooms.find((c) => c._id === examClassroomId);
                          const classroom = classroomFromArray || exam.classroomId;
                          return (
                            <TableRow key={exam._id} sx={{ display: isExpanded ? 'table-row' : 'none' }}>
                              <TableCell>{exam.name}</TableCell>
                              <TableCell>{classroom?.name || '-'}</TableCell>
                              <TableCell>{classroom?.courseId?.name || '-'}</TableCell>
                              <TableCell>{classroom?.batchId?.name || '-'}</TableCell>
                              <TableCell>{classroom?.studentCount ?? '-'}</TableCell>
                              <TableCell align="right">
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  onClick={() => navigate(`/app/exams/${examClassroomId}`)}
                                >
                                  Mark
                                </Button>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </React.Fragment>
                    );
                  });
                })()}
              </TableBody>
            </Table>
          </TableContainer>
          {exams.length === 0 && !loading && (
            <Box sx={{ p: 2, textAlign: 'center', color: '#999' }}>No exams found. Click &quot;Add Exam&quot; to create one.</Box>
          )}

          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={totalCount}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
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
            {dialogLoading ? <CircularProgress size={20} color="inherit" /> : 'Create Exam'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
