const express = require('express');
const { bulkUploadStudents } = require('../controllers/bulk_upload');
const authenticate = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();

router.post('/', authenticate, checkPermission('students', 'import'), bulkUploadStudents);

module.exports = router;
