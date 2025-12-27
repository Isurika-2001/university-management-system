import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button } from '@mui/material';
import { FileAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import DataTable from 'components/DataTable';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import dayjs from 'dayjs';
import { batchesAPI } from '../../api/batches';
import { coursesAPI } from '../../api/courses';

const View = () => {
  const navigate = useNavigate();

  // Pagination and sorting state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Data state
  const [data, setData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);

  // Selection state
  const [selected, setSelected] = useState([]);

  // Filters and search
  const [courseFilter, setCourseFilter] = useState('');
  const [courses, setCourses] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Sorting state
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');

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

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        ...(debouncedSearchTerm.trim() !== '' && { search: debouncedSearchTerm.trim() }),
        ...(courseFilter && { courseId: courseFilter }),
        page: page + 1, // API is 1-based page index
        limit: rowsPerPage,
        sortBy: orderBy,
        sortOrder: order
      };

      const result = await batchesAPI.getAll(params);

      setData(result.data || []);
      setTotalRows(result.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, debouncedSearchTerm, courseFilter, orderBy, order]);

  // Fetch batches data when page, rowsPerPage, debouncedSearchTerm, courseFilter, or sorting changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const fetchCourseData = async () => {
    try {
      const result = await coursesAPI.getAll();
      setCourses(result || []);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
  };

  const handleSort = (property, sortOrder) => {
    setOrderBy(property);
    setOrder(sortOrder);
    setPage(0);
  };

  const handleFilterChange = (filterKey, value) => {
    if (filterKey === 'courseId') {
      setCourseFilter(value);
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

  const handleSelectionChange = (newSelected) => {
    setSelected(newSelected);
  };

  const handleClickAddNew = () => {
    navigate('/app/intakes/add');
  };

  const handleRowClick = (row) => {
    navigate(`/app/intakes/update/${row._id}`);
  };

  const handleDeleteBatch = async (id) => {
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
        await batchesAPI.delete(id);
        // Remove from UI
        setData((prev) => prev.filter((batch) => batch._id !== id));
        showSuccessSwal('Batch has been deleted successfully');
      } catch (error) {
        console.error(error);
        showErrorSwal(error.message || 'Something went wrong');
      }
    }
  };

  // Define columns for the DataTable
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'courseName', label: 'Course' },
    {
      key: 'orientationDate',
      label: 'Orientation Date',
      render: (value) => (value ? dayjs(value).format('YYYY-MM-DD') : '')
    },
    {
      key: 'startDate',
      label: 'Start Date',
      render: (value) => (value ? dayjs(value).format('YYYY-MM-DD') : '')
    },
    {
      key: 'registrationDeadline',
      label: 'Registration Deadline',
      render: (value) => (value ? dayjs(value).format('YYYY-MM-DD') : '')
    },
    {
      key: 'actions',
      label: 'Action',
      render: (value, row) => (
        <>
          <Button
            variant="outlined"
            color="warning"
            startIcon={<EditOutlined />}
            onClick={(e) => {
              e.stopPropagation();
              handleRowClick(row);
            }}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteBatch(row._id);
            }}
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlined />}
          >
            Delete
          </Button>
        </>
      )
    }
  ];

  // Define filters
  const filters = [
    {
      key: 'courseId',
      label: 'Course Filter',
      allLabel: 'All Courses',
      options: courses.map((course) => ({ value: course._id, label: course.name }))
    }
  ];

  // Define actions
  const actions = [];

  // Define sortable columns
  const sortableColumns = ['name', 'courseName', 'orientationDate', 'startDate', 'registrationDeadline'];

  return (
    <DataTable
      title={
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span>Intake List</span>
          <Button onClick={handleClickAddNew} variant="contained" startIcon={<FileAddOutlined />} size="small">
            Add Intake
          </Button>
        </Box>
      }
      data={data}
      loading={loading}
      totalCount={totalRows}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={handleChangePage}
      onRowsPerPageChange={handleChangeRowsPerPage}
      onSearch={handleSearch}
      onSort={handleSort}
      orderBy={orderBy}
      order={order}
      sortableColumns={sortableColumns}
      filters={filters}
      filterValues={{ courseId: courseFilter }}
      onFilterChange={handleFilterChange}
      columns={columns}
      onRowClick={handleRowClick}
      onSelectionChange={handleSelectionChange}
      selected={selected}
      actions={actions}
      searchPlaceholder="Search"
      showSearch={true}
      showFilters={true}
      showActions={true}
      showPagination={true}
      showSelection={true}
      emptyMessage="No intakes found"
    />
  );
};

export default View;
