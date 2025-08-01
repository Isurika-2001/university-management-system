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
} from '@mui/material';
import { UploadOutlined, DownloadOutlined, EditOutlined, FileAddOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import { apiRoutes } from '../../config';
import { useAuthContext } from 'context/useAuthContext';
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import ImportSummaryModal from './Import-summary-modal';
import { CircularProgress } from '../../../node_modules/@mui/material/index';
import { useLogout } from 'hooks/useLogout';

const View = () => {
  const [page, setPage] = useState(0); // zero-based page index
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const [totalCount, setTotalCount] = useState(0);

  // Sorting state
  const [sortBy, setSortBy] = useState('registration_no');
  const [sortOrder, setSortOrder] = useState('asc');

  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { logout } = useLogout();

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

  // Debounce searchTerm: update debouncedSearchTerm 500ms after user stops typing
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
  }, [page, rowsPerPage, debouncedSearchTerm, sortBy, sortOrder]);

  async function fetchData() {
    setLoading(true);

    const params = new URLSearchParams();
    params.append('page', page + 1); // backend page 1-based
    params.append('limit', rowsPerPage);
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);

    if (debouncedSearchTerm) {
      params.append('search', debouncedSearchTerm);
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
        if (response.status === 401) {
          logout();
          return;
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

  const handleSort = (column) => {
    if (sortBy === column) {
      // If clicking the same column, toggle sort order
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a different column, set it as sortBy and default to asc
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(0); // Reset to first page when sorting changes
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

  const renderSortIcon = (column) => {
    if (sortBy !== column) {
      return null;
    }
    return sortOrder === 'asc' ? <ArrowUpOutlined /> : <ArrowDownOutlined />;
  };

  const handleViewRow = (id) => {
    navigate('/app/course-registrations/update?id=' + id);
  };

  const handleClick = () => {
    navigate('/app/students/add');
  };

  const exportToCSV = async () => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);

    try {
      setIsUploading(true);
      const response = await fetch(`${apiRoutes.studentRoute + 'export'}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) throw new Error('Error exporting students');

      const json = await response.json();
      const exportData = json.data || [];

      const csvHeader = ['Student ID', 'First Name', 'Last Name', 'NIC', 'DOB', 'Address', 'Mobile', 'Home Contact', 'Email'].join(',');
      const csvData = exportData.map((student) =>
        [
          student.registrationNo,
          student.firstName,
          student.lastName,
          student.nic,
          student.dob,
          student.address,
          student.mobile,
          student.homeContact,
          student.email
        ].join(',')
      );

      const csvContent = csvHeader + '\n' + csvData.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'students_export.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export error:', error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const importFromExcel = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx, .xls';

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      try {
        setIsDownloading(true);
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log('Parsed Excel Data:', jsonData);

        // Send to backend API
        const response = await fetch(`${apiRoutes.bulkUploadRoute}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`
          },
          body: JSON.stringify({ data: jsonData })
        });

        const result = await response.json();

        if (response.ok) {
          setSummaryData(result);
          console.log('result', result)
          setShowModal(true);
          fetchData(); // Refresh the table
        } else {
          showErrorSwal(result.message);
        }
      } catch (err) {
        console.error('Import error:', err.message);
        showErrorSwal('Failed to import Excel file');
      } finally {
        setIsDownloading(false);
      }
    };

    input.click(); // Trigger file selector
  };

  return (
    <>
      <MainCard title="Student List">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
          {/* Left side: Filters */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField label="Search" variant="outlined" onChange={handleSearch} value={searchTerm} sx={{ width: 300 }} />
          </Box>
          {/* Right side: Export button */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <Button variant="contained" disabled={isUploading} color="success" onClick={exportToCSV} startIcon={<UploadOutlined />}>
              Export
            </Button>
            <Button
              variant="contained"
              disabled={isDownloading}
              color="info"
              onClick={importFromExcel}
              startIcon={isDownloading ? <CircularProgress size={16} /> : <DownloadOutlined />}
            >
              Import
            </Button>
            <Button onClick={handleClick} variant="contained" startIcon={<FileAddOutlined />}>
              Add New Student
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
                    onClick={() => handleSort('registration_no')}
                  >
                    ID
                    <IconButton size="small" sx={{ ml: 0.5, color: sortBy === 'registration_no' ? 'primary.main' : 'inherit' }}>
                      {renderSortIcon('registration_no')}
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
                    onClick={() => handleSort('fullName')}
                  >
                    Name
                    <IconButton size="small" sx={{ ml: 0.5, color: sortBy === 'fullName' ? 'primary.main' : 'inherit' }}>
                      {renderSortIcon('fullName')}
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
                    onClick={() => handleSort('nic')}
                  >
                    NIC
                    <IconButton size="small" sx={{ ml: 0.5, color: sortBy === 'nic' ? 'primary.main' : 'inherit' }}>
                      {renderSortIcon('nic')}
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
                    onClick={() => handleSort('mobile')}
                  >
                    Contact
                    <IconButton size="small" sx={{ ml: 0.5, color: sortBy === 'mobile' ? 'primary.main' : 'inherit' }}>
                      {renderSortIcon('mobile')}
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
                    onClick={() => handleSort('address')}
                  >
                    Address
                    <IconButton size="small" sx={{ ml: 0.5, color: sortBy === 'address' ? 'primary.main' : 'inherit' }}>
                      {renderSortIcon('address')}
                    </IconButton>
                  </Box>
                </TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            {loading && <LinearProgress sx={{ width: '100%' }} />}
            <TableBody>
              {data.map((student) => (
                <TableRow key={student._id} selected={isSelected(student._id)}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={isSelected(student._id)} onChange={(event) => handleCheckboxClick(event, student._id)} />
                  </TableCell>
                  <TableCell>{student.registration_no || student.registrationNo}</TableCell>
                  <TableCell>{student.firstName + ' ' + student.lastName}</TableCell>
                  <TableCell>{student.nic}</TableCell>
                  <TableCell>{student.mobile}</TableCell>
                  <TableCell>{student.address}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      style={{ marginRight: '8px' }}
                      color="warning"
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
      <ImportSummaryModal open={showModal} onClose={() => setShowModal(false)} importSummary={summaryData} />
    </>
  );
};

export default View;
