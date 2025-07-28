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
  MenuItem,
} from '@mui/material';
import { UploadOutlined, FileAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import { apiRoutes } from '../../config';
import { useAuthContext } from 'context/useAuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const View = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();

  // Pagination and sorting state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Data state
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  // Selection state
  const [selected, setSelected] = useState([]);

  // Filters and search
  const [courseFilter, setCourseFilter] = useState('');
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');  

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

  const showSuccessSwal = (msg) => {
    Toast.fire({ icon: 'success', title: msg });
  };

  const showErrorSwal = (msg) => {
    Toast.fire({ icon: 'error', title: msg });
  };

  // Debounce searchTerm with 500ms delay
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0); // reset page on search
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Fetch batches data when page, rowsPerPage, debouncedSearchTerm or courseFilter changes
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, debouncedSearchTerm, courseFilter]);

  // Fetch courses for filter dropdown on mount
  useEffect(() => {
    fetchCourseData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm.trim() !== '') params.append('search', debouncedSearchTerm.trim());
      if (courseFilter) params.append('courseId', courseFilter);
      params.append('page', page + 1); // API is 1-based page index
      params.append('limit', rowsPerPage);

      const response = await fetch(`${apiRoutes.batchRoute}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch batches');

      const result = await response.json();

      setData(result.data || []);
      setTotalRows(result.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseData = async () => {
    try {
      const response = await fetch(apiRoutes.courseRoute, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch courses');
      const result = await response.json();
      setCourses(result || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCourseFilterChange = (e) => {
    setCourseFilter(e.target.value);
    setPage(0); // reset page on filter change
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
      const newSelecteds = data.map((batch) => batch._id);
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

  const handleClickAddNew = () => {
    navigate('/app/batches/add');
  };

  const handleViewRow = (id) => {
    navigate('/app/batches/update?id=' + id);
  };

  const handleDeleteBatch = async (id) => {
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
        const response = await fetch(`${apiRoutes.batchRoute}${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        const data = await response.json();

        if (response.ok) {
          // Remove from UI
          setData((prev) => prev.filter((batch) => batch._id !== id));
          showSuccessSwal('Batch has been deleted successfully');
        } else {
          showErrorSwal(data.message || 'Failed to delete batch');
        }
      } catch (error) {
        console.error(error);
        showErrorSwal('Something went wrong');
      }
    }
  };

  return (
    <MainCard title="Batch List">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <TextField label="Search" variant="outlined" value={searchTerm} onChange={handleSearchChange} sx={{ minWidth: 200 }} />

          <TextField
            label="Course Filter"
            variant="outlined"
            select
            value={courseFilter}
            onChange={handleCourseFilterChange}
            sx={{ width: 200 }}
          >
            <MenuItem value="">All Courses</MenuItem>
            {courses.map((course) => (
              <MenuItem key={course._id} value={course._id}>
                {course.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            color="success"
            disabled={selected.length === 0}
            onClick={() => alert('Export functionality to implement')}
            startIcon={<UploadOutlined />}
          >
            Export
          </Button>
          <Button variant="contained" startIcon={<FileAddOutlined />} onClick={handleClickAddNew}>
            Add New
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
                  inputProps={{ 'aria-label': 'select all batches' }}
                />
              </TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Course</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          {loading && (
            <TableBody>
              <TableRow>
                <TableCell colSpan={4}>
                  <LinearProgress />
                </TableCell>
              </TableRow>
            </TableBody>
          )}

          {!loading && (
            <TableBody>
              {data.map((batch) => {
                const isItemSelected = isSelected(batch._id);
                return (
                  <TableRow hover key={batch._id} role="checkbox" aria-checked={isItemSelected} selected={isItemSelected} tabIndex={-1}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isItemSelected}
                        onChange={(event) => handleCheckboxClick(event, batch._id)}
                        inputProps={{ 'aria-labelledby': `batch-checkbox-${batch._id}` }}
                      />
                    </TableCell>
                    <TableCell>{batch.name}</TableCell>
                    <TableCell>{batch.courseName}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        color="primary"
                        disabled
                        startIcon={<EditOutlined />}
                        onClick={() => handleViewRow(batch._id)}
                        sx={{ mr: 1 }}
                      >
                        Edit
                      </Button>
                      <Button onClick={() => handleDeleteBatch(batch._id)} variant="outlined" color="error" startIcon={<DeleteOutlined />}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          )}
        </Table>
      </TableContainer>

      <TablePagination
        rowsPerPageOptions={[5, 10, 25]}
        component="div"
        count={totalRows}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </MainCard>
  );
};

export default View;
