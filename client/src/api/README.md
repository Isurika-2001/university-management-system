# API Structure Documentation

This directory contains a centralized API structure for the University Management System client application. The structure provides consistent error handling, automatic unauthorized request management, and organized API calls.

## Structure

```
api/
├── index.js              # Main API configuration and middleware
├── auth.js               # Authentication API calls
├── students.js           # Students API calls
├── courses.js            # Courses API calls
├── users.js              # Users API calls
├── batches.js            # Batches API calls
├── courseRegistrations.js # Course registrations API calls
├── stats.js              # Statistics API calls
├── bulkUpload.js         # Bulk upload API calls
└── README.md             # This documentation
```

## Features

### 1. Automatic Unauthorized Handling
- All API calls automatically handle 401 (Unauthorized) responses
- When a 401 response is received, the user is automatically logged out and redirected to the login page
- No need to manually handle unauthorized responses in individual components

### 2. Centralized Error Handling
- Consistent error handling across all API calls
- Automatic token management
- Network error handling

### 3. Organized API Calls
- Each module has its own API file
- Consistent method naming across all modules
- Easy to maintain and extend

## Usage

### Basic API Call
```javascript
import { studentsAPI } from '../api/students';

// Get all students with pagination
const students = await studentsAPI.getAll({
  page: 1,
  limit: 10,
  search: 'john'
});
```

### Error Handling
```javascript
try {
  const data = await studentsAPI.getAll();
  // Handle success
} catch (error) {
  // Handle error
  console.error('Error:', error.message);
}
```

### Available API Modules

#### Authentication (`auth.js`)
```javascript
import { authAPI } from '../api/auth';

// Login
const result = await authAPI.login(credentials);

// Register
const result = await authAPI.register(userData);

// Logout
const result = await authAPI.logout();

// Get profile
const profile = await authAPI.getProfile();
```

#### Students (`students.js`)
```javascript
import { studentsAPI } from '../api/students';

// Get all students
const students = await studentsAPI.getAll(params);

// Get student by ID
const student = await studentsAPI.getById(id);

// Create student
const result = await studentsAPI.create(studentData);

// Update student
const result = await studentsAPI.update(id, studentData);

// Delete student
const result = await studentsAPI.delete(id);

// Search students
const students = await studentsAPI.search(searchTerm, params);
```

#### Courses (`courses.js`)
```javascript
import { coursesAPI } from '../api/courses';

// Similar methods as students
const courses = await coursesAPI.getAll(params);
const course = await coursesAPI.getById(id);
// ... etc
```

#### Users (`users.js`)
```javascript
import { usersAPI } from '../api/users';

// Get all users
const users = await usersAPI.getAll(params);

// Get user types
const userTypes = await usersAPI.getUserTypes();
```

#### Batches (`batches.js`)
```javascript
import { batchesAPI } from '../api/batches';

// Similar methods as other modules
const batches = await batchesAPI.getAll(params);
```

#### Course Registrations (`courseRegistrations.js`)
```javascript
import { courseRegistrationsAPI } from '../api/courseRegistrations';

// Similar methods as other modules
const registrations = await courseRegistrationsAPI.getAll(params);
```

#### Statistics (`stats.js`)
```javascript
import { statsAPI } from '../api/stats';

// Get dashboard stats
const dashboardStats = await statsAPI.getDashboardStats();

// Get enrollment stats
const enrollmentStats = await statsAPI.getEnrollmentStats(params);

// Get recent activities
const activities = await statsAPI.getRecentActivities(params);
```

#### Bulk Upload (`bulkUpload.js`)
```javascript
import { bulkUploadAPI } from '../api/bulkUpload';

// Upload students in bulk
const result = await bulkUploadAPI.uploadStudents(fileData);

// Get upload status
const status = await bulkUploadAPI.getUploadStatus(uploadId);

// Download template
const template = await bulkUploadAPI.downloadTemplate('students');
```

## Migration Guide

### Before (Old Way)
```javascript
// In component
const response = await fetch(apiRoutes.studentRoute, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${user.token}`
  }
});

if (!response.ok) {
  if (response.status === 401) {
    logout();
    return;
  }
  // Handle other errors
}

const data = await response.json();
```

### After (New Way)
```javascript
// In component
import { studentsAPI } from '../api/students';

try {
  const data = await studentsAPI.getAll(params);
  // Handle success
} catch (error) {
  // Handle error (401 is automatically handled)
  console.error('Error:', error.message);
}
```

## Benefits

1. **Consistency**: All API calls follow the same pattern
2. **Maintainability**: Centralized error handling and unauthorized management
3. **Developer Experience**: Cleaner component code
4. **Reliability**: Automatic token management and error handling
5. **Extensibility**: Easy to add new API endpoints

## Error Handling

The API middleware automatically handles:
- 401 Unauthorized responses (auto logout)
- Network errors
- HTTP error responses
- Token management

All errors are thrown as JavaScript Error objects with descriptive messages.

## Authentication

The API middleware automatically:
- Includes the auth token in all requests
- Handles token expiration
- Manages logout on unauthorized access

No need to manually include tokens in your API calls. 