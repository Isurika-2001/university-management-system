import React, { useState, useEffect } from 'react';
import { Button } from '@mui/material';
import { FileAddOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import DataTable from 'components/DataTable';
import { apiRoutes } from '../../config';
import { useAuthContext } from 'context/useAuthContext';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import dayjs from 'dayjs';

const View = () => {
  const { user } = useAuthContext();
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

  // Fetch batches data when page, rowsPerPage, debouncedSearchTerm, courseFilter, or sorting changes
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, debouncedSearchTerm, courseFilter, orderBy, order]);

  // Fetch courses for filter dropdown on mount
  useEffect(() => {
    fetchCourseData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (debouncedSearchTerm.trim() !== '') params.append('search', debouncedSearchTerm.trim());
      if (courseFilter) params.append('courseId', courseFilter);
      params.append('page', page + 1); // API is 1-based page index
      params.append('limit', rowsPerPage);
      params.append('sortBy', orderBy);
      params.append('sortOrder', order);

      const response = await fetch(`${apiRoutes.batchRoute}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) throw new Error('Failed to fetch batches');

      const result = await response.json();

      setData(result.data || []);
      setTotalRows(result.total || 0);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseData = async () => {
    try {
      const response = await fetch(apiRoutes.courseRoute, {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch courses');
      const result = await response.json();
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
    navigate('/app/batches/add');
  };

  const handleRowClick = (row) => {
    navigate('/app/batches/update?id=' + row._id);
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
        const response = await fetch(`${apiRoutes.batchRoute}${id}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        });

        const data = await response.json();

        if (response.ok) {
          // Remove from UI
          setData((prev) => prev.filter((batch) => batch._id !== id));
          showSuccessSwal('Batch has been deleted successfully');
        } else {
          showErrorSwal(data.message || 'Failed to delete batch');
        }
      } catch (error) {
        console.error(error);
        showErrorSwal('Something went wrong');
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
      render: (value) => value ? dayjs(value).format('YYYY-MM-DD') : ''
    },
    { 
      key: 'startDate', 
      label: 'Start Date',
      render: (value) => value ? dayjs(value).format('YYYY-MM-DD') : ''
    },
    { 
      key: 'registrationDeadline', 
      label: 'Registration Deadline',
      render: (value) => value ? dayjs(value).format('YYYY-MM-DD') : ''
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
      options: courses.map(course => ({ value: course._id, label: course.name }))
    }
  ];

  // Define actions
  const actions = [
    {
      label: 'Add New',
      icon: <FileAddOutlined />,
      onClick: handleClickAddNew,
      variant: 'contained',
      color: 'primary'
    }
  ];

  // Define sortable columns
  const sortableColumns = ['name', 'courseName', 'orientationDate', 'startDate', 'registrationDeadline'];

  return (
    <DataTable
      title="Batch List"
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
      emptyMessage="No batches found"
    />
  );
};

export default View;
