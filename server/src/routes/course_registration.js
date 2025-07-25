const express = require('express');
const {
  getAllCourseRegistrations,
  getCourseRegistrationById,
  getAllCourseRegistrationsByStudentId,
  exportCourseRegistrations
} = require('../controllers/course_registration');

const router = express.Router();

router.get('/export', exportCourseRegistrations);
router.get('/student/:id', getAllCourseRegistrationsByStudentId);
router.get('/:id', getCourseRegistrationById);
router.get('/', getAllCourseRegistrations);

module.exports = router;
