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
  MenuItem
} from '@mui/material';
import { UploadOutlined } from '@ant-design/icons';
import MainCard from 'components/MainCard';
import { apiRoutes } from '../../config';
import { useAuthContext } from 'context/useAuthContext';
import { useNavigate } from 'react-router-dom';

const View = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [courseFilter, setCourseFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');

  const [courses, setCourses] = useState([]); // store courses
  const [batches, setBatches] = useState([]); // store batches

  const { user } = useAuthContext();
  
  const navigate = useNavigate();

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch registrations whenever filters change
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, debouncedSearchTerm, courseFilter, batchFilter]);

  // Fetch courses and batches on mount
  useEffect(() => {
    fetchCourseData();
    fetchBatchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('page', page + 1);
    params.append('limit', rowsPerPage);
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    if (courseFilter) params.append('courseId', courseFilter);
    if (batchFilter) params.append('batchId', batchFilter);

    try {
      const response = await fetch(`${apiRoutes.courseRegistrationRoute}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) throw new Error('Error fetching registrations');

      const json = await response.json();
      setData(json.data || []);
      setTotalCount(json.total || 0);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  const fetchCourseData = async () => {
    try {
      const response = await fetch(apiRoutes.courseRoute, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) throw new Error('Error fetching courses');
      const data = await response.json();
      setCourses(data || []);
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchBatchData = async () => {
    try {
      const response = await fetch(apiRoutes.batchRoute, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) throw new Error('Error fetching batches');

      const result = await response.json(); // response is an object with `data` key
      const batchArray = result.data;

      // Filter unique batch names
      const uniqueBatches = [];
      const namesSet = new Set();

      batchArray.forEach((batch) => {
        if (!namesSet.has(batch.name)) {
          namesSet.add(batch.name);
          uniqueBatches.push(batch);
        }
      });

      console.log('unique batches', uniqueBatches);
      setBatches(uniqueBatches);
    } catch (error) {
      console.error('Fetch batch error:', error.message);
    }
  };

  const handleChangePage = (event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(data.map((reg) => reg._id));
    } else {
      setSelected([]);
    }
  };

  const handleCheckboxClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = selected.concat(id);
    } else {
      newSelected = selected.filter((item) => item !== id);
    }

    setSelected(newSelected);
  };

  const isSelected = (id) => selected.includes(id);

  const exportToCSV = async () => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    if (courseFilter) params.append('courseId', courseFilter);
    if (batchFilter) params.append('batchId', batchFilter);

    try {
      const response = await fetch(`${apiRoutes.courseRegistrationRoute}export?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) throw new Error('Error exporting registrations');

      const json = await response.json();
      const exportData = json.data || [];

      if (exportData.length === 0) {
        console.log('No data to export.');
        return;
      }

      // Prepare CSV
      const csvHeader = ['Registration ID', 'Student ID', 'Name', 'NIC', 'Course', 'Batch', 'Contact', 'Address'].join(',');
      const csvData = exportData.map((reg) =>
        [
          reg.courseRegNo ?? '',
          reg.studentId ?? '',
          reg.studentName ?? '',
          reg.nic ?? '',
          reg.course ?? '',
          reg.batch ?? '',
          reg.contact ?? '',
          reg.address ?? ''
        ].join(',')
      );

      const csvContent = csvHeader + '\n' + csvData.join('\n');

      // Download as file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', 'course_registrations_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up memory
    } catch (error) {
      console.error('Export failed:', error.message);
    }
  };

  const handleViewRow = (id) => {
    navigate('/app/course-registrations/update?id=' + id);
  };

  return (
    <MainCard title="Course Registration List">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        {/* Left side: Filters */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField
            label="Search"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: 250 }}
          />

          <TextField
            label="Course Filter"
            variant="outlined"
            select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="">All Courses</MenuItem>
            {courses.map((course) => (
              <MenuItem key={course._id} value={course._id}>
                {course.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Batch Filter"
            variant="outlined"
            select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            sx={{ width: 200 }}
          >
            <MenuItem value="">All Batches</MenuItem>
            {batches.map((batch) => (
              <MenuItem key={batch._id} value={batch._id}>
                {batch.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* Right side: Export button */}
        <Button variant="contained" color="success" onClick={exportToCSV} startIcon={<UploadOutlined />}>
          Export
        </Button>
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
              <TableCell>Reg ID</TableCell>
              <TableCell>Student ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>NIC</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Batch</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Address</TableCell>
            </TableRow>
          </TableHead>
          {loading && <LinearProgress sx={{ width: '100%' }} />}
          <TableBody>
            {data.map((reg) => (
              <TableRow
                key={reg._id}
                selected={isSelected(reg._id)}
                onClick={() => handleViewRow(reg.student._id)}
                hover
                style={{ cursor: 'pointer' }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected(reg._id)}
                    onClick={(e) => e.stopPropagation()} // Prevent row click
                    onChange={(e) => handleCheckboxClick(e, reg._id)}
                  />
                </TableCell>
                <TableCell>{reg.courseReg_no}</TableCell>
                <TableCell>{reg.student?.registration_no}</TableCell>
                <TableCell>{`${reg.student?.firstName} ${reg.student?.lastName}`}</TableCell>
                <TableCell>{reg.student?.nic}</TableCell>
                <TableCell>{reg.course?.name}</TableCell>
                <TableCell>{reg.batch?.name}</TableCell>
                <TableCell>{reg.student?.mobile}</TableCell>
                <TableCell>{reg.student?.address}</TableCell>
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
    </MainCard>
  );
};

export default View;
