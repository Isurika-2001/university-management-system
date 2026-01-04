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
  TextField, // Import TextField for input field
  Chip
} from '@mui/material';
import { FileAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'; // Remove SearchOutlined
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import { useAuthContext } from 'context/useAuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { coursesAPI } from '../../api/courses';
import { apiRoutes } from '../../config';
import { CircularProgress } from '@mui/material';

const View = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [data, setData] = useState([]);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false); // New state for delete loading
  const navigate = useNavigate();
  useAuthContext();

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

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const data = await coursesAPI.getAll();
      console.log('Data:', data);
      setData(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setLoading(false);
    }
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
      const newSelecteds = data.map((course) => course.id);
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
      (course) => course.name.toLowerCase().includes(term) || course.description.toLowerCase().includes(term)
    );
    setFilteredData(filteredValues);
  };

  const handleClickAddNew = () => {
    navigate('/app/courses/add');
  };

  const handleViewRow = (id) => {
    // Navigate to detailed view of the row with provided id
    navigate(`/app/courses/update/${id}`);
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
        setIsDeleting(true); // Set loading true
        const response = await fetch(`${apiRoutes.courseRoute}${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include' // Cookies are sent automatically
        });

        const data = await response.json();

        if (response.ok) {
          // Remove from UI
          setData((prev) => prev.filter((batch) => batch._id !== id));
          showSuccessSwal('Course has been deleted successfully');
        } else {
          showErrorSwal(data.message || 'Failed to delete course');
        }
      } catch (error) {
        console.error(error);
        showErrorSwal('Something went wrong');
      } finally {
        setIsDeleting(false); // Set loading false
      }
    }
  };

  // const exportToCSV = () => {
  //   let exportData = [];

  //   if (filteredData.length > 0) {
  //     exportData = filteredData;
  //   } else {
  //     exportData = data.filter((course) => selected.includes(course.id));
  //   }

  //   const csvHeader = ['Name', 'Description'].join(','); // Header row
  //   const csvData = exportData.map((course) => [course.name, course.description].join(','));
  //   // Combine header and data rows
  //   const csvContent = csvHeader + '\n' + csvData.join('\n');
  //   // Create a Blob object with CSV content
  //   const blob = new Blob([csvContent], { type: 'text/csv' });
  //   // Create a temporary anchor element to initiate the download
  //   const link = document.createElement('a');
  //   link.href = window.URL.createObjectURL(blob);
  //   link.download = 'course_data.csv';
  //   // Trigger the download
  //   document.body.appendChild(link);
  //   link.click();
  //   // Cleanup
  //   document.body.removeChild(link);
  // };

  return (
    <MainCard
      title={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span>Course List</span>
          <Button onClick={handleClickAddNew} variant="contained" startIcon={<FileAddOutlined />} size="small">
            Add Course
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
                  checked={selected.length === data.length}
                  onChange={handleSelectAllClick}
                />
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
                <TableSortLabel
                  active={orderBy === 'code'}
                  direction={orderBy === 'code' ? order : 'asc'}
                  onClick={() => handleSort('code')}
                >
                  Course Code
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'description'}
                  direction={orderBy === 'description' ? order : 'asc'}
                  onClick={() => handleSort('description')}
                >
                  Description
                </TableSortLabel>
              </TableCell>
              <TableCell>Credits</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Batch Types</TableCell>
              <TableCell>Action</TableCell> {/* Add column for actions */}
            </TableRow>
          </TableHead>
          {loading && <LinearProgress sx={{ width: '100%' }} />}
          <TableBody>
            {stableSort(filteredData.length > 0 ? filteredData : data, getComparator(order, orderBy))
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((course) => (
                <TableRow key={course.id} selected={isSelected(course.id)}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={isSelected(course.id)} onChange={(event) => handleCheckboxClick(event, course.id)} />
                  </TableCell>
                  <TableCell>{course.name}</TableCell>
                  <TableCell>{course.code}</TableCell>
                  <TableCell>{course.description}</TableCell>
                  <TableCell>{course.courseCredits || 'N/A'}</TableCell>
                  <TableCell>{course.courseDuration || 'N/A'}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      {course.weekdayBatch && <Chip label="Weekday" size="small" color="primary" />}
                      {course.weekendBatch && <Chip label="Weekend" size="small" color="secondary" />}
                      {!course.weekdayBatch && !course.weekendBatch && <Chip label="Not specified" size="small" variant="outlined" />}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      style={{
                        marginRight: '8px'
                      }}
                      color="warning"
                      startIcon={<EditOutlined />}
                      onClick={() => handleViewRow(course._id)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={isDeleting ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlined />}
                      onClick={() => handleDelete(course._id)}
                      disabled={isDeleting}
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
