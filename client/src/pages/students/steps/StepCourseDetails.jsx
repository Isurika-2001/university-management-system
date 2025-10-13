import React, { useEffect, useMemo } from 'react';
import { Card, CardContent, Box, Typography, Grid, Button, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const StepCourseDetails = ({
  IconCmp,
  formBag,
  courseOptions,
  batchOptions,
  batchOptionsMap,
  selectedCourse,
  setSelectedCourse,
  fetchBatches,
  setNextDisabled, // Controls wizard "Next" button
  updateStepCompletion,
  isUpdateMode = false // New prop to indicate if this is update mode
}) => {
  const { values, setFieldValue } = formBag;

  // Sync selectedCourses + courseInfoById in Formik whenever enrollments change
  useEffect(() => {
    if (Array.isArray(values.enrollments)) {
      const selectedIds = values.enrollments.map((enr) => enr.courseId).filter(Boolean);

      // Update selectedCourses in formik for StepPaymentSchema
      setFieldValue('selectedCourses', selectedIds);

      // Build courseInfoById for displaying names later
      const infoMap = {};
      values.enrollments.forEach((enr) => {
        if (enr.courseId) {
          infoMap[enr.courseId] = { name: enr.courseName };
        }
      });
      setFieldValue('courseInfoById', infoMap);
    }
  }, [values.enrollments, setFieldValue]);

  // Enable/disable Next button based on enrollment availability
  useEffect(() => {
    const hasEnrollment = Array.isArray(values.enrollments) && values.enrollments.length > 0;
    if (setNextDisabled) {
      setNextDisabled(!hasEnrollment);
    }
  }, [values.enrollments, setNextDisabled]);

  // Update completion status when values change
  useEffect(() => {
    if (updateStepCompletion) {
      updateStepCompletion(values);
    }
  }, [values.enrollments, updateStepCompletion]);

  // Derived batches for "Add New Enrollment > Intake"
  // Show batches for currently selectedCourse (not all batches)
  const newEnrollmentBatchOptions = useMemo(() => {
    if (!selectedCourse) return [];
    // Prefer batchOptionsMap, fallback to batchOptions if not mapped
    if (batchOptionsMap && batchOptionsMap[selectedCourse]) {
      return batchOptionsMap[selectedCourse];
    }
    return batchOptions.filter((b) => b.courseId === selectedCourse);
  }, [selectedCourse, batchOptionsMap, batchOptions]);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconCmp style={{ marginRight: 8, fontSize: 24 }} />
          <Typography variant="h5">Course Details</Typography>
        </Box>

        {/* Existing Enrollments */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            {isUpdateMode ? 'Current Enrollments (Read Only):' : 'Current Enrollments:'}
          </Typography>
          {values.enrollments?.length > 0 ? (
            values.enrollments.map((enrollment, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  p: 2,
                  border: '1px solid #e0e0e0',
                  borderRadius: 1,
                  backgroundColor: isUpdateMode ? '#f5f5f5' : 'transparent'
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={isUpdateMode ? 6 : 4}>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Course:</strong> {enrollment.courseName || enrollment.courseId?.name || 'Not selected'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={isUpdateMode ? 6 : 4}>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Intake:</strong> {enrollment.batchName || enrollment.batchId?.name || 'Not selected'}
                    </Typography>
                  </Grid>
                  {!isUpdateMode && (
                    <Grid item xs={12} sm={4}>
                      <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        onClick={() => {
                          const newEnrollments = values.enrollments.filter((_, i) => i !== index);
                          setFieldValue('enrollments', newEnrollments);
                        }}
                      >
                        Remove
                      </Button>
                    </Grid>
                  )}
                </Grid>
              </Box>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No enrollments yet
            </Typography>
          )}
        </Box>

        {/* Add New Enrollment */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            {isUpdateMode ? 'Add Additional Enrollment:' : 'Add New Enrollment:'}
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={5}>
              <FormControl fullWidth>
                <InputLabel>Course</InputLabel>
                <Select
                  value={selectedCourse}
                  onChange={(e) => {
                    setSelectedCourse(e.target.value);
                    fetchBatches(e.target.value);
                  }}
                  label="Course"
                >
                  {courseOptions.map((course) => (
                    <MenuItem key={course._id} value={course._id}>
                      {course.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={5}>
              <FormControl fullWidth>
                <InputLabel>Intake</InputLabel>
                <Select
                  value="" // always empty in add-mode
                  onChange={(e) => {
                    const selectedBatch = e.target.value;
                    const newEnrollment = {
                      courseId: selectedCourse,
                      batchId: selectedBatch,
                      courseName: courseOptions.find((c) => c._id === selectedCourse)?.name || '',
                      batchName:
                        newEnrollmentBatchOptions.find((b) => b._id === selectedBatch)?.name ||
                        batchOptions.find((b) => b._id === selectedBatch)?.name ||
                        ''
                    };
                    const currentEnrollments = values.enrollments || [];
                    setFieldValue('enrollments', [...currentEnrollments, newEnrollment]);
                    setSelectedCourse('');
                  }}
                  label="Intake"
                  disabled={!selectedCourse}
                >
                  {newEnrollmentBatchOptions.length === 0 && selectedCourse ? (
                    <MenuItem value="" disabled>
                      No intakes available
                    </MenuItem>
                  ) : (
                    newEnrollmentBatchOptions.map((batch) => (
                      <MenuItem key={batch._id} value={batch._id}>
                        {batch.name}
                      </MenuItem>
                    ))
                  )}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Box>

        {/* Edit Enrollments - Only show in non-update mode */}
        {!isUpdateMode && values.enrollments?.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              Edit Enrollments:
            </Typography>
            {values.enrollments.map((enrollment, index) => {
              // Only show batches mapped to enrollment.courseId for each enrollment row
              const courseBatches =
                batchOptionsMap && enrollment.courseId
                  ? batchOptionsMap[enrollment.courseId] || []
                  : batchOptions.filter((b) => b.courseId === enrollment.courseId);

              return (
                <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={5}>
                      <FormControl fullWidth>
                        <InputLabel>Course</InputLabel>
                        <Select
                          value={enrollment.courseId || ''}
                          onChange={(e) => {
                            const selected = e.target.value;
                            const updated = [...values.enrollments];
                            updated[index] = {
                              ...updated[index],
                              courseId: selected,
                              courseName: courseOptions.find((c) => c._id === selected)?.name || '',
                              batchId: '',
                              batchName: ''
                            };
                            setFieldValue('enrollments', updated);
                            if (selected) fetchBatches(selected);
                          }}
                          label="Course"
                        >
                          {courseOptions.map((course) => (
                            <MenuItem key={course._id} value={course._id}>
                              {course.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>

                    <Grid item xs={12} sm={5}>
                      <FormControl fullWidth>
                        <InputLabel>Intake</InputLabel>
                        <Select
                          value={enrollment.batchId || ''}
                          onChange={(e) => {
                            const selected = e.target.value;
                            const updated = [...values.enrollments];
                            updated[index] = {
                              ...updated[index],
                              batchId: selected,
                              batchName: courseBatches.find((b) => b._id === selected)?.name || ''
                            };
                            setFieldValue('enrollments', updated);
                          }}
                          label="Intake"
                          disabled={!enrollment.courseId}
                        >
                          {courseBatches.length === 0 && enrollment.courseId ? (
                            <MenuItem value="" disabled>
                              No intakes available
                            </MenuItem>
                          ) : (
                            courseBatches.map((batch) => (
                              <MenuItem key={batch._id} value={batch._id}>
                                {batch.name}
                              </MenuItem>
                            ))
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              );
            })}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StepCourseDetails;
