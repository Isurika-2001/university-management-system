# DataTable Component

A reusable, feature-rich table component that supports filtering, pagination, sorting, row selection, and more.

## Features

- ✅ **Server-side sorting** with visual indicators
- ✅ **Server-side pagination** with customizable page sizes
- ✅ **Search functionality** with debounced input
- ✅ **Multiple filters** with dropdown options
- ✅ **Row selection** with select all functionality
- ✅ **Export functionality** with custom export functions
- ✅ **Custom actions** (Add, Edit, Delete buttons)
- ✅ **Loading states** with progress indicators
- ✅ **Empty state** handling
- ✅ **Row click** handlers
- ✅ **Custom column rendering** with render functions
- ✅ **Responsive design** with flexible layouts
- ✅ **All features optional** - enable/disable as needed

## Basic Usage

```jsx
import DataTable from 'components/DataTable';

const MyView = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'status', label: 'Status' }
  ];

  return (
    <DataTable
      title="My Data"
      data={data}
      loading={loading}
      totalCount={totalCount}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={(event, newPage) => setPage(newPage)}
      onRowsPerPageChange={(event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      }}
      columns={columns}
    />
  );
};
```

## Advanced Usage with All Features

```jsx
import DataTable from 'components/DataTable';
import { UploadOutlined, FileAddOutlined } from '@ant-design/icons';

const AdvancedView = () => {
  // State management
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('name');
  const [order, setOrder] = useState('asc');
  const [filters, setFilters] = useState({});

  // Column definitions with custom rendering
  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <Chip 
          label={value} 
          color={value === 'active' ? 'success' : 'error'} 
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <>
          <Button onClick={() => handleEdit(row)}>Edit</Button>
          <Button onClick={() => handleDelete(row)}>Delete</Button>
        </>
      )
    }
  ];

  // Filter definitions
  const filterOptions = [
    {
      key: 'status',
      label: 'Status Filter',
      allLabel: 'All Statuses',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    },
    {
      key: 'category',
      label: 'Category Filter',
      allLabel: 'All Categories',
      options: categories.map(cat => ({ 
        value: cat.id, 
        label: cat.name 
      }))
    }
  ];

  // Action buttons
  const actions = [
    {
      label: 'Add New',
      icon: <FileAddOutlined />,
      onClick: handleAddNew,
      variant: 'contained',
      color: 'primary'
    }
  ];

  // Sortable columns
  const sortableColumns = ['name', 'email', 'status'];

  // Event handlers
  const handleSearch = (searchValue) => {
    setSearchTerm(searchValue);
    setPage(0);
  };

  const handleSort = (property, sortOrder) => {
    setOrderBy(property);
    setOrder(sortOrder);
    setPage(0);
  };

  const handleFilterChange = (filterKey, value) => {
    setFilters(prev => ({ ...prev, [filterKey]: value }));
    setPage(0);
  };

  const handleSelectionChange = (newSelected) => {
    setSelected(newSelected);
  };

  const handleRowClick = (row) => {
    navigate(`/edit/${row.id}`);
  };

  const handleExport = async () => {
    // Export logic here
  };

  return (
    <DataTable
      title="Advanced Data Table"
      data={data}
      loading={loading}
      totalCount={totalCount}
      page={page}
      rowsPerPage={rowsPerPage}
      onPageChange={(event, newPage) => setPage(newPage)}
      onRowsPerPageChange={(event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
      }}
      onSearch={handleSearch}
      onSort={handleSort}
      orderBy={orderBy}
      order={order}
      sortableColumns={sortableColumns}
      filters={filterOptions}
      filterValues={filters}
      onFilterChange={handleFilterChange}
      columns={columns}
      onRowClick={handleRowClick}
      onSelectionChange={handleSelectionChange}
      selected={selected}
      actions={actions}
      exportFunction={handleExport}
      exportButtonText="Export"
      exportButtonIcon={<UploadOutlined />}
      searchPlaceholder="Search users..."
      showSearch={true}
      showFilters={true}
      showActions={true}
      showPagination={true}
      showSelection={true}
      emptyMessage="No users found"
      rowsPerPageOptions={[5, 10, 25, 50]}
      searchDebounceMs={500}
    />
  );
};
```

## Props Reference

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `data` | `Array` | Array of data objects to display |
| `columns` | `Array` | Column definitions (see below) |

### Optional Props

#### Data & State
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"Data Table"` | Table title |
| `loading` | `boolean` | `false` | Show loading state |
| `totalCount` | `number` | `0` | Total number of records for pagination |
| `page` | `number` | `0` | Current page (0-based) |
| `rowsPerPage` | `number` | `5` | Number of rows per page |
| `selected` | `Array` | `[]` | Array of selected row IDs |

#### Event Handlers
| Prop | Type | Description |
|------|------|-------------|
| `onPageChange` | `function` | Called when page changes |
| `onRowsPerPageChange` | `function` | Called when rows per page changes |
| `onSearch` | `function` | Called when search term changes |
| `onSort` | `function` | Called when sorting changes |
| `onFilterChange` | `function` | Called when filter values change |
| `onSelectionChange` | `function` | Called when selection changes |
| `onRowClick` | `function` | Called when row is clicked |

#### Sorting
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orderBy` | `string` | `''` | Current sort column |
| `order` | `'asc' \| 'desc'` | `'asc'` | Current sort order |
| `sortableColumns` | `Array` | `[]` | Array of sortable column keys |

