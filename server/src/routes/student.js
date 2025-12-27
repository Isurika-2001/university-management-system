// studentRoutes.js

const express = require('express');
const multer = require('multer');
const { exportStudents, getAllStudents, getStudentById, createStudent, updateStudent, AddCourseRegistration, deleteCourseRegistration, importStudentsFromExcel } = require('../controllers/student');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  }
});

const router = express.Router();

router.get('/', getAllStudents);
router.post('/', createStudent);
router.get('/export', exportStudents);
router.post('/import', upload.single('file'), importStudentsFromExcel);
router.get('/enrollment/:id/history', require('../controllers/student').getEnrollmentClassroomHistory);
router.get('/:id', getStudentById);
router.put('/:id', updateStudent);
router.post('/enrollment/:id', AddCourseRegistration);
router.delete('/enrollment/:id', deleteCourseRegistration);

// Define other routes

module.exports = router;
