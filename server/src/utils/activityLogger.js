const ActivityLog = require('../models/activity_log');

class ActivityLogger {
  static async logActivity({
    user,
    action,
    description,
    resourceType,
    resourceId = null,
    details = {},
    ipAddress = null,
    userAgent = null,
    status = 'SUCCESS',
    errorMessage = null
  }) {
    try {
      const logEntry = new ActivityLog({
        user: user._id || user,
        action,
        description,
        resourceType,
        resourceId,
        details,
        ipAddress,
        userAgent,
        status,
        errorMessage
      });

      await logEntry.save();
      
      // Also log to console for debugging
      console.log(`[ACTIVITY LOG] ${action}: ${description} - User: ${user.email || user._id} - Status: ${status}`);
      
      return logEntry;
    } catch (error) {
      console.error('Error logging activity:', error);
      // Don't throw error to avoid breaking the main functionality
    }
  }

  // Helper methods for common actions
  static async logLogin(user, ipAddress, userAgent, status = 'SUCCESS', errorMessage = null) {
    return this.logActivity({
      user,
      action: 'LOGIN',
      description: `User ${user.email || user._id || 'Unknown'} ${status === 'SUCCESS' ? 'logged in successfully' : 'login attempt'}`,
      resourceType: 'AUTH',
      ipAddress,
      userAgent,
      status,
      errorMessage
    });
  }

  static async logLogout(user, ipAddress, userAgent) {
    return this.logActivity({
      user,
      action: 'LOGOUT',
      description: `User ${user.email} logged out`,
      resourceType: 'AUTH',
      ipAddress,
      userAgent
    });
  }

  static async logStudentCreate(user, student, ipAddress, userAgent) {
    return this.logActivity({
      user,
      action: 'STUDENT_CREATE',
      description: `Created new student: ${student.firstName} ${student.lastName} (${student.registration_no})`,
      resourceType: 'STUDENT',
      resourceId: student._id,
      details: {
        studentId: student.studentId,
        email: student.email,
        firstName: student.firstName,
        lastName: student.lastName
      },
      ipAddress,
      userAgent
    });
  }

  static async logStudentUpdate(user, student, changes, ipAddress, userAgent) {
    return this.logActivity({
      user,
      action: 'STUDENT_UPDATE',
      description: `Updated student: ${student.firstName} ${student.lastName} (${student.studentId})`,
      resourceType: 'STUDENT',
      resourceId: student._id,
      details: {
        studentId: student.studentId,
        changes
      },
      ipAddress,
      userAgent
    });
  }

  // Enrollment activity logging methods
  static async logEnrollmentCreate(user, enrollmentId, description) {
    return this.logActivity({
      user,
      action: 'ENROLLMENT_CREATE',
      description,
      resourceType: 'ENROLLMENT',
      resourceId: enrollmentId
    });
  }

  static async logEnrollmentUpdate(user, enrollmentId, description) {
    return this.logActivity({
      user,
      action: 'ENROLLMENT_UPDATE',
      description,
      resourceType: 'ENROLLMENT',
      resourceId: enrollmentId
    });
  }

  static async logEnrollmentDelete(user, enrollmentId, description) {
    return this.logActivity({
      user,
      action: 'ENROLLMENT_DELETE',
      description,
      resourceType: 'ENROLLMENT',
      resourceId: enrollmentId
    });
  }

  static async logEnrollmentExport(user, count, ipAddress, userAgent) {
    return this.logActivity({
      user,
      action: 'ENROLLMENT_EXPORT',
      description: `Exported ${count} enrollments`,
      resourceType: 'ENROLLMENT',
      details: { count },
      ipAddress,
      userAgent
    });
  }

  static async logBatchTransfer(user, enrollmentId, newBatchId, reason) {
    return this.logActivity({
      user,
      action: 'BATCH_TRANSFER',
      description: `Batch transfer for enrollment ${enrollmentId}`,
      resourceType: 'ENROLLMENT',
      resourceId: enrollmentId,
      details: {
        newBatchId,
        reason
      }
    });
  }

