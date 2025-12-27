import React, { useState, useEffect, useCallback } from 'react';
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
  TextField
} from '@mui/material';
import { FileAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { classroomAPI } from 'api/classrooms';

const View = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const Toast = withReactContent(
    Swal.mixin({
      toast: true,
      position: 'bottom',
      customClass: { popup: 'colored-toast' },
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

  const fetchData = useCallback(async () => {
    try {
      const response = await classroomAPI.getAll();
      if (response?.data) {
        setData(response.data);
        setFilteredData(response.data);
      }
      setLoading(false);
    } catch (error) {
      console.error(error);
      showErrorSwal('Error fetching classrooms');
      setLoading(false);
    }
  }, [setData, setFilteredData, setLoading, showErrorSwal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    const filtered = data.filter(
      (classroom) =>
        classroom.name.toLowerCase().includes(term) ||
        (classroom.courseId?.name || '').toLowerCase().includes(term) ||
        (classroom.batchId?.name || '').toLowerCase().includes(term)
    );
    setFilteredData(filtered);
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
        setData((prev) => prev.filter((d) => d._id !== id));
        showSuccessSwal('Classroom deleted successfully');
      } catch (error) {
        console.error(error);
        showErrorSwal('Error deleting classroom');
      }
    }
  };

  return (
    <MainCard
      title={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span>Classrooms</span>
          <Button onClick={handleAddNew} variant="contained" startIcon={<FileAddOutlined />} size="small">
            Add Classroom
          </Button>
        </Box>
      }
    >
      <Box sx={{ marginBottom: 2 }}>
        <TextField label="Search" variant="outlined" onChange={handleSearch} sx={{ minWidth: 300, maxWidth: 400 }} />
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
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          {loading && <LinearProgress sx={{ width: '100%' }} />}
          <TableBody>
            {(filteredData.length > 0 ? filteredData : data)
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
                  <TableCell>
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
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteOutlined />}
                      size="small"
                      onClick={() => handleDelete(classroom._id)}
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
        count={filteredData.length > 0 ? filteredData.length : data.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </MainCard>
  );
};

export default View;
