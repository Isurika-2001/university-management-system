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
import { DownloadOutlined } from '@ant-design/icons'; // Remove SearchOutlined
// import { useNavigate } from 'react-router-dom';
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
  // const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    // Fetch data from API
    try {
      const response = await fetch(config.apiUrl + 'api/course_registrations', {
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
        return order === 'desc' ? (a, b) => b.courseReg_no - a.courseReg_no : (a, b) => a.courseReg_no - b.courseReg_no;
      case 'reg_id':
        return order === 'desc'
          ? (a, b) => b.studentId.registration_no - a.studentId.registration_no
          : (a, b) => a.studentId.registration_no - b.studentId.registration_no;
      case 'name':
        return order === 'desc'
          ? (a, b) => b.studentId.firstName.localeCompare(a.studentId.firstName) || b.studentId.lastName.localeCompare(a.studentId.lastName)
          : (a, b) =>
              a.studentId.firstName.localeCompare(b.studentId.firstName) || a.studentId.lastName.localeCompare(b.studentId.lastName);
      case 'course':
        return order === 'desc'
          ? (a, b) => b.courseId.name.localeCompare(a.courseId.name)
          : (a, b) => a.courseId.name.localeCompare(b.courseId.name);
      case 'batch':
        return order === 'desc'
          ? (a, b) => b.batchId.name.localeCompare(a.batchId.name)
          : (a, b) => a.batchId.name.localeCompare(b.batchId.name);
      case 'contact':
        return order === 'desc'
          ? (a, b) => b.studentId.mobile.localeCompare(a.mobile)
          : (a, b) => a.studentId.mobile.localeCompare(b.studentId.mobile);
      case 'address':
        return order === 'desc'
          ? (a, b) => b.studentId.address.localeCompare(a.studentId.address)
          : (a, b) => a.studentId.address.localeCompare(b.studentId.address);
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
      const newSelecteds = data.map((courseReg) => courseReg.id);
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
      (courseReg) =>
        courseReg.studentId.firstName.toLowerCase().includes(term) ||
        courseReg.studentId.lastName.toLowerCase().includes(term) ||
        courseReg.studentId.lastName.toLowerCase().includes(term) ||
        courseReg.studentId.nic.toLowerCase().includes(term) ||
        courseReg.studentId.mobile.toLowerCase().includes(term) ||
        courseReg.studentId.address.toLowerCase().includes(term) ||
        courseReg.courseId.name.toLowerCase().includes(term) ||
        courseReg.batchId.name.toLowerCase().includes(term)
    );
    setFilteredData(filteredValues);
  };

  // const handleClickAddNew = () => {
  //   navigate('/app/course-registrations/add');
  // };

  // const handleViewRow = (id) => {
  //   // Navigate to detailed view of the row with provided id
  //   navigate('/app/course-registrations/update?id=' + id);
  // };

  const exportToCSV = () => {
    let exportData = [];

    if (filteredData.length > 0) {
      exportData = filteredData;
    } else {
      exportData = data.filter((courseReg) => selected.includes(courseReg.id));
    }

    const csvHeader = ['Student ID', 'Registration ID', 'Name', 'Course', 'Batch', 'Contact', 'Address'].join(','); // Header row
    const csvData = exportData.map((courseReg) =>
      [
        courseReg.studentId.registration_no,
        courseReg.courseReg_no,
        courseReg.studentId.firstName + ' ' + courseReg.studentId.lastName,
        courseReg.courseId.name,
        courseReg.batchId.name,
        courseReg.studentId.mobile,
        courseReg.studentId.address
      ].join(',')
    );
    // Combine header and data rows
    const csvContent = csvHeader + '\n' + csvData.join('\n');
    // Create a Blob object with CSV content
    const blob = new Blob([csvContent], { type: 'text/csv' });
    // Create a temporary anchor element to initiate the download
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = 'courseReg_data.csv';
    // Trigger the download
    document.body.appendChild(link);
    link.click();
    // Cleanup
    document.body.removeChild(link);
  };

  return (
    <MainCard title="Course Registration List">
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
          {/* <Button onClick={handleClickAddNew} variant="contained" startIcon={<FileAddOutlined />}>
            Add New
          </Button> */}
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
                  STU_ID
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'reg_id'}
                  direction={orderBy === 'reg_id' ? order : 'asc'}
                  onClick={() => handleSort('reg_id', 'reg_id')}
                >
                  REG_ID
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
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'course'}
                  direction={orderBy === 'course' ? order : 'asc'}
                  onClick={() => handleSort('course')}
                >
                  Course
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'batch'}
                  direction={orderBy === 'batch' ? order : 'asc'}
                  onClick={() => handleSort('batch')}
                >
                  Batch
                </TableSortLabel>
              </TableCell>
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
              {/* <TableCell>Action</TableCell> Add column for actions */}
            </TableRow>
          </TableHead>
          {loading && <LinearProgress sx={{ width: '100%' }} />}
          <TableBody>
            {stableSort(filteredData.length > 0 ? filteredData : data, getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((courseReg) => (
                <TableRow key={courseReg.id} selected={isSelected(courseReg.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={isSelected(courseReg.id)} onChange={(event) => handleCheckboxClick(event, courseReg.id)} />
                  </TableCell>
                  <TableCell>{courseReg.courseReg_no}</TableCell>
                  <TableCell>{courseReg.studentId.registration_no}</TableCell>
                  <TableCell>{courseReg.studentId.firstName + ` ` + courseReg.studentId.lastName}</TableCell>
                  <TableCell>{courseReg.studentId.nic}</TableCell>
                  <TableCell>{courseReg.courseId.name}</TableCell>
                  <TableCell>{courseReg.batchId.name}</TableCell>
                  <TableCell>{courseReg.studentId.mobile}</TableCell>
                  <TableCell>{courseReg.studentId.address}</TableCell>
                  {/* <TableCell>
                    <Button
                      variant="outlined"
                      style={{
                        marginRight: '8px'
                      }}
                      color="primary"
                      startIcon={<EditOutlined />}
                      onClick={() => handleViewRow(courseReg._id)}
                    >
                      Edit
                    </Button>
                    <Button variant="outlined" color="error" startIcon={<DeleteOutlined />} onClick={() => handleViewRow(courseReg.id)}>
                      Delete
                    </Button>
                  </TableCell> */}
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