#### Filters
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `filters` | `Array` | `[]` | Filter definitions |
| `filterValues` | `Object` | `{}` | Current filter values |

#### Actions & Export
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `actions` | `Array` | `[]` | Action button definitions |
| `exportFunction` | `function` | `null` | Export function |
| `exportButtonText` | `string` | `"Export"` | Export button text |
| `exportButtonIcon` | `ReactNode` | `null` | Export button icon |

#### Display Options
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showSearch` | `boolean` | `true` | Show search field |
| `showFilters` | `boolean` | `true` | Show filter fields |
| `showActions` | `boolean` | `true` | Show action buttons |
| `showPagination` | `boolean` | `true` | Show pagination |
| `showSelection` | `boolean` | `true` | Show selection checkboxes |
| `searchPlaceholder` | `string` | `"Search"` | Search field placeholder |
| `emptyMessage` | `string` | `"No data available"` | Message when no data |
| `rowsPerPageOptions` | `Array` | `[5, 10, 25]` | Rows per page options |
| `searchDebounceMs` | `number` | `500` | Search debounce delay |

#### Custom Content
| Prop | Type | Description |
|------|------|-------------|
| `customHeader` | `ReactNode` | Custom header content |
| `customFooter` | `ReactNode` | Custom footer content |

#### Styling Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tableProps` | `Object` | `{}` | Props for TableContainer |
| `containerProps` | `Object` | `{}` | Props for MainCard |
| `searchFieldProps` | `Object` | `{}` | Props for search TextField |
| `filterFieldProps` | `Object` | `{}` | Props for filter TextFields |
| `actionButtonProps` | `Object` | `{}` | Props for action buttons |

## Column Definition

```jsx
const columns = [
  {
    key: 'name',           // Required: field key in data object
    label: 'Name',         // Required: column header text
    render: (value, row) => // Optional: custom render function
      <strong>{value}</strong>
  }
];
```

## Filter Definition

```jsx
const filters = [
  {
    key: 'status',                    // Required: filter key
    label: 'Status Filter',           // Required: filter label
    allLabel: 'All Statuses',         // Optional: "All" option text
    options: [                        // Required: filter options
      { value: 'active', label: 'Active' },
      { value: 'inactive', label: 'Inactive' }
    ],
    width: 200                        // Optional: field width
  }
];
```

## Action Definition

```jsx
const actions = [
  {
    label: 'Add New',                 // Required: button text
    icon: <FileAddOutlined />,        // Optional: button icon
    onClick: handleAddNew,            // Required: click handler
    variant: 'contained',             // Optional: button variant
    color: 'primary',                 // Optional: button color
    disabled: false                   // Optional: disabled state
  }
];
```

## Migration Guide

### From Custom Table to DataTable

**Before:**
```jsx
// Custom table implementation
<MainCard title="My Data">
  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
    <TextField label="Search" />
    <Button>Export</Button>
  </Box>
  <TableContainer>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {data.map(row => (
          <TableRow key={row.id}>
            <TableCell>{row.name}</TableCell>
            <TableCell>{row.email}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
  <TablePagination />
</MainCard>
```

**After:**
```jsx
// Using DataTable component
<DataTable
  title="My Data"
  data={data}
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' }
  ]}
  onSearch={handleSearch}
  exportFunction={handleExport}
/>
```

## Examples

### Simple Table
```jsx
<DataTable
  title="Users"
  data={users}
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' }
  ]}
/>
```

### Table with Sorting
```jsx
<DataTable
  title="Users"
  data={users}
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' }
  ]}
  sortableColumns={['name', 'email']}
  onSort={handleSort}
  orderBy={orderBy}
  order={order}
/>
```

### Table with Filters
```jsx
<DataTable
  title="Users"
  data={users}
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'status', label: 'Status' }
  ]}
  filters={[
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  ]}
  onFilterChange={handleFilterChange}
/>
```

### Table with Actions
```jsx
<DataTable
  title="Users"
  data={users}
  columns={[
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' }
  ]}
  actions={[
    {
      label: 'Add User',
      icon: <AddIcon />,
      onClick: handleAddUser
    }
  ]}
/>
```

### Table with Custom Rendering
```jsx
<DataTable
  title="Users"
  data={users}
  columns={[
    { key: 'name', label: 'Name' },
    { 
      key: 'status', 
      label: 'Status',
      render: (value) => (
        <Chip 
          label={value} 
          color={value === 'active' ? 'success' : 'error'} 
        />
      )
    }
  ]}
/>
```

## Best Practices

1. **Always provide proper loading states** - Use the `loading` prop to show progress
2. **Handle empty states** - Use the `emptyMessage` prop for better UX
3. **Debounce search** - The component handles this automatically
4. **Reset page on filter/search** - The component handles this automatically
5. **Use custom rendering for complex data** - Use the `render` function for formatted data
6. **Provide meaningful column keys** - Use descriptive keys that match your data structure
7. **Handle errors gracefully** - Implement proper error handling in your data fetching logic

## Performance Tips

1. **Use server-side pagination** - Always implement proper pagination for large datasets
2. **Implement proper search** - Use debounced search to avoid excessive API calls
3. **Optimize re-renders** - Use React.memo for expensive components
4. **Lazy load data** - Only fetch data when needed
5. **Use proper keys** - Always provide unique keys for list items 