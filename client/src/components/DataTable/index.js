import React, { useState, useEffect } from 'react';
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Box,
  Checkbox,
  TablePagination,
  LinearProgress,
  TextField,
  MenuItem,
  TableSortLabel,
  Button
} from '@mui/material';
import MainCard from 'components/MainCard';

const DataTable = ({
  title = "Data Table",
  data = [],
  loading = false,
  totalCount = 0,
  page = 0,
  rowsPerPage = 5,
  onPageChange,
  onRowsPerPageChange,
  onSearch,
  onSort,
  orderBy = '',
  order = 'asc',
  sortableColumns = [],
  filters = [],
  actions = [],
  columns = [],
  onRowClick,
  onSelectionChange,
  selected = [],
  searchPlaceholder = "Search",
  searchDebounceMs = 500,
  rowsPerPageOptions = [5, 10, 25],
  showSearch = true,
  showFilters = true,
  showActions = true,
  showPagination = true,
  showSelection = true,
  emptyMessage = "No data available",
  searchValue = '',
  onSearchChange,
  filterValues = {},
  onFilterChange,
  exportFunction,
  exportButtonText = "Export",
  exportButtonIcon,
  customHeader,
  customFooter,
  tableProps = {},
  containerProps = {},
  searchFieldProps = {},
  filterFieldProps = {},
  actionButtonProps = {}
}) => {
  const [searchTerm, setSearchTerm] = useState(searchValue);
  const isInitialRender = React.useRef(true);

  // Debounce search term - trigger on any search term change (including empty)
  useEffect(() => {
    // Skip the initial render
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    const handler = setTimeout(() => {
      if (onSearch) {
        onSearch(searchTerm);
      }
    }, searchDebounceMs);
    return () => clearTimeout(handler);
  }, [searchTerm, searchDebounceMs, onSearch]);

  // Sync with external search value
  useEffect(() => {
    setSearchTerm(searchValue);
  }, [searchValue]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearchChange) {
      onSearchChange(value);
    }
  };

  const handleFilterChange = (filterKey, value) => {
    if (onFilterChange) {
      onFilterChange(filterKey, value);
    }
  };

  const handleSelectAllClick = (event) => {
    if (onSelectionChange) {
      if (event.target.checked) {
        onSelectionChange(data.map((item) => item._id));
      } else {
        onSelectionChange([]);
      }
    }
  };

  const handleCheckboxClick = (event, id) => {
    if (onSelectionChange) {
      const selectedIndex = selected.indexOf(id);
      let newSelected = [];

      if (selectedIndex === -1) {
        newSelected = selected.concat(id);
      } else {
        newSelected = selected.filter((item) => item !== id);
      }

      onSelectionChange(newSelected);
    }
  };

  const isSelected = (id) => selected.includes(id);

  const handleRequestSort = (property) => {
    if (onSort) {
      const isAsc = orderBy === property && order === 'asc';
      onSort(property, isAsc ? 'desc' : 'asc');
    }
  };

  const createSortHandler = (property) => () => {
    handleRequestSort(property);
  };

  const handleRowClick = (row) => {
    if (onRowClick) {
      onRowClick(row);
    }
  };

  return (
    <MainCard title={title} {...containerProps}>
      {/* Header Section */}
      {(showSearch || showFilters || showActions) && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
          {/* Left side: Search and Filters */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
            {showSearch && (
              <TextField
                label={searchPlaceholder}
                variant="outlined"
                value={searchTerm}
                onChange={handleSearchChange}
                sx={{ width: 250 }}
                {...searchFieldProps}
              />
            )}

            {showFilters && filters.map((filter) => (
              <TextField
                key={filter.key}
                label={filter.label}
                variant="outlined"
                select
                value={filterValues[filter.key] || ''}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                sx={{ width: filter.width || 200 }}
                {...filterFieldProps}
              >
                <MenuItem value="">{filter.allLabel || `All ${filter.label}`}</MenuItem>
                {filter.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            ))}
          </Box>

          {/* Right side: Actions */}
          {showActions && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
              {exportFunction && (
                <Button
                  variant="contained"
                  color="success"
                  onClick={exportFunction}
                  startIcon={exportButtonIcon}
                  {...actionButtonProps}
                >
                  {exportButtonText}
                </Button>
              )}
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || "contained"}
                  color={action.color || "primary"}
                  onClick={action.onClick}
                  startIcon={action.icon}
                  disabled={action.disabled}
                  {...actionButtonProps}
                >
                  {action.label}
                </Button>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* Custom Header */}
      {customHeader}

      {/* Table */}
      <TableContainer component={Paper} {...tableProps}>
        <Table>
          <TableHead>
            <TableRow>
              {showSelection && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
              )}
              {columns.map((column) => (
                <TableCell key={column.key}>
                  {sortableColumns.includes(column.key) ? (
                    <TableSortLabel
                      active={orderBy === column.key}
                      direction={orderBy === column.key ? order : 'asc'}
                      onClick={createSortHandler(column.key)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          
          {loading && <LinearProgress sx={{ width: '100%' }} />}
          
          <TableBody>
            {data.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={columns.length + (showSelection ? 1 : 0)} align="center">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const isItemSelected = isSelected(row._id);
                return (
                  <TableRow
                    key={row._id}
                    hover
                    selected={isItemSelected}
                    onClick={() => handleRowClick(row)}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {showSelection && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={isItemSelected}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleCheckboxClick(e, row._id)}
                        />
                      </TableCell>
                    )}
                    {columns.map((column) => (
                      <TableCell key={column.key}>
                        {column.render ? column.render(row[column.key], row) : row[column.key]}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Custom Footer */}
      {customFooter}

      {/* Pagination */}
      {showPagination && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      )}
    </MainCard>
  );
};

export default DataTable; 