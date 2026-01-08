import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Checkbox,
  TablePagination,
  LinearProgress,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@mui/material';
import { FileAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { classroomAPI } from 'api/classrooms';
import { coursesAPI } from 'api/courses';
import { batchesAPI } from 'api/batches';
import { useAuthContext } from 'context/useAuthContext';
import { hasPermission } from 'utils/userTypeUtils';

const View = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState([]);
  const [intakes, setIntakes] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedIntake, setSelectedIntake] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const navigate = useNavigate();
  const { user } = useAuthContext();

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

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const params = {};
      
      if (debouncedSearchTerm.trim() !== '') {
        params.search = debouncedSearchTerm.trim();
      }
      if (selectedCourse) {
        params.courseId = selectedCourse;
      }
      if (selectedIntake) {
        params.batchId = selectedIntake;
      }

      const response = await classroomAPI.getAll(params);
      if (response?.data) {
        setData(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      showErrorSwal('Error fetching classrooms');
      setLoading(false);
    }
  }, [showErrorSwal, debouncedSearchTerm, selectedCourse, selectedIntake]);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await coursesAPI.getAll();
      setCourses(response || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    }
  }, []);

  const fetchIntakes = useCallback(async (courseId) => {
    if (!courseId) {
      setIntakes([]);
      return;
    }
    try {
      const response = await batchesAPI.getByCourseId(courseId);
      setIntakes(response?.data || response || []);
    } catch (error) {
      console.error('Error fetching intakes:', error);
      setIntakes([]);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (selectedCourse) {
      fetchIntakes(selectedCourse);
      setSelectedIntake(''); // Reset intake filter when course changes
    } else {
      setIntakes([]);
      setSelectedIntake('');
    }
  }, [selectedCourse, fetchIntakes]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when search changes
  };

  const handleCourseFilterChange = (event) => {
    const courseId = event.target.value;
    setSelectedCourse(courseId);
    setSelectedIntake(''); // Reset intake when course changes
    setPage(0); // Reset to first page when filter changes
  };

  const handleIntakeFilterChange = (event) => {
    const intakeId = event.target.value;
    setSelectedIntake(intakeId);
    setPage(0); // Reset to first page when filter changes
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = data.map((d) => d._id);
      setSelected(newSelected);
    } else {
      setSelected([]);
    }
  };

  const handleCheckboxClick = (event, id) => {
    const idx = selected.indexOf(id);
    let newSelected = [];
    if (idx === -1) {
      newSelected = [...selected, id];
    } else {
      newSelected = selected.filter((s) => s !== id);
    }
    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const handleAddNew = () => {
    navigate('/app/classrooms/add');
  };

  const handleManage = (id) => {
    navigate(`/app/classrooms/detail/${id}`);
  };

  // Check if user has any action permissions
  const hasAnyAction = useMemo(() => {
    return hasPermission(user, 'classrooms', 'U') || hasPermission(user, 'classrooms', 'D');
  }, [user]);

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await classroomAPI.delete(id);
        fetchData();
        showSuccessSwal('Classroom deleted successfully');
      } catch (error) {
        console.error(error);
        showErrorSwal(error.message || 'Error deleting classroom');
      }
    }
  };

  return (
    <MainCard
      title={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span>Classrooms</span>
          {hasPermission(user, 'classrooms', 'C') && (
            <Button onClick={handleAddNew} variant="contained" startIcon={<FileAddOutlined />} size="small">
              Add Classroom
            </Button>
          )}
        </Box>
      }
    >
      <Box sx={{ marginBottom: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField 
          label="Search" 
          variant="outlined" 
          onChange={handleSearch} 
          sx={{ minWidth: 300, maxWidth: 400 }} 
        />
        <FormControl variant="outlined" sx={{ minWidth: 200 }}>
          <InputLabel>Course Filter</InputLabel>
          <Select
            value={selectedCourse}
            onChange={handleCourseFilterChange}
            label="Course Filter"
          >
            <MenuItem value="">
              <em>All Courses</em>
            </MenuItem>
            {courses.map((course) => (
              <MenuItem key={course._id} value={course._id}>
                {course.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl variant="outlined" sx={{ minWidth: 200 }} disabled={!selectedCourse}>
          <InputLabel>Intake Filter</InputLabel>
          <Select
            value={selectedIntake}
            onChange={handleIntakeFilterChange}
            label="Intake Filter"
          >
            <MenuItem value="">
              <em>All Intakes</em>
            </MenuItem>
            {intakes.map((intake) => (
              <MenuItem key={intake._id} value={intake._id}>
                {intake.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < data.length}
                  checked={selected.length === data.length && data.length > 0}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell>Classroom Name</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Intake</TableCell>
              <TableCell>No of Students</TableCell>
              {hasAnyAction && <TableCell>Action</TableCell>}
            </TableRow>
          </TableHead>
          {loading && <LinearProgress sx={{ width: '100%' }} />}
          <TableBody>
            {data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((classroom) => (
                <TableRow key={classroom._id} selected={isSelected(classroom._id)}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={isSelected(classroom._id)} onChange={(e) => handleCheckboxClick(e, classroom._id)} />
                  </TableCell>
                  <TableCell>{classroom.name}</TableCell>
                  <TableCell>{classroom.courseId?.name || 'N/A'}</TableCell>
                  <TableCell>{classroom.batchId?.name || 'N/A'}</TableCell>
                  <TableCell>{classroom.studentCount || 0}</TableCell>
                  {hasAnyAction && (
                    <TableCell>
                      {hasPermission(user, 'classrooms', 'U') && (
                        <Button
                          variant="outlined"
                          style={{ marginRight: '8px' }}
                          color="warning"
                          startIcon={<EditOutlined />}
                          size="small"
                          onClick={() => handleManage(classroom._id)}
                        >
                          Manage
                        </Button>
                      )}
                      {hasPermission(user, 'classrooms', 'D') && (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteOutlined />}
                          size="small"
                          onClick={() => handleDelete(classroom._id)}
                        >
                          Delete
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </MainCard>
  );
};

export default View;
