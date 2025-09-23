import React, { useState, useEffect } from 'react';
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
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { 
  UploadOutlined, 
  EditOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import { useAuthContext } from 'context/useAuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { apiRoutes } from 'config';

const EnrollmentsView = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('enrollment_no');
  const [sortOrder, setSortOrder] = useState('asc');
  const [courseFilter, setCourseFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  const navigate = useNavigate();
  const { user } = useAuthContext();

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

  const showErrorSwal = (e) => {
    Toast.fire({
      icon: 'error',
      title: e
    });
  };

  // Debounce searchTerm
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Fetch data whenever page, rowsPerPage, debouncedSearchTerm, sortBy, or sortOrder changes
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, debouncedSearchTerm, sortBy, sortOrder, courseFilter, batchFilter]);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (courseFilter) {
      fetchBatches(courseFilter);
    } else {
      setBatches([]);
      setBatchFilter('');
    }
  }, [courseFilter]);

  async function fetchData() {
    setLoading(true);

    try {
      const params = {
        page: page + 1,
        limit: rowsPerPage,
        sortBy: sortBy,
        sortOrder: sortOrder,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(courseFilter && { courseId: courseFilter }),
        ...(batchFilter && { batchId: batchFilter })
      };

      const queryString = new URLSearchParams(params).toString();
      const response = await fetch(`${apiRoutes.enrollmentRoute}?${queryString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const json = await response.json();
      console.log('Enrollments API response:', json);
      setData(json.data || []);
      setTotalCount(json.pagination?.totalItems || 0);
      console.log('Set total count:', json.pagination?.totalItems || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setLoading(false);
    }
  }

  async function fetchCourses() {
    try {
      const response = await fetch(apiRoutes.courseRoute, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch courses');
      }

      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  }

  async function fetchBatches(courseId) {
    try {
      const response = await fetch(`${apiRoutes.batchRoute}course/${courseId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch batches');
      }

      const data = await response.json();
      setBatches(data);
    } catch (error) {
      console.error('Error fetching batches:', error);
    }
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    console.log('Changing page from', page, 'to', newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log('Changing rows per page from', rowsPerPage, 'to', newRowsPerPage);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = data.map((enrollment) => enrollment._id);
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  };

  const handleCheckboxClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const renderSortIcon = (column) => {
    if (sortBy !== column) {
      return null;
    }
    return sortOrder === 'asc' ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  };

  const exportToCSV = async () => {
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (courseFilter) params.append('courseId', courseFilter);
      if (batchFilter) params.append('batchId', batchFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('format', 'csv');

      const response = await fetch(`${apiRoutes.enrollmentRoute}export?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) throw new Error('Error exporting enrollments');

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'enrollments_export.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export error:', error.message);
      showErrorSwal('Failed to export enrollments');
    }
  };

  const exportToExcel = async () => {
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (courseFilter) params.append('courseId', courseFilter);
      if (batchFilter) params.append('batchId', batchFilter);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortOrder);
      params.append('format', 'excel');

      const response = await fetch(`${apiRoutes.enrollmentRoute}export?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) throw new Error('Error exporting enrollments');

      const blob = await response.blob();
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'enrollments_export.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export error:', error.message);
      showErrorSwal('Failed to export enrollments');
    }
  };

  return (
    <>
      <MainCard 
        title={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span>Enrollments Management</span>
            <Button 
              onClick={() => navigate('/app/enrollments/add')} 
              variant="contained" 
              startIcon={<PlusOutlined />}
              size="small"
            >
              Add Enrollment
            </Button>
          </Box>
        }
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField 
              label="Search" 
              variant="outlined" 
              onChange={handleSearch} 
              value={searchTerm} 
              sx={{ width: 300 }} 
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Course</InputLabel>
              <Select
                value={courseFilter}
                label="Filter by Course"
                onChange={(e) => setCourseFilter(e.target.value)}
              >
                <MenuItem value="">All Courses</MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Batch</InputLabel>
              <Select
                value={batchFilter}
                label="Filter by Batch"
                onChange={(e) => setBatchFilter(e.target.value)}
                disabled={!courseFilter}
              >
                <MenuItem value="">All Batches</MenuItem>
                {batches.map((batch) => (
                  <MenuItem key={batch._id} value={batch._id}>
                    {batch.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Button 
              variant="outlined" 
              color="success" 
              onClick={exportToCSV} 
              startIcon={<UploadOutlined />}
              size="small"
              style={{ display: 'none' }}
            >
              CSV
            </Button>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={exportToExcel} 
              startIcon={<UploadOutlined />}
              size="small"
              style={{ display: 'none' }}
            >
              Excel
            </Button>
          </Box>
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
                <TableCell>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.7 }
                    }} 
                    onClick={() => handleSort('enrollment_no')}
                  >
                    Enrollment No
                    <IconButton size="small" sx={{ ml: 0.5, color: sortBy === 'enrollment_no' ? 'primary.main' : 'inherit' }}>
                      {renderSortIcon('enrollment_no')}
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                      '&:hover': { opacity: 0.7 }
                    }} 
                    onClick={() => handleSort('studentName')}
                  >
                    Student Name
                    <IconButton size="small" sx={{ ml: 0.5, color: sortBy === 'studentName' ? 'primary.main' : 'inherit' }}>
                      {renderSortIcon('studentName')}
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>NIC</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Batch</TableCell>
                <TableCell>Enrollment Date</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            {loading && <LinearProgress sx={{ width: '100%' }} />}
            <TableBody>
              {data.map((enrollment) => (
                <TableRow key={enrollment._id} selected={isSelected(enrollment._id)}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={isSelected(enrollment._id)} onChange={(event) => handleCheckboxClick(event, enrollment._id)} />
                  </TableCell>
                  <TableCell>{enrollment.enrollment_no}</TableCell>
                  <TableCell>{enrollment.student?.firstName} {enrollment.student?.lastName}</TableCell>
                  <TableCell>{enrollment.student?.nic}</TableCell>
                  <TableCell>{enrollment.course?.name}</TableCell>
                  <TableCell>{enrollment.batch?.name}</TableCell>
                  <TableCell>
                    {enrollment.enrollmentDate ? new Date(enrollment.enrollmentDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      style={{ marginRight: '8px' }}
                      color="primary"
                      startIcon={<EditOutlined />}
                      onClick={() => navigate(`/app/enrollments/update?id=${enrollment.studentId}`)}
                    >
                      Manage Enrollment
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteOutlined />}
                      onClick={() => {/* Handle delete */}}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
        {/* Debug info */}
        <div style={{ padding: '10px', fontSize: '12px', color: '#666' }}>
          Debug: Page {page}, Rows per page {rowsPerPage}, Total count {totalCount}, Data length {data.length}
        </div>
      </MainCard>
    </>
  );
};

export default EnrollmentsView;
