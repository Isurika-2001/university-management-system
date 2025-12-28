const express = require('express');
const multer = require('multer');
const {
  exportStudents,
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  AddCourseRegistration,
  deleteCourseRegistration,
  importStudentsFromExcel,
  getEnrollmentClassroomHistory,
  updateStudentStatus
} = require('../controllers/student');
const authenticate = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/permissions');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel' ||
      file.originalname.endsWith('.xlsx') ||
      file.originalname.endsWith('.xls')
    ) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  }
});

const router = express.Router();

router.get('/', authenticate, checkPermission('student', 'read'), getAllStudents);
router.post('/', authenticate, checkPermission('student', 'create'), createStudent);
router.get('/export', authenticate, checkPermission('student', 'export'), exportStudents);
router.post('/import', authenticate, checkPermission('student', 'import'), upload.single('file'), importStudentsFromExcel);
router.get('/enrollment/:id/history', authenticate, checkPermission('student', 'read'), getEnrollmentClassroomHistory);
router.get('/:id', authenticate, checkPermission('student', 'read'), getStudentById);
router.put('/:id', authenticate, checkPermission('student', 'update'), updateStudent);
router.post('/enrollment/:id', authenticate, checkPermission('student', 'update'), AddCourseRegistration);
router.delete('/enrollment/:id', authenticate, checkPermission('student', 'update'), deleteCourseRegistration);
router.patch('/:studentId/status', authenticate, checkPermission('student', 'update'), updateStudentStatus);

// Define other routes

module.exports = router;
