import React, { useState, useEffect } from 'react';
import { 
  TextField, 
  Button, 
  Grid, 
  Select, 
  MenuItem, 
  CircularProgress,
  FormControl,
  InputLabel,
  Typography,
  Box,
  Checkbox,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  LinearProgress,
  Chip
} from '@mui/material';
import { 
  UserOutlined, 
  BookOutlined, 
  PhoneOutlined, 
  FileTextOutlined,
  ReadOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import { useLocation } from 'react-router-dom';
import { apiRoutes } from 'config';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuthContext } from 'context/useAuthContext';

const steps = [
  'Personal Details',
  'Course Details', 
  'Academic Details',
  'Required Documents',
  'Emergency Contact'
];

const UpdateStudent = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [submitButtonClicked, setSubmitButtonClicked] = useState(false);
  const location = useLocation();
  const { user } = useAuthContext();
  
  const Toast = withReactContent(
    Swal.mixin({
      toast: true,
      position: 'bottom',
      customClass: {
        popup: 'colored-toast'
      },
      background: 'primary',
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true,
      allowHtml: true
    })
  );

  const showSuccessSwal = (e) => {
    Toast.fire({
      icon: 'success',
      title: e
    });
  };

  const showErrorSwal = (e) => {
    Toast.fire({
      icon: 'error',
      title: e
    });
  };

  useEffect(() => {
    fetchStudentData();
    fetchRequiredDocuments();
  }, [location.search]);



  // Fetch student data and enrollment data
  async function fetchStudentData() {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    
    try {
      // Fetch student data
      const studentResponse = await fetch(apiRoutes.studentRoute + id, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
      });

      const studentData = await studentResponse.json();

      if (!studentResponse.ok) {
        if (studentResponse.status === 500) {
          console.error('Internal Server Error.');
          return;
        }
        return;
      }

      // Fetch enrollment data for this student
      const enrollmentResponse = await fetch(apiRoutes.enrollmentRoute + `student/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
      });

      let enrollmentData = [];
      if (enrollmentResponse.ok) {
        const response = await enrollmentResponse.json();
        enrollmentData = response.data || [];
      }

      // Combine student and enrollment data
      const combinedData = {
        ...studentData,
        enrollments: enrollmentData
      };

      console.log('Combined student and enrollment data:', combinedData);
      setData(combinedData);
      setEnrollments(enrollmentData);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  }





  // Fetch required documents
  async function fetchRequiredDocuments() {
    try {
      const response = await fetch(apiRoutes.requiredDocumentRoute, {
        method: 'GET',   
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 500) {
          console.error('Internal Server Error.');
          return;
        }
        return;
      }
      // Handle both structured response and direct array
      const documents = data.data || data;
      setRequiredDocuments(Array.isArray(documents) ? documents : []);
    } catch (error) {
      console.error('Error fetching required documents:', error);
      setRequiredDocuments([]);
    }
  }

  const academicQualificationOptions = [
    'O-Level',
    'A-Level',
    'Diploma',
    'Bachelor\'s Degree',
    'Master\'s Degree',
    'PhD',
    'Other'
  ];

  const getInitialValues = () => {
    if (!data) return {};

    console.log('Student data for initial values:', data);

    return {
      // Personal Details (Step 1)
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
      nic: data.nic || '',
      address: data.address || '',
      mobile: data.mobile || '',
      homeContact: data.homeContact || '',
      email: data.email || '',
      
      // Course Details (Step 2) - Multiple enrollments
      enrollments: enrollments && enrollments.length > 0 ? enrollments.map(enrollment => ({
        enrollmentId: enrollment._id,
        courseId: enrollment.courseId || enrollment.course?._id || '',
        batchId: enrollment.batchId || enrollment.batch?._id || '',
        courseName: enrollment.course?.name || '',
        batchName: enrollment.batch?.name || ''
      })) : [],
      
      // Academic Details (Step 3)
      highestAcademicQualification: data.highestAcademicQualification || '',
      qualificationDescription: data.qualificationDescription || '',
      
      // Required Documents (Step 4)
      requiredDocuments: data.requiredDocuments && Array.isArray(data.requiredDocuments) ? data.requiredDocuments.map(doc => doc.documentId || doc._id) : [],
      
      // Emergency Contact (Step 5)
      emergencyContact: data.emergencyContact || {
        name: '',
        relationship: '',
        phone: '',
        email: '',
        address: ''
      }
    };
  };

  const validationSchema = Yup.object().shape({
    // Personal Details validation
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    dob: Yup.string().required('Date of Birth is required'),
    nic: Yup.string()
      .matches(
        /^(?:\d{9}[vVxX]|\d{12})$/,
        'NIC should either contain 9 digits with an optional last character as a letter (v/V/x/X) or have exactly 12 digits'
      )
      .required('NIC is required'),
    address: Yup.string().required('Address is required'),
    mobile: Yup.string()
      .matches(/^\+?\d{10,12}$/, 'Contact No should be 10 to 12 digits with an optional leading + sign')
      .required('Contact No is required'),
    homeContact: Yup.string().matches(/^\+?\d{10,12}$/, 'Contact No should be 10 to 12 digits with an optional leading + sign'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    
    // Course Details validation (read-only, no validation needed)
    enrollments: Yup.array(),
    
    // Academic Details validation (optional)
    highestAcademicQualification: Yup.string(),
    qualificationDescription: Yup.string(),
    
    // Emergency Contact validation (optional)
    emergencyContact: Yup.object().shape({
      name: Yup.string(),
      relationship: Yup.string(),
      phone: Yup.string().matches(/^\+?\d{10,12}$/, 'Phone should be 10 to 12 digits with an optional leading + sign'),
      email: Yup.string().email('Invalid email format'),
      address: Yup.string()
    })
  });

     const handleNext = (values, { setTouched, setFieldError }) => {
     console.log('handleNext called, activeStep:', activeStep);
     
     // Reset submit button clicked state when moving to next step
     setSubmitButtonClicked(false);
     
     // Validate current step before proceeding
     if (activeStep === 0) {
       // Validate Personal Details
       const personalFields = ['firstName', 'lastName', 'dob', 'nic', 'address', 'mobile', 'email'];
       let hasErrors = false;
       
       personalFields.forEach(field => {
         if (!values[field]) {
           setFieldError(field, 'This field is required');
           hasErrors = true;
         }
       });
       
       if (hasErrors) {
         setTouched({ firstName: true, lastName: true, dob: true, nic: true, address: true, mobile: true, email: true });
         return;
       }
     }
     
     if (activeStep === 1) {
       // Course Details step is read-only, no validation needed
       // Users can proceed without any course enrollments
     }
     
     console.log('Moving to next step from', activeStep, 'to', activeStep + 1);
     setActiveStep((prevActiveStep) => prevActiveStep + 1);
   };

  const handleBack = () => {
    // Reset submit button clicked state when going back
    setSubmitButtonClicked(false);
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (values) => {
    // Additional check to ensure we're on the final step and submit button was clicked
    if (activeStep !== steps.length - 1 || !submitButtonClicked) {
      console.log('handleSubmit called but not on final step or submit button not clicked, preventing submission');
      console.log('activeStep:', activeStep, 'submitButtonClicked:', submitButtonClicked);
      return;
    }
    
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    
    console.log('handleSubmit called with values:', values);
    console.log('Student ID:', id);
    
    // Check if we have the required data
    if (!id) {
      console.error('No student ID found in URL');
      showErrorSwal('Student ID not found');
      return;
    }
    
    if (!data) {
      console.error('No student data available');
      showErrorSwal('Student data not available');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Transform requiredDocuments array to the format expected by the server
      const studentUpdateData = {
        firstName: values.firstName,
        lastName: values.lastName,
        dob: values.dob,
        nic: values.nic,
        address: values.address,
        mobile: values.mobile,
        homeContact: values.homeContact,
        email: values.email,
        highestAcademicQualification: values.highestAcademicQualification,
        qualificationDescription: values.qualificationDescription,
        requiredDocuments: Array.isArray(values.requiredDocuments) ? values.requiredDocuments.map(docId => ({
          documentId: docId,
          isProvided: true
        })) : [],
        emergencyContact: values.emergencyContact
      };

      // Update student data
      const studentResponse = await fetch(apiRoutes.studentRoute + id, {
        method: 'PUT',   
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
        body: JSON.stringify(studentUpdateData)
      });

      if (!studentResponse.ok) {
        const errorData = await studentResponse.json();
        console.error('Student update failed:', errorData);
        
        // Format error message with message in bold and error as sub-text
        let errorMessage = 'Failed to update student';
        
        if (errorData.message && errorData.error) {
          errorMessage = `<strong>${errorData.message}</strong><br/><small>${errorData.error}</small>`;
        } else if (errorData.message) {
          errorMessage = `<strong>${errorData.message}</strong>`;
        } else if (errorData.error) {
          errorMessage = `<strong>Error:</strong><br/><small>${errorData.error}</small>`;
        }
        
        showErrorSwal(errorMessage);
        setSubmitting(false);
        setSubmitButtonClicked(false);
        return;
      }

      // Get the response data which includes completion status
      const responseData = await studentResponse.json();
      
      // Show appropriate message based on completion status
      let statusMessage = responseData.message || 'Student updated successfully';
      
      // If we have completion status details, provide more specific feedback
      if (responseData.data && responseData.data.completionStatus) {
        const completionStatus = responseData.data.completionStatus;
        
        if (completionStatus.overall === 'completed') {
          statusMessage = 'Student updated successfully! Registration is now complete.';
        } else if (completionStatus.overall === 'incomplete') {
          const missingSteps = [];
          if (!completionStatus.step1) missingSteps.push('Personal Details');
          if (!completionStatus.step2) missingSteps.push('Course Enrollment');
          if (!completionStatus.step3) missingSteps.push('Academic Details');
          if (!completionStatus.step4) missingSteps.push('Required Documents');
          if (!completionStatus.step5) missingSteps.push('Emergency Contact');
          
          statusMessage = `Student updated successfully! To complete registration, please provide: ${missingSteps.join(', ')}`;
        } else {
          statusMessage = 'Student updated successfully! Registration is still pending.';
        }
      }
      
      showSuccessSwal(statusMessage);
      // Redirect back to students list
      window.location.href = '/app/students';

      console.log('Student updated successfully');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      
      // Show a user-friendly error message
      let errorMessage = 'An unexpected error occurred while updating student. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      showErrorSwal(errorMessage);
    } finally {
      setSubmitting(false);
      setSubmitButtonClicked(false); // Reset submit button state
    }
  };

  const renderStepContent = (step, values, errors, touched, setFieldValue) => {
    switch (step) {
      case 0:
    return (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <UserOutlined style={{ marginRight: 8, fontSize: 24 }} />
                <Typography variant="h5">Personal Details</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="First Name"
                    variant="outlined"
                    name="firstName"
                    fullWidth
                    error={touched.firstName && !!errors.firstName}
                    helperText={<ErrorMessage name="firstName" />}
                    InputProps={{ sx: { px: 2, py: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Last Name"
                    variant="outlined"
                    name="lastName"
                    fullWidth
                    error={touched.lastName && !!errors.lastName}
                    helperText={<ErrorMessage name="lastName" />}
                    InputProps={{ sx: { px: 2, py: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Date of Birth"
                    variant="outlined"
                    name="dob"
                    InputLabelProps={{ shrink: true }}
                    type="date"
                    fullWidth
                    error={touched.dob && !!errors.dob}
                    helperText={<ErrorMessage name="dob" />}
                    InputProps={{ sx: { px: 2, py: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="NIC"
                    variant="outlined"
                    name="nic"
                    fullWidth
                    error={touched.nic && !!errors.nic}
                    helperText={<ErrorMessage name="nic" />}
                    InputProps={{ sx: { px: 2, py: 1 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    label="Address"
                    variant="outlined"
                    name="address"
                    fullWidth
                    multiline
                    rows={3}
                    error={touched.address && !!errors.address}
                    helperText={<ErrorMessage name="address" />}
                    InputProps={{ sx: { px: 2, py: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Mobile"
                    variant="outlined"
                    name="mobile"
                    fullWidth
                    error={touched.mobile && !!errors.mobile}
                    helperText={<ErrorMessage name="mobile" />}
                    InputProps={{ sx: { px: 2, py: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Home Contact (Optional)"
                    variant="outlined"
                    name="homeContact"
                    fullWidth
                    error={touched.homeContact && !!errors.homeContact}
                    helperText={<ErrorMessage name="homeContact" />}
                    InputProps={{ sx: { px: 2, py: 1 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    label="Email"
                    variant="outlined"
                    name="email"
                    fullWidth
                    error={touched.email && !!errors.email}
                    helperText={<ErrorMessage name="email" />}
                    InputProps={{ sx: { px: 2, py: 1 } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

             case 1:
         return (
           <Card>
             <CardContent>
               <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                 <BookOutlined style={{ marginRight: 8, fontSize: 24 }} />
                 <Typography variant="h5">Course Details (Read Only)</Typography>
               </Box>
               
               <Box sx={{ mb: 2 }}>
                 <Typography variant="subtitle2" gutterBottom>
                   Current Enrollments:
                 </Typography>
                 {values.enrollments && values.enrollments.length > 0 ? (
                   values.enrollments.map((enrollment, index) => (
                     <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: 'grey.50' }}>
                       <Grid container spacing={2} alignItems="center">
                         <Grid item xs={12} sm={6}>
                           <Typography variant="body2" color="textSecondary">
                             <strong>Course:</strong> {enrollment.courseName || 'Not selected'}
                           </Typography>
                         </Grid>
                         <Grid item xs={12} sm={6}>
                           <Typography variant="body2" color="textSecondary">
                             <strong>Batch:</strong> {enrollment.batchName || 'Not selected'}
                           </Typography>
                         </Grid>
                       </Grid>
                     </Box>
                   ))
                 ) : (
                   <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, bgcolor: 'grey.50' }}>
                     <Typography variant="body2" color="textSecondary" align="center">
                       No enrollments found for this student
                     </Typography>
                   </Box>
                 )}
               </Box>



               <Box sx={{ mt: 3, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                 <Typography variant="body2" color="info.main">
                   <strong>Note:</strong> Course enrollments can only be managed through the dedicated enrollment management page. 
                   This wizard is for updating student personal information only.
                 </Typography>
               </Box>
             </CardContent>
           </Card>
         );

      case 2:
        return (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <ReadOutlined style={{ marginRight: 8, fontSize: 24 }} />
                <Typography variant="h5">Academic Details (Optional)</Typography>
              </Box>
              
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                This step is optional. You can skip it if you don&apos;t want to update academic information.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field name="highestAcademicQualification">
                    {({ field }) => (
                      <FormControl fullWidth>
                        <InputLabel>Highest Academic Qualification</InputLabel>
                        <Select {...field} label="Highest Academic Qualification">
                          {academicQualificationOptions.map((qualification) => (
                            <MenuItem key={qualification} value={qualification}>
                              {qualification}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                  </Field>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Qualification Description"
                    variant="outlined"
                    name="qualificationDescription"
                    fullWidth
                    InputProps={{ sx: { px: 2, py: 1 } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 3:
        return (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FileTextOutlined style={{ marginRight: 8, fontSize: 24 }} />
                <Typography variant="h5">Required Documents</Typography>
              </Box>
              
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                This step can be skipped during update, but all required documents must be provided to complete the student&apos;s registration status.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Select documents that have been provided:
                  </Typography>
                  
                  {/* Required Documents Section */}
                  {Array.isArray(requiredDocuments) && requiredDocuments.filter(doc => doc.isRequired).length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'error.main' }}>
                        Required Documents *
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                        These documents are mandatory for completing your registration
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {requiredDocuments.filter(doc => doc.isRequired).map((doc) => (
                          <FormControlLabel
                            key={doc._id}
                            control={
                              <Checkbox
                                checked={values.requiredDocuments.includes(doc._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFieldValue('requiredDocuments', [...values.requiredDocuments, doc._id]);
                                  } else {
                                    setFieldValue('requiredDocuments', values.requiredDocuments.filter(id => id !== doc._id));
                                  }
                                }}
                              />
                            }
                            label={
                              <Box sx={{ border: '1px solid', borderColor: 'error.main', borderRadius: 1, p: 1, backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
                                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                  {doc.name} *
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {doc.description}
                                </Typography>
                              </Box>
                            }
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {/* Optional Documents Section */}
                  {Array.isArray(requiredDocuments) && requiredDocuments.filter(doc => !doc.isRequired).length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'success.main' }}>
                        Optional Documents
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                        These documents are optional and can be provided later
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {requiredDocuments.filter(doc => !doc.isRequired).map((doc) => (
                          <FormControlLabel
                            key={doc._id}
                            control={
                              <Checkbox
                                checked={values.requiredDocuments.includes(doc._id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setFieldValue('requiredDocuments', [...values.requiredDocuments, doc._id]);
                                  } else {
                                    setFieldValue('requiredDocuments', values.requiredDocuments.filter(id => id !== doc._id));
                                  }
                                }}
                              />
                            }
                            label={
                              <Box sx={{ border: '1px solid', borderColor: 'success.main', borderRadius: 1, p: 1, backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
                                <Typography variant="body2">
                                  {doc.name}
                                </Typography>
                                <Typography variant="caption" color="textSecondary">
                                  {doc.description}
                                </Typography>
                              </Box>
                            }
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                  
                  {/* No Documents Message */}
                  {(!Array.isArray(requiredDocuments) || requiredDocuments.length === 0) && (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="body2" color="textSecondary">
                        No documents configured. You can skip this step.
                      </Typography>
                    </Box>
                  )}
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      case 4:
        return (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PhoneOutlined style={{ marginRight: 8, fontSize: 24 }} />
                <Typography variant="h5">Emergency Contact (Optional)</Typography>
              </Box>
              
              <Typography variant="body2" color="textSecondary" sx={{ mb: 3, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                This step is optional. You can skip it if you don&apos;t want to update emergency contact information.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Contact Name"
                    variant="outlined"
                    name="emergencyContact.name"
                    fullWidth
                    InputProps={{ sx: { px: 2, py: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Relationship"
                    variant="outlined"
                    name="emergencyContact.relationship"
                    fullWidth
                    InputProps={{ sx: { px: 2, py: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Phone"
                    variant="outlined"
                    name="emergencyContact.phone"
                    fullWidth
                    InputProps={{ sx: { px: 2, py: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Email (Optional)"
                    variant="outlined"
                    name="emergencyContact.email"
                    fullWidth
                    InputProps={{ sx: { px: 2, py: 1 } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    label="Address (Optional)"
                    variant="outlined"
                    name="emergencyContact.address"
                    fullWidth
                    multiline
                    rows={2}
                    InputProps={{ sx: { px: 2, py: 1 } }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div>
        <LinearProgress />
      </div>
    );
  }

  if (!data) {
    return (
      <MainCard title="Update Student">
        <Typography variant="h6" color="error">
          Student not found
        </Typography>
      </MainCard>
    );
  }

  return (
    <MainCard 
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4">Update Student - Registration Wizard</Typography>
                     {data && (
             <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
               <Typography variant="body2" color="textSecondary">Status:</Typography>
               <Chip 
                 label={data.status || 'pending'} 
                 color={
                   data.status === 'completed' ? 'success' : 
                   data.status === 'incomplete' ? 'warning' : 'default'
                 }
                 size="small"
               />
               {data.completionStatus && (
                 <Box sx={{ ml: 2 }}>
                   <Typography variant="caption" color="textSecondary" display="block">
                     Completion Progress:
                   </Typography>
                   <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                     {['step1', 'step2', 'step3', 'step4', 'step5'].map((step, index) => (
                       <Box
                         key={step}
                         sx={{
                           width: 8,
                           height: 8,
                           borderRadius: '50%',
                           bgcolor: data.completionStatus[step] ? 'success.main' : 'grey.300',
                           border: '1px solid',
                           borderColor: data.completionStatus[step] ? 'success.main' : 'grey.400'
                         }}
                         title={`Step ${index + 1}: ${step === 'step1' ? 'Personal Details' : 
                                                   step === 'step2' ? 'Course Enrollment' :
                                                   step === 'step3' ? 'Academic Details' :
                                                   step === 'step4' ? 'Required Documents' : 'Emergency Contact'}`}
                       />
                     ))}
                   </Box>
                 </Box>
               )}
             </Box>
           )}
        </Box>
      }
    >
      <Formik 
        initialValues={getInitialValues()} 
        validationSchema={validationSchema} 
        onSubmit={handleSubmit}
        enableReinitialize
      >
        {({ errors, handleSubmit, touched, values, setFieldValue, setTouched, setFieldError }) => {
          console.log('Form render - errors:', errors);
          console.log('Form render - touched:', touched);
          console.log('Form render - values:', values);
          
          return (
            <Form onSubmit={(e) => {
              console.log('Form submit event triggered, activeStep:', activeStep, 'steps.length:', steps.length);
              if (activeStep !== steps.length - 1) {
                console.log('Preventing form submission - not on final step');
                e.preventDefault();
                e.stopPropagation();
                return false;
              }
              console.log('Allowing form submission - on final step');
              handleSubmit(e);
            }} onKeyDown={(e) => {
              // Prevent form submission on Enter key unless on final step
              if (e.key === 'Enter' && activeStep !== steps.length - 1) {
                e.preventDefault();
                e.stopPropagation();
                return false;
              }
            }} noValidate>
            <Box sx={{ width: '100%', mb: 4 }}>
              <Stepper activeStep={activeStep} alternativeLabel>
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Box>

            <Box sx={{ mt: 2, mb: 4 }}>
              {renderStepContent(activeStep, values, errors, touched, setFieldValue)}
            </Box>

            {activeStep === steps.length - 1 && (
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
                Click &quot;Update Student&quot; to submit your changes.
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
              <Button
                type="button"
                disabled={activeStep === 0}
                onClick={handleBack}
                startIcon={<ArrowLeftOutlined />}
                variant="outlined"
              >
                Back
              </Button>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                {activeStep >= 2 && activeStep < steps.length - 1 && (
                  <Button
                    type="button"
                    variant="outlined"
                    onClick={() => setActiveStep((prevActiveStep) => prevActiveStep + 1)}
                  >
                    Skip
                  </Button>
                )}
                
                {activeStep === steps.length - 1 ? (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={submitting}
                  startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveOutlined />}
                  onClick={() => {
                    console.log('Update Student button clicked, setting submitButtonClicked to true');
                    setSubmitButtonClicked(true);
                  }}
                >
                  {submitting ? 'Updating...' : 'Update Student'}
                </Button>
                ) : (
                                     <Button
                     type="button"
                     variant="contained"
                     onClick={(e) => {
                       e.preventDefault();
                       e.stopPropagation();
                       handleNext(values, { setTouched, setFieldError });
                     }}
                     endIcon={<ArrowRightOutlined />}
                   >
                     Next
                 </Button>
                )}
              </Box>
            </Box>
          </Form>
        );
        }}
      </Formik>
    </MainCard>
  );
};

export default UpdateStudent;
