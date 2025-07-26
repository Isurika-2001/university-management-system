// controllers/bulkUploadController.js

const {
  findStudentByNIC,
  createStudentAndRegister,
  registerCourse
} = require('../utilities/bulk_upload_helper');

async function bulkUploadStudents(req, res) {
  const studentsData = req.body.data; // Array of student objects from parsed Excel

  const results = {
    success: [],
    failed: []
  };

  for (const entry of studentsData) {
    try {
      const existingStudent = await findStudentByNIC(entry.nic);

      if (!existingStudent) {
        // New student
        const result = await createStudentAndRegister(entry);
        results.success.push({
          type: 'new_student',
          studentId: result.studentId,
          registration_no: result.registration_no,
          courseReg: result.courseRegStatus?.success || false
        });
      } else {
        // Student already exists
        if (entry.courseId && entry.batchId) {
          const courseRegResult = await registerCourse(
            existingStudent._id,
            entry.courseId,
            entry.batchId,
            existingStudent.registration_no
          );

          if (courseRegResult.success) {
            results.success.push({
              type: 'existing_student_course_registered',
              studentId: existingStudent._id,
              registration_no: existingStudent.registration_no
            });
          } else {
            results.failed.push({
              type: 'duplicate_course',
              studentId: existingStudent._id,
              reason: courseRegResult.reason
            });
          }
        } else {
          results.success.push({
            type: 'existing_student_no_course',
            studentId: existingStudent._id,
            registration_no: existingStudent.registration_no
          });
        }
      }
    } catch (error) {
      console.error('Bulk upload error:', error.message);
      results.failed.push({
        type: 'error',
        entry,
        error: error.message
      });
    }
  }

  res.status(200).json({
    message: "Bulk upload processed",
    summary: {
      total: studentsData.length,
      success: results.success.length,
      failed: results.failed.length
    },
    results
  });
}

module.exports = {
  bulkUploadStudents
};