  static async logStudentExport(user, count, ipAddress, userAgent) {
    return this.logActivity({
      user,
      action: 'STUDENT_EXPORT',
      description: `Exported ${count} students to CSV/Excel`,
      resourceType: 'STUDENT',
      details: {
        exportCount: count,
        exportType: 'CSV/Excel'
      },
      ipAddress,
      userAgent
    });
  }

  static async logStudentImport(user, count, filename, ipAddress, userAgent, status = 'SUCCESS', errorMessage = null) {
    return this.logActivity({
      user,
      action: 'STUDENT_IMPORT',
      description: `Imported ${count} students from file: ${filename}`,
      resourceType: 'STUDENT',
      details: {
        importCount: count,
        filename
      },
      ipAddress,
      userAgent,
      status,
      errorMessage
    });
  }

  static async logBulkUpload(user, count, filename, ipAddress, userAgent, status = 'SUCCESS', errorMessage = null) {
    return this.logActivity({
      user,
      action: 'BULK_UPLOAD_STUDENTS',
      description: `Bulk uploaded ${count} students from file: ${filename}`,
      resourceType: 'BULK_UPLOAD',
      details: {
        uploadCount: count,
        filename
      },
      ipAddress,
      userAgent,
      status,
      errorMessage
    });
  }

  static async logCourseRegistrationCreate(user, registration, ipAddress, userAgent) {
    return this.logActivity({
      user,
      action: 'COURSE_REGISTRATION_CREATE',
      description: `Created course registration for student: ${registration.studentId}`,
      resourceType: 'COURSE_REGISTRATION',
      resourceId: registration._id,
      details: {
        studentId: registration.studentId,
        courseId: registration.courseId,
        batchId: registration.batchId
      },
      ipAddress,
      userAgent
    });
  }

  static async logCourseRegistrationUpdate(user, registration, changes, ipAddress, userAgent) {
    return this.logActivity({
      user,
      action: 'COURSE_REGISTRATION_UPDATE',
      description: `Updated course registration for student: ${registration.studentId}`,
      resourceType: 'COURSE_REGISTRATION',
      resourceId: registration._id,
      details: {
        studentId: registration.studentId,
        changes
      },
      ipAddress,
      userAgent
    });
  }

  static async logCourseRegistrationExport(user, count, ipAddress, userAgent) {
    return this.logActivity({
      user,
      action: 'COURSE_REGISTRATION_EXPORT',
      description: `Exported ${count} course registrations to CSV/Excel`,
      resourceType: 'COURSE_REGISTRATION',
      details: {
        exportCount: count,
        exportType: 'CSV/Excel'
      },
      ipAddress,
      userAgent
    });
  }

  static async logUserCreate(user, newUser, ipAddress, userAgent) {
    return this.logActivity({
      user,
      action: 'USER_CREATE',
      description: `Created new user: ${newUser.email}`,
      resourceType: 'USER',
      resourceId: newUser._id,
      details: {
        email: newUser.email,
        userType: newUser.userType?.name
      },
      ipAddress,
      userAgent
    });
  }

  static async logUserUpdate(user, updatedUser, changes, ipAddress, userAgent) {
    return this.logActivity({
      user,
      action: 'USER_UPDATE',
      description: `Updated user: ${updatedUser.email}`,
      resourceType: 'USER',
      resourceId: updatedUser._id,
      details: {
        email: updatedUser.email,
        changes
      },
      ipAddress,
      userAgent
    });
  }

  static async logUserDisable(user, disabledUser, ipAddress, userAgent) {
    return this.logActivity({
      user,
      action: 'USER_DISABLE',
      description: `Disabled user: ${disabledUser.email}`,
      resourceType: 'USER',
      resourceId: disabledUser._id,
      details: {
        email: disabledUser.email,
        status: 'disabled'
      },
      ipAddress,
      userAgent
    });
  }
}

module.exports = ActivityLogger; 