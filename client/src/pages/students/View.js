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
  TextField
} from '@mui/material';
import { DownloadOutlined, EditOutlined, FileAddOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import { apiRoutes } from '../../config';
import { useAuthContext } from 'context/useAuthContext';

const View = () => {
  const [page, setPage] = useState(0); // zero-based page index
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();
  const { user } = useAuthContext();

  // Debounce searchTerm: update debouncedSearchTerm 500ms after user stops typing
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Fetch data whenever page, rowsPerPage or debouncedSearchTerm changes
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, debouncedSearchTerm]);

  async function fetchData() {
    setLoading(true);

    const params = new URLSearchParams();
    params.append('page', page + 1); // backend page 1-based
    params.append('limit', rowsPerPage);

    if (debouncedSearchTerm) {
      params.append('name', debouncedSearchTerm);
    }

    try {
      const response = await fetch(`${apiRoutes.studentRoute}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) {
        if (response.status === 500) {
          console.error('Internal Server Error.');
          // Optional: logout or alert user
        }
        setLoading(false);
        return;
      }

      const json = await response.json();
      setData(json.data);
      setTotalCount(json.total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setLoading(false);
    }
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when search term changes
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
      const newSelecteds = data.map((student) => student._id);
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

  const handleViewRow = (id) => {
    navigate('/app/course-registrations/update?id=' + id);
  };

  const handleClickAddNew = () => {
    navigate('/app/students/add');
  };

  const exportToCSV = () => {
    let exportData = data.filter((student) => selected.includes(student._id));

    if (exportData.length === 0) exportData = data; // export all visible if none selected

    const csvHeader = ['Student ID', 'Name', 'NIC', 'Contact', 'Address'].join(',');
    const csvData = exportData.map((student) =>
      [student.registration_no, student.firstName + ' ' + student.lastName, student.nic, student.mobile, student.address].join(',')
    );

    const csvContent = csvHeader + '\n' + csvData.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'student_data.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <MainCard title="Student List">
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 2,
          flexDirection: 'row'
        }}
      >
        <TextField
          label="Search by name"
          variant="outlined"
          onChange={handleSearch}
          value={searchTerm}
          sx={{ width: 300 }}
        />
        <div>
          <Button
            variant="contained"
            style={{ marginRight: '8px' }}
            color="success"
            disabled={selected.length === 0}
            onClick={exportToCSV}
            startIcon={<DownloadOutlined />}
          >
            Export
          </Button>
          <Button onClick={handleClickAddNew} variant="contained" startIcon={<FileAddOutlined />}>
            Add New Student
          </Button>
        </div>
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
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>NIC</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          {loading && <LinearProgress sx={{ width: '100%' }} />}
          <TableBody>
            {data.map((student) => (
              <TableRow key={student._id} selected={isSelected(student._id)}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected(student._id)}
                    onChange={(event) => handleCheckboxClick(event, student._id)}
                  />
                </TableCell>
                <TableCell>{student.registration_no}</TableCell>
                <TableCell>{student.firstName + ' ' + student.lastName}</TableCell>
                <TableCell>{student.nic}</TableCell>
                <TableCell>{student.mobile}</TableCell>
                <TableCell>{student.address}</TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    style={{ marginRight: '8px' }}
                    color="primary"
                    startIcon={<EditOutlined />}
                    onClick={() => handleViewRow(student._id)}
                  >
                    Edit
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
    </MainCard>
  );
};

export default View;
