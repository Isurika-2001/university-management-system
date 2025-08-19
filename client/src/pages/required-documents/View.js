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
  Tooltip
} from '@mui/material';
import { 
  EditOutlined, 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import MainCard from 'components/MainCard';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { requiredDocumentsAPI } from '../../api/requiredDocuments';

const RequiredDocumentsView = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selected, setSelected] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');


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

  const showSuccessSwal = (e) => {
    Toast.fire({
      icon: 'success',
      title: e
    });
  };

  const showErrorSwal = (e) => {
    Toast.fire({
      icon: 'error',
      title: e
    });
  };

  // Debounce searchTerm
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
        page: page + 1,
        limit: rowsPerPage,
        sortBy: sortBy,
        sortOrder: sortOrder,
        ...(debouncedSearchTerm && { search: debouncedSearchTerm })
      };

      const result = await requiredDocumentsAPI.getAll(params);
      console.log('Required documents API response:', result);
      setData(result.data || result);
      setTotalCount(result.pagination?.totalItems || result.total || result.length || 0);
      console.log('Set total count:', result.pagination?.totalItems || result.total || result.length || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error.message);
      setLoading(false);
    }
  }

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(0);
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
      const newSelecteds = Array.isArray(data) ? data.map((doc) => doc._id) : [];
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



  const handleDelete = async (id) => {
    try {
      await requiredDocumentsAPI.delete(id);
      showSuccessSwal('Document deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting document:', error);
      showErrorSwal('Failed to delete document');
    }
  };

  return (
    <>
      <MainCard title="Required Documents Management">
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            <TextField 
              label="Search" 
              variant="outlined" 
              onChange={handleSearch} 
              value={searchTerm} 
              sx={{ width: 300 }} 
            />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                         <Button 
               onClick={() => navigate('/app/required-documents/add')} 
               variant="contained" 
               startIcon={<PlusOutlined />}
             >
               Add Document
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
                    onClick={() => handleSort('name')}
                  >
                    Document Name
                    <IconButton size="small" sx={{ ml: 0.5, color: sortBy === 'name' ? 'primary.main' : 'inherit' }}>
                      {renderSortIcon('name')}
                    </IconButton>
                  </Box>
                </TableCell>
                                 <TableCell>Description</TableCell>
                 <TableCell>Type</TableCell>
                 <TableCell>Required</TableCell>
                 <TableCell>Max Size (MB)</TableCell>
                 <TableCell>Allowed Extensions</TableCell>
                 <TableCell>Created Date</TableCell>
                 <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            {loading && <LinearProgress sx={{ width: '100%' }} />}
            <TableBody>
              {Array.isArray(data) && data.map((document) => (
                <TableRow key={document._id} selected={isSelected(document._id)}>
                  <TableCell padding="checkbox">
                    <Checkbox checked={isSelected(document._id)} onChange={(event) => handleCheckboxClick(event, document._id)} />
                  </TableCell>
                                     <TableCell>{document.name}</TableCell>
                   <TableCell>
                     <Tooltip title={document.description || 'No description available'}>
                       <Box sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                         {document.description || 'N/A'}
                       </Box>
                     </Tooltip>
                   </TableCell>
                   <TableCell>
                     <Chip 
                       label={document.type || 'N/A'} 
                       color="primary" 
                       variant="outlined" 
                       size="small" 
                     />
                   </TableCell>
                   <TableCell>
                     <Chip 
                       label={document.isRequired ? 'Required' : 'Optional'} 
                       color={document.isRequired ? 'error' : 'success'} 
                       variant="outlined" 
                       size="small" 
                     />
                   </TableCell>
                   <TableCell>{document.maxFileSize || 'N/A'}</TableCell>
                   <TableCell>
                     {Array.isArray(document.allowedExtensions) 
                       ? document.allowedExtensions.join(', ') 
                       : document.allowedExtensions || 'N/A'}
                   </TableCell>
                   <TableCell>
                     {document.createdAt ? new Date(document.createdAt).toLocaleDateString() : 'N/A'}
                   </TableCell>
                  <TableCell>
                                         <Button
                       variant="outlined"
                       style={{ marginRight: '8px' }}
                       color="primary"
                       startIcon={<EditOutlined />}
                       onClick={() => navigate(`/app/required-documents/update?id=${document._id}`)}
                     >
                       Edit
                     </Button>
                     <Button
                       variant="outlined"
                       color="error"
                       startIcon={<DeleteOutlined />}
                       onClick={() => handleDelete(document._id)}
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
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
                 />
         {/* Debug info */}
         <div style={{ padding: '10px', fontSize: '12px', color: '#666' }}>
           Debug: Page {page}, Rows per page {rowsPerPage}, Total count {totalCount}, Data length {data.length}
         </div>
       </MainCard>
     </>
   );
 };

export default RequiredDocumentsView;
