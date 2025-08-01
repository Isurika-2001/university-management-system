import React, { useState, useEffect } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import DataTable from 'components/DataTable';
import { apiRoutes } from '../../config';
import { useAuthContext } from 'context/useAuthContext';
import { useNavigate } from 'react-router-dom';

const View = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState([]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');

  const [courses, setCourses] = useState([]);
  const [batches, setBatches] = useState([]);

  // Sorting state
  const [orderBy, setOrderBy] = useState('courseReg_no');
  const [order, setOrder] = useState('asc');

  const { user } = useAuthContext();
  const navigate = useNavigate();

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // Fetch registrations whenever filters change
  useEffect(() => {
    fetchData();
  }, [page, rowsPerPage, debouncedSearchTerm, courseFilter, batchFilter, orderBy, order]);

  // Fetch courses and batches on mount
  useEffect(() => {
    fetchCourseData();
    fetchBatchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const params = new URLSearchParams();
    params.append('page', page + 1);
    params.append('limit', rowsPerPage);
    if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
    if (courseFilter) params.append('courseId', courseFilter);
    if (batchFilter) params.append('batchId', batchFilter);
    params.append('sortBy', orderBy);
    params.append('sortOrder', order);

    try {
      const response = await fetch(`${apiRoutes.courseRegistrationRoute}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) throw new Error('Error fetching registrations');

      const json = await response.json();
      setData(json.data || []);
      setTotalCount(json.total || 0);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  const fetchCourseData = async () => {
    try {
      const response = await fetch(apiRoutes.courseRoute, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) throw new Error('Error fetching courses');
      const data = await response.json();
      setCourses(data || []);
    } catch (error) {
      console.error(error.message);
    }
  };

  const fetchBatchData = async () => {
    try {
      const response = await fetch(apiRoutes.batchRoute, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) throw new Error('Error fetching batches');

      const result = await response.json();
      const batchArray = result.data;

      // Filter unique batch names
      const uniqueBatches = [];
      const namesSet = new Set();

      batchArray.forEach((batch) => {
        if (!namesSet.has(batch.name)) {
          namesSet.add(batch.name);
          uniqueBatches.push(batch);
        }
      });

      setBatches(uniqueBatches);
    } catch (error) {
      console.error('Fetch batch error:', error.message);
    }
  };

  const handleChangePage = (_event, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
    } else if (filterKey === 'batchId') {
      setBatchFilter(value);
    }
    setPage(0);
  };

  const handleSelectionChange = (newSelected) => {
    setSelected(newSelected);
  };

  const exportToCSV = async () => {
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (courseFilter) params.append('courseId', courseFilter);
    if (batchFilter) params.append('batchId', batchFilter);

    try {
      const response = await fetch(`${apiRoutes.courseRegistrationRoute}export?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        }
      });

      if (!response.ok) throw new Error('Error exporting registrations');

      const json = await response.json();
      const exportData = json.data || [];

      if (exportData.length === 0) {
        console.log('No data to export.');
        return;
      }

      // Prepare CSV
      const csvHeader = ['Registration ID', 'Student ID', 'Name', 'NIC', 'Course', 'Batch', 'Contact', 'Address'].join(',');
      const csvData = exportData.map((reg) =>
        [
          reg.courseRegNo ?? '',
          reg.studentId ?? '',
          reg.studentName ?? '',
          reg.nic ?? '',
          reg.course ?? '',
          reg.batch ?? '',
          reg.contact ?? '',
          reg.address ?? ''
        ].join(',')
      );

      const csvContent = csvHeader + '\n' + csvData.join('\n');

      // Download as file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.href = url;
      link.setAttribute('download', 'course_registrations_export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error.message);
    }
  };

  const handleRowClick = (row) => {
    navigate('/app/course-registrations/update?id=' + row.student._id);
  };

  // Define columns for the DataTable
  const columns = [
    { key: 'courseReg_no', label: 'Reg ID' },
    { key: 'student.registration_no', label: 'Student ID', render: (_value, row) => row.student?.registration_no || '' },
    { 
      key: 'studentName', 
      label: 'Name',
      render: (_value, row) => `${row.student?.firstName || ''} ${row.student?.lastName || ''}`
    },
    { key: 'student.nic', label: 'NIC', render: (_value, row) => row.student?.nic || ''
     },
    { key: 'course.name', label: 'Course', render: (_value, row) => row.course?.name || '' },
    { key: 'batch.name', label: 'Batch', render: (_value, row) => row.batch?.name || '' },
    { key: 'student.mobile', label: 'Contact', render: (_value, row) => row.student?.mobile || '' },
    { key: 'student.address', label: 'Address', render: (_value, row) => row.student?.address || '' }
  ];

  // Define filters
  const filters = [
    {
      key: 'courseId',
      label: 'Course Filter',
      allLabel: 'All Courses',
      options: courses.map(course => ({ value: course._id, label: course.name }))
    },
    {
      key: 'batchId',
      label: 'Batch Filter',
      allLabel: 'All Batches',
      options: batches.map(batch => ({ value: batch._id, label: batch.name }))
    }
  ];

  // Define sortable columns
  const sortableColumns = ['courseReg_no', 'student.registration_no', 'studentName', 'student.nic', 'course.name', 'batch.name', 'student.mobile', 'student.address'];

  return (
    <DataTable
      title="Course Registration List"
      data={data}
      loading={loading}
      totalCount={totalCount}
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
      filterValues={{ courseId: courseFilter, batchId: batchFilter }}
      onFilterChange={handleFilterChange}
      columns={columns}
      onRowClick={handleRowClick}
      onSelectionChange={handleSelectionChange}
      selected={selected}
      searchPlaceholder="Search"
      exportFunction={exportToCSV}
      exportButtonText="Export"
      exportButtonIcon={<UploadOutlined />}
      showSearch={true}
      showFilters={true}
      showActions={true}
      showPagination={true}
      showSelection={true}
      emptyMessage="No course registrations found"
    />
  );
};

export default View;
