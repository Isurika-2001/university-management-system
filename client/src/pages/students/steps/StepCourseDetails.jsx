import React, { useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, Box, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Alert } from '@mui/material';
import { PATHWAY_LIST } from 'constants/pathways';
import { classroomAPI } from 'api/classrooms';

const StepCourseDetails = ({
  IconCmp,
  formBag,
  courseOptions,
  batchOptions,
  batchOptionsMap,
  fetchBatches,
  setNextDisabled,
  updateStepCompletion
}) => {
  const { values, setFieldValue } = formBag;
  const [classrooms, setClassrooms] = React.useState([]);
  const [loadingClassrooms, setLoadingClassrooms] = React.useState(false);

  // Check if in edit mode with multiple enrollments (read-only)
  const isEditModeMultipleEnrollments = values.enrollments && values.enrollments.length > 1;

  // Single enrollment flow: extract from first (and only) enrollment
  const currentEnrollment = values.enrollments?.[0] || {};
  const selectedPathway = currentEnrollment.pathway || '';
  const selectedCourse = currentEnrollment.courseId || '';
  const selectedBatch = currentEnrollment.batchId || '';
  const selectedClassroom = currentEnrollment.classroomId || '';

  // Filter courses by selected pathway
  const pathwayCoursesOptions = useMemo(() => {
    if (!selectedPathway) return [];
    return courseOptions.filter((c) => c.pathway === selectedPathway);
  }, [selectedPathway, courseOptions]);

  // Filter batches by selected course
  const courseBatchesOptions = useMemo(() => {
    if (!selectedCourse) return [];
    if (batchOptionsMap && batchOptionsMap[selectedCourse]) {
      return batchOptionsMap[selectedCourse];
    }
    return batchOptions.filter((b) => b.courseId === selectedCourse);
  }, [selectedCourse, batchOptionsMap, batchOptions]);

  // Fetch classrooms for selected batch
  const fetchClassrooms = useCallback(async (batchId, courseId) => {
    if (!batchId) {
      setClassrooms([]);
      return;
    }
    setLoadingClassrooms(true);
    try {
      // Pass courseId to enable sequential module filtering (for new enrollments, no enrollmentId)
      const response = await classroomAPI.getAll({ batchId, courseId });
      const classroomList = Array.isArray(response) ? response : response?.data || [];
      setClassrooms(classroomList);
      console.log('Fetched classrooms for batch:', batchId, classroomList);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      setClassrooms([]);
    } finally {
      setLoadingClassrooms(false);
    }
  }, []);

  // Use fetched classrooms directly (no additional filtering needed since API already filters by batchId)
  const batchClassroomsOptions = useMemo(() => {
    return classrooms;
  }, [classrooms]);

  // Enable/disable Next button: requires pathway + course + batch + classroom
  useEffect(() => {
    if (!setNextDisabled) return;
    // If editing and student has multiple enrollments, allow Next (read-only)
    if (isEditModeMultipleEnrollments) {
      setNextDisabled(false);
      return;
    }
    const isComplete = selectedPathway && selectedCourse && selectedBatch && selectedClassroom;
    setNextDisabled(!isComplete);
  }, [selectedPathway, selectedCourse, selectedBatch, selectedClassroom, setNextDisabled, isEditModeMultipleEnrollments]);

  // Update completion status
  useEffect(() => {
    if (updateStepCompletion) {
      updateStepCompletion(values);
    }
  }, [values.enrollments, updateStepCompletion]);

  // Fetch classrooms when batch changes
  useEffect(() => {
    if (selectedBatch && selectedCourse) {
      fetchClassrooms(selectedBatch, selectedCourse);
      // Reset classroom selection when batch changes
      setFieldValue('enrollments', [
        {
          pathway: selectedPathway,
          courseId: selectedCourse,
          batchId: selectedBatch,
          classroomId: '',
          courseName: currentEnrollment.courseName || '',
          batchName: currentEnrollment.batchName || '',
          classroomName: ''
        }
      ]);
    }
  }, [selectedBatch, selectedPathway, selectedCourse, fetchClassrooms]);

  const handlePathwayChange = (pathway) => {
    // Reset course, batch, and classroom when pathway changes
    setFieldValue('enrollments', [
      {
        pathway,
        courseId: '',
        batchId: '',
        classroomId: '',
        courseName: '',
        batchName: '',
        classroomName: ''
      }
    ]);
  };

  const handleCourseChange = async (courseId) => {
    const course = pathwayCoursesOptions.find((c) => c._id === courseId);
    setFieldValue('enrollments', [
      {
        pathway: selectedPathway,
        courseId,
        batchId: '',
        classroomId: '',
        courseName: course?.name || '',
        batchName: '',
        classroomName: ''
      }
    ]);
    // Fetch batches for this course
    if (fetchBatches) {
      await fetchBatches(courseId);
    }
  };

  const handleBatchChange = (batchId) => {
    const batch = courseBatchesOptions.find((b) => b._id === batchId);
    setFieldValue('enrollments', [
      {
        pathway: selectedPathway,
        courseId: selectedCourse,
        batchId,
        classroomId: '',
        courseName: currentEnrollment.courseName || '',
        batchName: batch?.name || '',
        classroomName: ''
      }
    ]);
    // Fetch classrooms for this batch and course (courseId needed for sequential filtering)
    if (selectedCourse) {
      fetchClassrooms(batchId, selectedCourse);
    }
  };

  const handleClassroomChange = (classroomId) => {
    const classroom = batchClassroomsOptions.find((cr) => cr._id === classroomId);
    setFieldValue('enrollments', [
      {
        pathway: selectedPathway,
        courseId: selectedCourse,
        batchId: selectedBatch,
        classroomId,
        courseName: currentEnrollment.courseName || '',
        batchName: currentEnrollment.batchName || '',
        classroomName: classroom?.name || ''
      }
    ]);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconCmp style={{ marginRight: 8, fontSize: 24 }} />
          <Typography variant="h5">Course Details</Typography>
        </Box>

        {isEditModeMultipleEnrollments ? (
          <Box sx={{ mt: 3 }}>
            <Alert severity="info">
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Existing Enrollments (read-only):
              </Typography>
              {values.enrollments.map((enr, idx) => (
                <Box key={idx} sx={{ mb: 1 }}>
                  <Typography variant="body2">
                    <strong>Pathway:</strong> {PATHWAY_LIST.find((p) => p.id === enr.pathway)?.label}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Course:</strong> {enr.courseName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Intake:</strong> {enr.batchName}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Classroom:</strong> {enr.classroomName}
                  </Typography>
                </Box>
              ))}
            </Alert>
          </Box>
        ) : (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle2" gutterBottom sx={{ mb: 2 }}>
              Select your pathway, course, intake, and classroom:
            </Typography>

            <Grid container spacing={2}>
              {/* Step 1: Pathway Selection */}
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Pathway</InputLabel>
                  <Select
                    value={selectedPathway}
                    onChange={(e) => handlePathwayChange(e.target.value)}
                    label="Pathway"
                  >
                    <MenuItem value="">Select Pathway</MenuItem>
                    {PATHWAY_LIST.map((p) => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Step 2: Course Selection (filtered by pathway) */}
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth disabled={!selectedPathway}>
                  <InputLabel>Course</InputLabel>
                  <Select
                    value={selectedCourse}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    label="Course"
                  >
                    <MenuItem value="">
                      {selectedPathway ? 'Select Course' : 'Select Pathway First'}
                    </MenuItem>
                    {pathwayCoursesOptions.map((course) => (
                      <MenuItem key={course._id} value={course._id}>
                        {course.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Step 3: Intake/Batch Selection (filtered by course) */}
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth disabled={!selectedCourse}>
                  <InputLabel>Intake</InputLabel>
                  <Select
                    value={selectedBatch}
                    onChange={(e) => handleBatchChange(e.target.value)}
                    label="Intake"
                  >
                    <MenuItem value="">
                      {selectedCourse ? 'Select Intake' : 'Select Course First'}
                    </MenuItem>
                    {courseBatchesOptions.length > 0 ? (
                      courseBatchesOptions.map((batch) => (
                        <MenuItem key={batch._id} value={batch._id}>
                          {batch.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        No intakes available
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>

              {/* Step 4: Classroom Selection (filtered by batch) */}
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth disabled={!selectedBatch || loadingClassrooms}>
                  <InputLabel>Classroom</InputLabel>
                  <Select
                    value={selectedClassroom}
                    onChange={(e) => handleClassroomChange(e.target.value)}
                    label="Classroom"
                  >
                    <MenuItem value="">
                      {selectedBatch ? 'Select Classroom' : 'Select Intake First'}
                    </MenuItem>
                    {batchClassroomsOptions.length > 0 ? (
                      batchClassroomsOptions.map((classroom) => (
                        <MenuItem key={classroom._id} value={classroom._id}>
                          {classroom.name}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="" disabled>
                        {loadingClassrooms ? 'Loading...' : 'No classrooms available'}
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Display Selected Enrollment Summary */}
            {selectedPathway && selectedCourse && selectedBatch && selectedClassroom && (
              <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Selected Enrollment:
                </Typography>
                <Typography variant="body2">
                  <strong>Pathway:</strong> {PATHWAY_LIST.find((p) => p.id === selectedPathway)?.label}
                </Typography>
                <Typography variant="body2">
                  <strong>Course:</strong> {currentEnrollment.courseName}
                </Typography>
                <Typography variant="body2">
                  <strong>Intake:</strong> {currentEnrollment.batchName}
                </Typography>
                <Typography variant="body2">
                  <strong>Classroom:</strong> {currentEnrollment.classroomName}
                </Typography>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default StepCourseDetails;
