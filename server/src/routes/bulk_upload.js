const express = require('express');
const { bulkUploadStudents } = require('../controllers/bulk_upload');

const router = express.Router();

router.post('/', bulkUploadStudents);

module.exports = router;
