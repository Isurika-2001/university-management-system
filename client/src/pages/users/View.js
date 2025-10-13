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
  TextField,
  CircularProgress,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { FileAddOutlined, EditOutlined, DeleteOutlined, CheckOutlined } from '@ant-design/icons'; // Remove SearchOutlined
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { formatUserTypes, formatUserTypeName } from '../../utils/userTypeUtils';
import { usersAPI } from '../../api/users';

const View = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [data, setData] = useState([]);
  const [orderBy, setOrderBy] = useState('');
  const [order, setOrder] = useState('asc');
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  // User type filter state
  const [userTypes, setUserTypes] = useState([]);
  const [selectedUserType, setSelectedUserType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const navigate = useNavigate();

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

  // error showErrorSwal
  const showErrorSwal = (e) => {
    Toast.fire({
      icon: 'error',
      title: e
    });
  };

  // error showErrorSwal
  const showSuccessSwal = (e) => {
    Toast.fire({
      icon: 'success',
      title: e
    });
  };

  const fetchData = async () => {
    try {
      const response = await usersAPI.getAll();
      console.log('Response:', response);

      // Handle both old and new response formats
      const users = response.data || response;
      console.log('Users:', users);

      setData(users);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setLoading(false);
    }
  };

  const fetchUserTypes = async () => {
    try {
      const response = await usersAPI.getUserTypes();
      console.log('User types response:', response);

      // Handle both old and new response formats
      const userTypes = response.data || response;
      setUserTypes(formatUserTypes(userTypes));
    } catch (error) {
      console.error('Error fetching user types:', error.message);
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
      const newSelecteds = data.map((user) => user._id);
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
    applyFilters(term, selectedUserType, selectedStatus);
  };

  const handleUserTypeFilter = (event) => {
    const userType = event.target.value;
    setSelectedUserType(userType);
    applyFilters('', userType, selectedStatus);
  };

  const handleStatusFilter = (event) => {
    const status = event.target.value;
    setSelectedStatus(status);
    applyFilters('', selectedUserType, status);
  };

  const applyFilters = (searchTerm = '', userType = '', status = '') => {
    let filteredValues = data;

    // Apply search filter
    if (searchTerm) {
      filteredValues = filteredValues.filter(
        (user) => user.name.toLowerCase().includes(searchTerm) || user.email.toLowerCase().includes(searchTerm)
      );
    }

    // Apply user type filter
    if (userType) {
      filteredValues = filteredValues.filter((user) => user.user_type && user.user_type._id === userType);
    }

    // Apply status filter
    if (status === 'active') {
      filteredValues = filteredValues.filter((user) => user.status === true);
    } else if (status === 'disabled') {
      filteredValues = filteredValues.filter((user) => user.status === false);
    }

    setFilteredData(filteredValues);
  };

  const handleClickAddNew = () => {
    navigate('/app/users/add');
  };

  const handleViewRow = (id) => {
    // Navigate to detailed view of the row with provided id
    navigate(`/app/users/update/${id}`);
  };

  // const exportToCSV = () => {
  //   let exportData = [];

  //   if (filteredData.length > 0) {
  //     exportData = filteredData;
  //   } else {
  //     exportData = data.filter((user) => selected.includes(user.id));
  //   }

  //   const csvHeader = ['Name', 'Email', 'Role'].join(','); // Header row
  //   const csvData = exportData.map((user) => [user.name, user.email, user.user_type].join(','));
  //   // Combine header and data rows
  //   const csvContent = csvHeader + '\n' + csvData.join('\n');
  //   // Create a Blob object with CSV content
  //   const blob = new Blob([csvContent], { type: 'text/csv' });
  //   // Create a temporary anchor element to initiate the download
  //   const link = document.createElement('a');
  //   link.href = window.URL.createObjectURL(blob);
  //   link.download = 'user_data.csv';
  //   // Trigger the download
  //   document.body.appendChild(link);
  //   link.click();
  //   // Cleanup
  //   document.body.removeChild(link);
  // };

  const handleDelete = async (id) => {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, disable user!'
    });

    if (result.isConfirmed) {
      setDeleting(true);
      try {
        const response = await usersAPI.disable(id);
        console.log('Disable user response:', response);
        showSuccessSwal(response.message || 'User disabled successfully');
        // Refetch data to ensure consistency and get updated user data
        fetchData();
      } catch (error) {
        console.error('Error disabling user:', error);
        showErrorSwal(error.message || 'Error disabling user');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selected.length === 0) {
      showErrorSwal('Please select users to disable');
      return;
    }

    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to disable ${selected.length} user(s). This action cannot be undone!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Yes, disable ${selected.length} user(s)!`
    });

    if (result.isConfirmed) {
      setDeleting(true);
      try {
        // Disable users one by one since we don't have a bulk disable endpoint
        const promises = selected.map((id) => usersAPI.disable(id));
        await Promise.all(promises);

        showSuccessSwal(`${selected.length} user(s) disabled successfully`);

        // Clear selection and refetch data
        setSelected([]);
        fetchData();
      } catch (error) {
        console.error('Error disabling users:', error);
        showErrorSwal(error.message || 'Error disabling users');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleEnable = async (id) => {
    // Show confirmation dialog
    const result = await Swal.fire({
      title: 'Enable User?',
      text: 'This will allow the user to log in again. Are you sure?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#28a745',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, enable user!'
    });

    if (result.isConfirmed) {
      setDeleting(true);
      try {
        const response = await usersAPI.enable(id);
        console.log('Enable user response:', response);
        showSuccessSwal(response.message || 'User enabled successfully');
        // Refetch data to ensure consistency and get updated user data
        fetchData();
      } catch (error) {
        console.error('Error enabling user:', error);
        showErrorSwal(error.message || 'Error enabling user');
      } finally {
        setDeleting(false);
      }
    }
  };

  useEffect(() => {
    fetchUserTypes();
    fetchData();
  }, []);

  // Update filtered data when data changes
  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  return (
    <MainCard
      title={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span>User List</span>
          <Button onClick={handleClickAddNew} variant="contained" startIcon={<FileAddOutlined />} size="small">
            Add User
          </Button>
        </Box>
      }
    >
      <Box sx={{ marginBottom: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              label="Search"
              variant="outlined"
              onChange={handleSearch}
              placeholder="Search by name or email"
              sx={{ minWidth: 300, maxWidth: 400 }}
            />
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Role</InputLabel>
              <Select value={selectedUserType} label="Filter by Role" onChange={handleUserTypeFilter}>
                <MenuItem value="">
                  <em>All Roles</em>
                </MenuItem>
                {userTypes.map((userType) => (
                  <MenuItem key={userType._id} value={userType._id}>
                    {userType.displayName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Status</InputLabel>
              <Select value={selectedStatus} label="Filter by Status" onChange={handleStatusFilter}>
                <MenuItem value="">
                  <em>All Statuses</em>
                </MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="disabled">Disabled</MenuItem>
              </Select>
            </FormControl>
          </Box>
          {selected.length > 0 && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" color="secondary" onClick={() => setSelected([])} size="small">
                Clear Selection
              </Button>
              <Button variant="outlined" color="error" startIcon={<DeleteOutlined />} onClick={handleBulkDelete} disabled={deleting}>
                Disable Selected ({selected.length})
              </Button>
            </Box>
          )}
        </Box>
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
                  active={orderBy === 'email'}
                  direction={orderBy === 'email' ? order : 'asc'}
                  onClick={() => handleSort('email')}
                >
                  Email
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'user_type'}
                  direction={orderBy === 'user_type' ? order : 'asc'}
                  onClick={() => handleSort('user_type')}
                >
                  Role
                </TableSortLabel>
              </TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell> {/* Add column for actions */}
            </TableRow>
          </TableHead>
          {loading && <LinearProgress sx={{ width: '100%' }} />}
          <TableBody>
            {console.log('Rendering table with data:', {
              filteredData: filteredData.length,
              data: data.length,
              users: stableSort(filteredData.length > 0 ? filteredData : data, getComparator(order, orderBy)).slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage
              )
            })}
            {stableSort(filteredData.length > 0 ? filteredData : data, getComparator(order, orderBy)).slice(
              page * rowsPerPage,
              page * rowsPerPage + rowsPerPage
            ).length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {loading ? 'Loading users...' : 'No users found'}
                </TableCell>
              </TableRow>
            ) : (
              stableSort(filteredData.length > 0 ? filteredData : data, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user._id} selected={isSelected(user._id)}>
                    <TableCell padding="checkbox">
                      <Checkbox checked={isSelected(user._id)} onChange={(event) => handleCheckboxClick(event, user._id)} />
                    </TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.user_type ? formatUserTypeName(user.user_type.name) : 'N/A'}</TableCell>
                    <TableCell>{user.status === true ? 'Active' : 'Disabled'}</TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        style={{
                          marginRight: '8px'
                        }}
                        color="warning"
                        startIcon={<EditOutlined />}
                        onClick={() => handleViewRow(user._id)}
                      >
                        Edit
                      </Button>
                      {user.status === true ? (
                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={deleting ? <CircularProgress size={16} /> : <DeleteOutlined />}
                          onClick={() => handleDelete(user._id)}
                          disabled={deleting}
                        >
                          {deleting ? 'Disabling...' : 'Disable'}
                        </Button>
                      ) : (
                        <Button
                          variant="outlined"
                          color="success"
                          startIcon={<CheckOutlined />}
                          onClick={() => handleEnable(user._id)}
                          disabled={deleting}
                        >
                          Enable
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
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
      {/* Debug info */}
      <div style={{ padding: '10px', fontSize: '12px', color: '#666' }}>
        Debug: Loading: {loading.toString()}, Data length: {data.length}, Filtered data length: {filteredData.length}
      </div>
    </MainCard>
  );
};

export default View;
