const {
  findStudentByNIC,
  createStudentAndRegister,
  registerExistingStudent
} = require('../utilities/bulk_upload_helper');
const ActivityLogger = require('../utils/activityLogger');
const { getRequestInfo } = require('../middleware/requestInfo');

async function bulkUploadStudents(req, res) {
  const studentsData = req.body.data; // Array of student objects from parsed Excel
  const requestInfo = getRequestInfo(req);

  const results = {
    success: [],
    failed: []
  };

  for (const entry of studentsData) {
    try {
      const existingStudent = await findStudentByNIC(entry.nic);

      if (!existingStudent) {
        // New student with optional course registration
        const result = await createStudentAndRegister(entry);

        if (result.courseRegStatus?.success) {
          results.success.push({
            type: 'new_student_with_course',
            studentId: result.studentId,
            registration_no: result.registration_no,
            courseReg: true
          });
        } else {
          results.success.push({
            type: 'new_student_no_course',
            studentId: result.studentId,
            registration_no: result.registration_no,
            courseReg: false,
            courseRegReason: result.courseRegStatus?.reason || 'No courseCode or batchName provided'
          });
        }

      } else {
        // Existing student — check if courseCode and batchName provided
        if (entry.courseCode && entry.batchName) {
          const courseRegResult = await registerExistingStudent(
            existingStudent,
            entry.courseCode,
            entry.batchName
          );

          if (courseRegResult.success) {
            results.success.push({
              type: 'existing_student_course_registered',
              studentId: existingStudent._id,
              registration_no: existingStudent.registration_no
            });
          } else {
            results.failed.push({
              type: 'duplicate_course_or_error',
              studentId: existingStudent._id,
              registration_no: existingStudent.registration_no,
              reason: courseRegResult.reason
            });
          }
        } else {
          // No course info to register — just record success for existing student
          results.failed.push({
            type: 'existing_student_no_course',
            studentId: existingStudent._id,
            registration_no: existingStudent.registration_no,
            reason: `Student already registered with ${existingStudent.registration_no}`
          });
        }
      }
    } catch (error) {
      // console.error('Bulk upload error:', error.message);
      results.failed.push({
        type: 'error',
        entry,
        error: error.message
      });
    }
  }

  // Log the bulk upload activity
  const status = results.failed.length === 0 ? 'SUCCESS' : 'PENDING';
  const errorMessage = results.failed.length > 0 ? `${results.failed.length} records failed` : null;
  
  await ActivityLogger.logBulkUpload(
    req.user, 
    results.success.length, 
    'bulk_upload.csv', 
    requestInfo.ipAddress, 
    requestInfo.userAgent, 
    status, 
    errorMessage
  );

  res.status(200).json({
    message: 'Bulk upload processed',
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
