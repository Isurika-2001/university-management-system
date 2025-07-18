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
  TableSortLabel,
  LinearProgress,
  TextField // Import TextField for input field
} from '@mui/material';
import { DownloadOutlined, EditOutlined, DeleteOutlined, FileAddOutlined } from '@ant-design/icons'; // Remove SearchOutlined
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import config from '../../config';

const View = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [data, setData] = useState([]);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // Fetch data from API
    try {
      const response = await fetch(config.apiUrl + 'api/students', {
        method: 'GET'
        // headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!response.ok) {
        // if (response.status === 401) {
        //   console.error('Unauthorized access. Logging out.');
        //   logout();
        // }
        if (response.status === 500) {
          console.error('Internal Server Error.');
          // logout();
          return;
        }
        return;
      }

      const data = await response.json();
      console.log('Data:', data);

      setData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setLoading(false);
    }
  }

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrderBy(property);
    setOrder(isAsc ? 'desc' : 'asc');
  };

  const getComparator = (order, orderBy) => {
    switch (orderBy) {
      case 'id':
        return order === 'desc' ? (a, b) => b.registration_no - a.registration_no : (a, b) => a.registration_no - b.registration_no;
      case 'name':
        return order === 'desc'
          ? (a, b) => b.firstName.localeCompare(a.firstName) || b.lastName.localeCompare(a.lastName)
          : (a, b) => a.firstName.localeCompare(b.firstName) || a.lastName.localeCompare(b.lastName);
      case 'nic':
        return order === 'desc' ? (a, b) => b.nic.localeCompare(a.nic) : (a, b) => a.nic.localeCompare(b.nic);
      case 'batch':
        return order === 'desc'
          ? (a, b) => b.batchId.name.localeCompare(a.batchId.name)
          : (a, b) => a.batchId.name.localeCompare(b.batchId.name);
      case 'contact':
        return order === 'desc' ? (a, b) => b.mobile.localeCompare(a.mobile) : (a, b) => a.mobile.localeCompare(b.mobile);
      case 'address':
        return order === 'desc' ? (a, b) => b.address.localeCompare(a.address) : (a, b) => a.address.localeCompare(b.address);
      default:
        return () => 0;
    }
  };

  const stableSort = (array, comparator) => {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
      const order = comparator(a[0], b[0]);
      if (order !== 0) return order;
      return a[1] - b[1];
    });
    return stabilizedThis.map((el) => el[0]);
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
      const newSelecteds = data.map((student) => student.id);
      setSelected(newSelecteds);
    } else {
      setSelected([]);
    }
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

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    // Filter the data based on the search term
    const filteredValues = data.filter(
      (student) =>
        student.firstName.toLowerCase().includes(term) ||
        student.lastName.toLowerCase().includes(term) ||
        student.nic.toLowerCase().includes(term) ||
        student.mobile.toLowerCase().includes(term) ||
        student.address.toLowerCase().includes(term)
    );
    setFilteredData(filteredValues);
  };

  const handleViewRow = (id) => {
    // Navigate to detailed view of the row with provided id
    navigate('/app/course-registrations/update?id=' + id);
  };

  const handleClickAddNew = () => {
    // Navigate to the add new student page
    navigate('/app/students/add');
  };

  // const handleAddNewReg = (id) => {
  //   // Navigate to the add new student page
  //   navigate('/app/course-registrations/update?id=' + id);
  //   console.log(id);
  // };

  const exportToCSV = () => {
    let exportData = [];

    if (filteredData.length > 0) {
      exportData = filteredData;
    } else {
      exportData = data.filter((student) => selected.includes(student.id));
    }

    const csvHeader = ['Student ID', 'Name', 'NIC', 'Contact', 'Address'].join(','); // Header row
    const csvData = exportData.map((student) =>
      [student.registration_no, student.firstName + ' ' + student.lastName, student.nic, student.mobile, student.address].join(',')
    );
    // Combine header and data rows
    const csvContent = csvHeader + '\n' + csvData.join('\n');
    // Create a Blob object with CSV content
    const blob = new Blob([csvContent], { type: 'text/csv' });
    // Create a temporary anchor element to initiate the download
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'student_data.csv';
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    // Cleanup
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
          flexDirection: 'row' // Ensure items are aligned horizontally
        }}
      >
        <TextField label="Search" variant="outlined" onChange={handleSearch} />
        <div>
          <Button
            variant="contained"
            style={{
              marginRight: '8px'
            }}
            color="success"
            text="white"
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
              <TableCell>
                <Checkbox
                  indeterminate={selected.length > 0 && selected.length < data.length}
                  checked={selected.length === data.length}
                  onChange={handleSelectAllClick}
                />
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'id'}
                  direction={orderBy === 'id' ? order : 'asc'}
                  onClick={() => handleSort('id', 'id')}
                >
                  ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'name'}
                  direction={orderBy === 'name' ? order : 'asc'}
                  onClick={() => handleSort('name')}
                >
                  Name
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel active={orderBy === 'nic'} direction={orderBy === 'nic' ? order : 'asc'} onClick={() => handleSort('nic')}>
                  NIC
                </TableSortLabel>
              </TableCell>
              {/* <TableCell>
                <TableSortLabel
                  active={orderBy === 'batch'}
                  direction={orderBy === 'batch' ? order : 'asc'}
                  onClick={() => handleSort('batch')}
                >
                  Batch
                </TableSortLabel>
              </TableCell> */}
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'contact'}
                  direction={orderBy === 'contact' ? order : 'asc'}
                  onClick={() => handleSort('contact')}
                >
                  Contact
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'address'}
                  direction={orderBy === 'address' ? order : 'asc'}
                  onClick={() => handleSort('address')}
                >
                  Address
                </TableSortLabel>
              </TableCell>
              <TableCell>Action</TableCell> {/* Add column for actions */}
            </TableRow>
          </TableHead>
          {loading && <LinearProgress sx={{ width: '100%' }} />}
          <TableBody>
            {stableSort(filteredData.length > 0 ? filteredData : data, getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((student) => (
                <TableRow key={student.id} selected={isSelected(student.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={isSelected(student.id)} onChange={(event) => handleCheckboxClick(event, student.id)} />
                  </TableCell>
                  <TableCell>{student.registration_no}</TableCell>
                  <TableCell>{student.firstName + ` ` + student.lastName}</TableCell>
                  {/* <TableCell>{student.courseId.name}</TableCell> */}
                  <TableCell>{student.nic}</TableCell>
                  <TableCell>{student.mobile}</TableCell>
                  <TableCell>{student.address}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      style={{
                        marginRight: '8px'
                      }}
                      color="primary"
                      startIcon={<EditOutlined />}
                      onClick={() => handleViewRow(student._id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      style={{
                        marginRight: '8px'
                      }}
                      color="error"
                      startIcon={<DeleteOutlined />}
                      disabled
                      // onClick={() => handleAddNewReg(student._id)}
                    >
                      Delete
                    </Button>
                    {/* <Button variant="outlined" color="info" startIcon={<FileAddOutlined />} onClick={() => handleAddNewReg(student._id)}>
                      New
                    </Button> */}
                  </TableCell>
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
