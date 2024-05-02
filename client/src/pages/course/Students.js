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
import { DownloadOutlined, FileAddOutlined, EditOutlined } from '@ant-design/icons'; // Remove SearchOutlined
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';

const Students = () => {
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

  const fetchData = () => {
    // Fetch data from API

    // Dummy student data
    setTimeout(() => {
      const data = [
        { id: 1, name: 'John Doe', age: 20, grade: 'A' },
        { id: 2, name: 'Jane Smith', age: 21, grade: 'B' },
        { id: 3, name: 'Michael Johnson', age: 22, grade: 'C' },
        { id: 4, name: 'Emily Davis', age: 19, grade: 'A' },
        { id: 5, name: 'James Wilson', age: 20, grade: 'B' },
        { id: 6, name: 'Jessica Brown', age: 22, grade: 'B' },
        { id: 7, name: 'Matthew Taylor', age: 21, grade: 'A' },
        { id: 8, name: 'Sophia Martinez', age: 20, grade: 'C' },
        { id: 9, name: 'William Garcia', age: 19, grade: 'B' },
        { id: 10, name: 'Olivia Hernandez', age: 22, grade: 'A' }
      ];
      setData(data);
      setLoading(false); // Set loading to false when data is fetched
    }, 2000); // Simulating a delay of 2 seconds
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrderBy(property);
    setOrder(isAsc ? 'desc' : 'asc');
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

  const getComparator = (order, orderBy) => {
    return order === 'desc' ? (a, b) => descendingComparator(a, b, orderBy) : (a, b) => -descendingComparator(a, b, orderBy);
  };

  const descendingComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
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
    const filteredValues = data.filter((student) => student.name.toLowerCase().includes(term));
    setFilteredData(filteredValues);
  };

  const handleClickAddNew = () => {
    navigate('/app/students/add');
  };

  const handleViewRow = (id) => {
    // Navigate to detailed view of the row with provided id
    navigate('/app/students/update?id=' + id);
  };

  const exportToCSV = () => {
    let exportData = [];

    if (filteredData.length > 0) {
      exportData = filteredData;
    } else {
      exportData = data.filter((student) => selected.includes(student.id));
    }

    const csvHeader = ['ID', 'Name', 'Age', 'Grade'].join(','); // Header row
    const csvData = exportData.map((student) => [student.id, student.name, student.age, student.grade].join(','));
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
            style={{ marginRight: '8px' }}
            disabled={selected.length === 0}
            onClick={exportToCSV}
            startIcon={<DownloadOutlined />}
          >
            Export
          </Button>
          <Button onClick={handleClickAddNew} variant="contained" startIcon={<FileAddOutlined />}>
            Add New
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
                <TableSortLabel active={orderBy === 'id'} direction={orderBy === 'id' ? order : 'asc'} onClick={() => handleSort('id')}>
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
                <TableSortLabel active={orderBy === 'age'} direction={orderBy === 'age' ? order : 'asc'} onClick={() => handleSort('age')}>
                  Age
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'grade'}
                  direction={orderBy === 'grade' ? order : 'asc'}
                  onClick={() => handleSort('grade')}
                >
                  Grade
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
                  <TableCell>{student.id}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>{student.age}</TableCell>
                  <TableCell>{student.grade}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      color="primary"
                      startIcon={<EditOutlined />}
                      onClick={() => handleViewRow(student.id)}
                    >
                      Edit
                    </Button>
                  </TableCell> {/* Add button to view row */}
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

export default Students;
