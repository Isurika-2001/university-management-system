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
  Chip,
} from '@mui/material';
import { UploadOutlined, DownloadOutlined, EditOutlined, FileAddOutlined, ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import { useAuthContext } from 'context/useAuthContext';

import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import ImportSummaryModal from './Import-summary-modal';
import { CircularProgress } from '../../../node_modules/@mui/material/index';
import { studentsAPI } from '../../api/students';
import { apiRoutes } from '../../config';

const View = () => {
  const [page, setPage] = useState(0); // zero-based page index
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
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

    try {
      const params = {
        page: page + 1, // backend page 1-based
        limit: rowsPerPage,
        sortBy: sortBy,
        sortOrder: sortOrder,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      };

      const json = await studentsAPI.getAll(params);
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
    navigate('/app/students/update?id=' + id);
  };

  const handleClick = () => {
    navigate('/app/students/add');
  };

  const exportToCSV = async () => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    params.append('format', 'csv');

    try {
      setIsUploading(true);
      console.log('Exporting CSV with URL:', `${apiRoutes.studentRoute}export?${params.toString()}`);
      
      const response = await fetch(`${apiRoutes.studentRoute}export?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Error exporting students: ${response.status} ${errorText}`);
      }

      const blob = await response.blob();
      console.log('Blob size:', blob.size);
      console.log('Blob type:', blob.type);
      
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'students_export.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export error:', error.message);
      showErrorSwal('Failed to export students: ' + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const exportToExcel = async () => {
    const params = new URLSearchParams();
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    params.append('sortBy', sortBy);
    params.append('sortOrder', sortOrder);
    params.append('format', 'excel');

    try {
      setIsUploading(true);
      console.log('Exporting Excel with URL:', `${apiRoutes.studentRoute}export?${params.toString()}`);
      
      const response = await fetch(`${apiRoutes.studentRoute}export?${params.toString()}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.token}`
        }
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Error exporting students: ${response.status} ${errorText}`);
      }

      const blob = await response.blob();
      console.log('Blob size:', blob.size);
      console.log('Blob type:', blob.type);
      
      const link = document.createElement('a');
      link.href = window.URL.createObjectURL(blob);
      link.download = 'students_export.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Export error:', error.message);
      showErrorSwal('Failed to export students: ' + error.message);
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
        setIsUploading(true);
        
        // Create FormData for file upload
        const formData = new FormData();
        formData.append('file', file);

        console.log('Uploading file:', file.name);

        // Send to backend API
        const response = await fetch(`${apiRoutes.studentRoute}import`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${user.token}`
          },
          body: formData
        });

        const result = await response.json();

        if (response.ok) {
          setSummaryData(result.data);
          console.log('Import result:', result);
          setShowModal(true);
          fetchData(); // Refresh the table
          
          // Show success message
          Toast.fire({
            icon: 'success',
            title: result.message
          });
        } else {
          showErrorSwal(result.message || 'Failed to import Excel file');
        }
      } catch (err) {
        console.error('Import error:', err.message);
        showErrorSwal('Failed to import Excel file: ' + err.message);
      } finally {
        setIsUploading(false);
      }
    };

    input.click(); // Trigger file selector
  };

  return (
    <>
      <MainCard 
        title={
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span>Student List</span>
            <Button 
              onClick={handleClick} 
              variant="contained" 
              startIcon={<FileAddOutlined />}
              size="small"
            >
              Add Student
            </Button>
          </Box>
        }
      >
        {/* Search and Actions Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 2 }}>
          {/* Search Field */}
          <TextField 
            label="Search" 
            variant="outlined" 
            onChange={handleSearch} 
            value={searchTerm} 
            sx={{ minWidth: 300, flexGrow: 1, maxWidth: 400 }} 
          />
          
          {/* Action Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }}>
            <Button 
              variant="outlined" 
              disabled={isUploading} 
              color="success" 
              onClick={exportToCSV} 
              startIcon={<UploadOutlined />}
              size="small"
              style={{ display: 'none' }}
            >
              CSV
            </Button>
            <Button 
              variant="outlined" 
              disabled={isUploading} 
              color="primary" 
              onClick={exportToExcel} 
              startIcon={<UploadOutlined />}
              size="small"
              style={{ display: 'none' }}
            >
              Excel
            </Button>
            <Button
              variant="outlined"
              disabled={isUploading}
              color="info"
              onClick={importFromExcel}
              startIcon={isUploading ? <CircularProgress size={16} /> : <DownloadOutlined />}
              size="small"
              style={{ display: 'none' }}
            >
              Import
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
                <TableCell>Registration Date</TableCell>
                <TableCell>Status</TableCell>
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
                    {student.registrationDate ? new Date(student.registrationDate).toLocaleDateString() : 'N/A'}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip 
                        label={student.status || 'pending'} 
                        color={
                          student.status === 'completed' ? 'success' : 
                          student.status === 'incomplete' ? 'warning' : 'default'
                        }
                        size="small"
                      />
                      {student.completionStatus && (
                        <Box sx={{ display: 'flex', gap: 0.3 }}>
                          {['step1', 'step2', 'step3', 'step4', 'step5'].map((step, index) => (
                            <Box
                              key={step}
                              sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: student.completionStatus[step] ? 'success.main' : 'grey.300',
                                border: '1px solid',
                                borderColor: student.completionStatus[step] ? 'success.main' : 'grey.400'
                              }}
                              title={`Step ${index + 1}: ${step === 'step1' ? 'Personal Details' : 
                                                        step === 'step2' ? 'Course Enrollment' :
                                                        step === 'step3' ? 'Academic Details' :
                                                        step === 'step4' ? 'Required Documents' : 'Emergency Contact'}`}
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </TableCell>
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
