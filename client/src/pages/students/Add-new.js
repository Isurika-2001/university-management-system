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
  FormHelperText
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
import { apiRoutes } from 'config';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuthContext } from 'context/useAuthContext';

const steps = [
  'Personal Details',
  'Course Details',
  'Payment Schema',
  'Academic Details (Optional)',
  'Required Documents',
  'Emergency Contact (Optional)'
];

const AddStudent = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [courseOptions, setCourseOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [batchOptionsMap, setBatchOptionsMap] = useState({});
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
    fetchCourses();
    fetchRequiredDocuments();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
    fetchBatches(selectedCourse);
    } else {
      setBatchOptions([]);
    }
  }, [selectedCourse]);

  // Fetch course options
  async function fetchCourses() {
    try {
      const response = await fetch(apiRoutes.courseRoute, {
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
      setCourseOptions(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  // Fetch batch options
  async function fetchBatches(courseId) {
    if (!courseId) {
      setBatchOptions([]);
      return;
    }

    try {
      const response = await fetch(apiRoutes.batchRoute + `course/${courseId}`, {
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

      setBatchOptions(data);
      // Store batches for this course in the map
      setBatchOptionsMap(prev => ({
        ...prev,
        [courseId]: data
      }));
    } catch (error) {
      console.error('Error fetching batches:', error);
      return [];
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

  const initialValues = {
     // Personal Details (Step 1)
    firstName: '',
    lastName: '',
    dob: '',
    nic: '',
    address: '',
    mobile: '',
    homeContact: '',
    email: '',

     // Course Details (Step 2)
     enrollments: [],

    // Payment Schema (Step 3 - Required)
     paymentSchema: {
       courseFee: '',
       isDiscountApplicable: false,
       discountType: 'amount', // 'amount' | 'percentage'
       discountValue: '',
       downPayment: '',
       numberOfInstallments: '',
      installmentStartDate: '',
      paymentFrequency: 'monthly'
     },

     // Academic Details (Step 3 - Optional)
     highestAcademicQualification: '',
     qualificationDescription: '',

     // Required Documents (Step 4 - Optional)
     requiredDocuments: [],

     // Emergency Contact (Step 5 - Optional)
     emergencyContact: {
       name: '',
       relationship: '',
       phone: '',
       email: '',
       address: ''
     }
   };
   
   console.log('Initial values:', initialValues);

  const validationSchema = Yup.object().shape({
    // Personal Details validation (Step 1 - Required)
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

    // Course Details validation (Step 2 - Required)
    enrollments: Yup.array().of(
      Yup.object().shape({
        courseId: Yup.string().required('Course is required'),
        batchId: Yup.string().required('Batch is required')
      })
    ).min(1, 'At least one course enrollment is required'),

    // Payment Schema validation (Step 3 - Required)
    paymentSchema: Yup.object().shape({
      courseFee: Yup.number()
        .transform((value, originalValue) => (originalValue === '' || originalValue === null ? undefined : Number(originalValue)))
        .typeError('Course fee is required')
        .min(0, 'Must be >= 0')
        .required('Course fee is required'),
      isDiscountApplicable: Yup.boolean().optional(),
      discountType: Yup.string()
        .oneOf(['amount', 'percentage'])
        .when('isDiscountApplicable', {
          is: true,
          then: (schema) => schema.required('Discount type is required'),
          otherwise: (schema) => schema.optional()
        }),
      discountValue: Yup.number()
        .transform((value, originalValue) => (originalValue === '' || originalValue === null ? 0 : Number(originalValue)))
        .when('isDiscountApplicable', {
          is: true,
          then: (schema) => schema.typeError('Discount is required').min(0, 'Must be >= 0').required('Discount is required'),
          otherwise: (schema) => schema.min(0, 'Must be >= 0')
        }),
      downPayment: Yup.number()
        .transform((value, originalValue) => (originalValue === '' || originalValue === null ? undefined : Number(originalValue)))
        .typeError('Downpayment is required')
        .min(0, 'Must be >= 0')
        .required('Downpayment is required'),
      numberOfInstallments: Yup.number()
        .transform((value, originalValue) => (originalValue === '' || originalValue === null ? undefined : Number(originalValue)))
        .typeError('No. of installments is required')
        .integer('Must be an integer')
        .min(1, 'At least 1')
        .required('No. of installments is required'),
      installmentStartDate: Yup.string().required('Installment start date is required'),
      paymentFrequency: Yup.string().oneOf(['monthly', 'each_3_months', 'each_6_months']).required('Payment frequency is required'),
    }),
    
    // Academic Details validation (Step 4 - Optional)
    highestAcademicQualification: Yup.string().optional(),
    qualificationDescription: Yup.string().optional(),

    // Required Documents validation (Step 5 - Optional)
    requiredDocuments: Yup.array().optional(),

    // Emergency Contact validation (Step 6 - Optional)
    emergencyContact: Yup.object().shape({
      name: Yup.string().optional(),
      relationship: Yup.string().optional(),
      phone: Yup.string().matches(/^\+?\d{10,12}$/, 'Phone should be 10 to 12 digits with an optional leading + sign').optional(),
      email: Yup.string().email('Invalid email format').optional(),
      address: Yup.string().optional()
    }).optional()
  });

     const handleNext = async (values, { setTouched, setFieldError, validateForm }) => {
     console.log('handleNext called, activeStep:', activeStep);
     
    // Validate steps 1, 2 and 3 (Personal Details, Course Details and Payment Schema)
     if (activeStep === 0) {
       // Validate Personal Details (Step 1 - Required)
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
       // Validate Course Details (Step 2 - Required)
       console.log('Validating course details, enrollments:', values.enrollments);
       if (!values.enrollments || values.enrollments.length === 0) {
         setFieldError('enrollments', 'At least one course enrollment is required');
         setTouched({ enrollments: true });
         return;
       }
       
       // Validate each enrollment
       let hasErrors = false;
       values.enrollments.forEach((enrollment, index) => {
         console.log(`Validating enrollment ${index}:`, enrollment);
         if (!enrollment.courseId || !enrollment.batchId) {
           console.log(`Enrollment ${index} has missing data:`, { courseId: enrollment.courseId, batchId: enrollment.batchId });
           if (!enrollment.courseId) setFieldError(`enrollments.${index}.courseId`, 'Course is required');
           if (!enrollment.batchId) setFieldError(`enrollments.${index}.batchId`, 'Intake is required');
           hasErrors = true;
         }
       });
       
       if (hasErrors) {
         setTouched({ enrollments: true });
         return;
       }
     }

    if (activeStep === 2) {
      // Validate Payment Schema (Step 3 - Required via Yup)
      const formErrors = await validateForm();
      if (formErrors && formErrors.paymentSchema) {
        // mark all paymentSchema fields as touched for error display
        setTouched({
          paymentSchema: {
            courseFee: true,
            isDiscountApplicable: true,
            discountType: true,
            discountValue: true,
            downPayment: true,
            numberOfInstallments: true,
            installmentStartDate: true,
            paymentFrequency: true
          }
        }, true);
        return;
      }
    }

    // Steps 4, and 5 are optional - no validation needed
     console.log('Moving to next step from', activeStep, 'to', activeStep + 1);
     setActiveStep((prevActiveStep) => prevActiveStep + 1);
   };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async (values) => {
    console.log('Submitting:', values);
    console.log('Enrollments in submit:', values.enrollments);
    try {
      setSubmitting(true);

             // Transform requiredDocuments array to the format expected by the server
       // Get the first enrollment for the student creation (server expects single courseId/batchId)
       const firstEnrollment = values.enrollments && values.enrollments.length > 0 ? values.enrollments[0] : null;
       
       if (!firstEnrollment || !firstEnrollment.courseId || !firstEnrollment.batchId) {
         showErrorSwal('At least one course enrollment is required');
         return;
       }
       
       const studentData = {
         firstName: values.firstName,
         lastName: values.lastName,
         dob: values.dob,
         nic: values.nic,
         address: values.address,
         mobile: values.mobile,
         homeContact: values.homeContact,
         email: values.email,
        paymentSchema: values.paymentSchema,
         // Optional fields - only include if they have non-empty values
         ...(values.highestAcademicQualification && values.highestAcademicQualification.trim() !== '' && { 
           highestAcademicQualification: values.highestAcademicQualification 
         }),
         ...(values.qualificationDescription && values.qualificationDescription.trim() !== '' && { 
           qualificationDescription: values.qualificationDescription 
         }),
         // Required documents - only include if they exist and have values
         ...(Array.isArray(values.requiredDocuments) && values.requiredDocuments.length > 0 && {
           requiredDocuments: values.requiredDocuments.map(docId => ({
             documentId: docId,
             isProvided: true
           }))
         }),
         // Emergency contact - only include if it has all required values
         ...(values.emergencyContact && 
             values.emergencyContact.name && values.emergencyContact.name.trim() !== '' &&
             values.emergencyContact.relationship && values.emergencyContact.relationship.trim() !== '' &&
             values.emergencyContact.phone && values.emergencyContact.phone.trim() !== '' && {
           emergencyContact: values.emergencyContact
         }),
         // Include the first enrollment data for student creation
         courseId: firstEnrollment.courseId,
         batchId: firstEnrollment.batchId
       };

             // Create student first
       console.log('Sending student data to server:', studentData);
       console.log('Optional fields check:');
       console.log('- highestAcademicQualification:', values.highestAcademicQualification);
       console.log('- qualificationDescription:', values.qualificationDescription);
       console.log('- requiredDocuments:', values.requiredDocuments);
       console.log('- emergencyContact:', values.emergencyContact);
       console.log('Emergency contact fields:');
       console.log('- name:', values.emergencyContact?.name);
       console.log('- relationship:', values.emergencyContact?.relationship);
       console.log('- phone:', values.emergencyContact?.phone);
       console.log('Will include emergency contact:', !!(values.emergencyContact && 
             values.emergencyContact.name && values.emergencyContact.name.trim() !== '' &&
             values.emergencyContact.relationship && values.emergencyContact.relationship.trim() !== '' &&
             values.emergencyContact.phone && values.emergencyContact.phone.trim() !== ''));
       const studentResponse = await fetch(apiRoutes.studentRoute, {
        method: 'POST',   
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`
        },
         body: JSON.stringify(studentData)
       });

             const studentResponseData = await studentResponse.json();

       if (!studentResponse.ok) {
         console.error('Student creation failed:', studentResponseData);
         
         // Format error message with message in bold and error as sub-text
         let errorMessage = 'Failed to register student';
         
         if (studentResponseData.message && studentResponseData.error) {
           errorMessage = `<strong>${studentResponseData.message}</strong><br/><small>${studentResponseData.error}</small>`;
         } else if (studentResponseData.message) {
           errorMessage = `<strong>${studentResponseData.message}</strong>`;
         } else if (studentResponseData.error) {
           errorMessage = `<strong>Error:</strong><br/><small>${studentResponseData.error}</small>`;
         }
         
         // Always show the actual error message from the server, regardless of status code
         showErrorSwal(errorMessage);
         
         setSubmitting(false);
         return;
       }

       // Show appropriate message based on completion status
       let successMessage = studentResponseData.message || 'Student registered successfully';
       
       // If we have completion status details, provide more specific feedback
       if (studentResponseData.data && studentResponseData.data.completionStatus) {
         const completionStatus = studentResponseData.data.completionStatus;
         
         if (completionStatus.overall === 'completed') {
           successMessage = 'Student registered successfully! Registration is complete.';
         } else if (completionStatus.overall === 'incomplete') {
           const missingSteps = [];
           if (!completionStatus.step1) missingSteps.push('Personal Details');
           if (!completionStatus.step2) missingSteps.push('Course Enrollment');
           if (!completionStatus.step3) missingSteps.push('Academic Details');
           if (!completionStatus.step4) missingSteps.push('Required Documents');
           if (!completionStatus.step5) missingSteps.push('Emergency Contact');
           
           successMessage = `Student registered successfully! To complete registration, please provide: ${missingSteps.join(', ')}`;
         } else {
           successMessage = 'Student registered successfully! Registration is still pending.';
         }
       }

                    // Create additional enrollments for the student (skip the first one as it's already created)
       console.log('About to create additional enrollments:', values.enrollments);
       if (values.enrollments && values.enrollments.length > 1) {
         // Skip the first enrollment as it's already created with the student
         for (let i = 1; i < values.enrollments.length; i++) {
           const enrollment = values.enrollments[i];
           console.log('Processing additional enrollment:', enrollment);
           if (!enrollment.courseId || !enrollment.batchId) {
             console.error('Invalid enrollment data:', enrollment);
             showErrorSwal('Invalid enrollment data: missing courseId or intake');
             return;
           }
           
           const enrollmentData = {
             studentId: studentResponseData.data.studentId,
             courseId: enrollment.courseId,
             batchId: enrollment.batchId
           };

          const enrollmentResponse = await fetch(apiRoutes.enrollmentRoute, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${user.token}`
            },
            body: JSON.stringify(enrollmentData)
          });

                     if (!enrollmentResponse.ok) {
             const errorData = await enrollmentResponse.json();
             console.error('Enrollment creation failed:', errorData);
             
             // Format error message with message in bold and error as sub-text
             let errorMessage = 'Student created but additional enrollment creation failed';
             
             if (errorData.message && errorData.error) {
               errorMessage = `<strong>${errorData.message}</strong><br/><small>${errorData.error}</small>`;
             } else if (errorData.message) {
               errorMessage = `<strong>${errorData.message}</strong>`;
             } else if (errorData.error) {
               errorMessage = `<strong>Enrollment Error:</strong><br/><small>${errorData.error}</small>`;
             } else {
               errorMessage = '<strong>Enrollment Error:</strong><br/><small>Unknown error</small>';
             }
             
             showErrorSwal(errorMessage);
             return;
           }
         }
       }

       showSuccessSwal(successMessage);
       // Reset form or redirect
       window.location.reload();

      console.log('Student added successfully');
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      
      // Show a user-friendly error message
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      showErrorSwal(errorMessage);
    } finally {
      setSubmitting(false);
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
                <Typography variant="h5">Course Details</Typography>
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Current Enrollments:
                </Typography>
                {values.enrollments && values.enrollments.length > 0 ? (
                  values.enrollments.map((enrollment, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="textSecondary">
                            Course: {enrollment.courseName || 'Not selected'}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <Typography variant="body2" color="textSecondary">
                            Intake: {enrollment.batchName || 'Not selected'}
                          </Typography>
                        </Grid>
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
                      </Grid>
                    </Box>
                  ))
                ) : (
                  <Typography variant="body2" color="textSecondary">
                    No enrollments yet
                  </Typography>
                )}
              </Box>

              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Add New Enrollment:
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={5}>
                    <FormControl fullWidth>
                      <InputLabel>Course</InputLabel>
                      <Select
                        value={selectedCourse}
                        onChange={(e) => {
                          const selected = e.target.value;
                          setSelectedCourse(selected);
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
                          value=""
                          onChange={(e) => {
                            const selectedBatch = e.target.value;
                            console.log('Selected batch:', selectedBatch);
                            console.log('Selected course:', selectedCourse);
                            
                            const newEnrollment = {
                              courseId: selectedCourse,
                              batchId: selectedBatch,
                              courseName: courseOptions.find(c => c._id === selectedCourse)?.name || '',
                              batchName: batchOptions.find(b => b._id === selectedBatch)?.name || ''
                            };
                            
                            console.log('New enrollment object:', newEnrollment);
                            
                            const currentEnrollments = values.enrollments || [];
                            const updatedEnrollments = [...currentEnrollments, newEnrollment];
                            console.log('Updated enrollments array:', updatedEnrollments);
                            
                            setFieldValue('enrollments', updatedEnrollments);
                            
                            // Reset selections
                            setSelectedCourse('');
                          }}
                          label="Intake"
                          disabled={!selectedCourse}
                        >
                      {batchOptions.map((batch) => (
                        <MenuItem key={batch._id} value={batch._id}>
                          {batch.name}
                        </MenuItem>
                      ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={2}>
                    <Button
                      variant="contained"
                      onClick={() => {
                        const newEnrollment = {
                          courseId: '',
                          batchId: '',
                          courseName: '',
                          batchName: ''
                        };
                        
                        const currentEnrollments = values.enrollments || [];
                        setFieldValue('enrollments', [...currentEnrollments, newEnrollment]);
                      }}
                      fullWidth
                    >
                      Add Empty
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {values.enrollments && values.enrollments.length > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Edit Enrollments:
                  </Typography>
                  {values.enrollments.map((enrollment, index) => (
                    <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={5}>
                          <FormControl fullWidth>
                            <InputLabel>Course</InputLabel>
                                                          <Select
                                value={enrollment.courseId || ''}
                                onChange={(e) => {
                                  const selected = e.target.value;
                                  const updatedEnrollments = [...values.enrollments];
                                  updatedEnrollments[index] = {
                                    ...updatedEnrollments[index],
                                    courseId: selected,
                                    courseName: courseOptions.find(c => c._id === selected)?.name || '',
                                    batchId: '', // Reset batch when course changes
                                    batchName: ''
                                  };
                                  setFieldValue('enrollments', updatedEnrollments);
                                  
                                  // Fetch batches for the selected course
                                  if (selected) {
                                    fetchBatches(selected);
                                  }
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
                                  const updatedEnrollments = [...values.enrollments];
                                  const courseBatches = batchOptionsMap[enrollment.courseId] || [];
                                  updatedEnrollments[index] = {
                                    ...updatedEnrollments[index],
                                    batchId: selected,
                                    batchName: courseBatches.find(b => b._id === selected)?.name || ''
                                  };
                                  setFieldValue('enrollments', updatedEnrollments);
                                }}
                                label="Intake"
                                disabled={!enrollment.courseId}
                              >
                                {(batchOptionsMap[enrollment.courseId] || []).map((batch) => (
                                  <MenuItem key={batch._id} value={batch._id}>
                                    {batch.name}
                                  </MenuItem>
                                ))}
                              </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        );

      case 2:
        // Payment Schema (Required)
        {
          const courseFee = parseFloat(values.paymentSchema?.courseFee || 0) || 0;
          const discountApplicable = !!values.paymentSchema?.isDiscountApplicable;
          const discountType = values.paymentSchema?.discountType || 'amount';
          const discountValueRaw = parseFloat(values.paymentSchema?.discountValue || 0) || 0;
          const downPayment = parseFloat(values.paymentSchema?.downPayment || 0) || 0;
          const numberOfInstallments = parseInt(values.paymentSchema?.numberOfInstallments || 0, 10) || 0;

          const discountAmount = discountApplicable
            ? (discountType === 'percentage'
                ? (courseFee * discountValueRaw) / 100
                : discountValueRaw)
            : 0;
          const discountedFee = Math.max(courseFee - discountAmount, 0);
          const amountToFinance = Math.max(discountedFee - downPayment, 0);
          const installmentAmount = numberOfInstallments > 0 ? amountToFinance / numberOfInstallments : 0;

          return (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <ReadOutlined style={{ marginRight: 8, fontSize: 24 }} />
                  <Typography variant="h5">Payment Schema</Typography>
                </Box>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {`Configure the student's payment plan. All fields are required.`}
                </Typography>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label="Course Fee"
                      variant="outlined"
                      name="paymentSchema.courseFee"
                      type="number"
                      fullWidth
                      InputProps={{ sx: { px: 2, py: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={values.paymentSchema?.isDiscountApplicable || false}
                          onChange={(e) => setFieldValue('paymentSchema.isDiscountApplicable', e.target.checked)}
                        />
                      }
                      label="Discount Applicable?"
                    />
                  </Grid>

                  {discountApplicable && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth error={touched?.paymentSchema?.discountType && !!errors?.paymentSchema?.discountType}>
                          <InputLabel>Discount Type</InputLabel>
                          <Select
                            label="Discount Type"
                            value={discountType}
                            onChange={(e) => setFieldValue('paymentSchema.discountType', e.target.value)}
                          >
                            <MenuItem value="amount">Amount</MenuItem>
                            <MenuItem value="percentage">Percentage</MenuItem>
                          </Select>
                          {touched?.paymentSchema?.discountType && errors?.paymentSchema?.discountType && (
                            <FormHelperText>{errors.paymentSchema.discountType}</FormHelperText>
                          )}
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Field
                          as={TextField}
                          label={discountType === 'percentage' ? 'Discount (%)' : 'Discount Amount'}
                          variant="outlined"
                          name="paymentSchema.discountValue"
                          type="number"
                          fullWidth
                          error={touched?.paymentSchema?.discountValue && !!errors?.paymentSchema?.discountValue}
                          helperText={<ErrorMessage name="paymentSchema.discountValue" />}
                          InputProps={{ sx: { px: 2, py: 1 } }}
                        />
                      </Grid>
                    </>
                  )}

                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label="Downpayment"
                      variant="outlined"
                      name="paymentSchema.downPayment"
                      type="number"
                      fullWidth
                      error={touched?.paymentSchema?.downPayment && !!errors?.paymentSchema?.downPayment}
                      helperText={<ErrorMessage name="paymentSchema.downPayment" />}
                      InputProps={{ sx: { px: 2, py: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label="No. of Installments"
                      variant="outlined"
                      name="paymentSchema.numberOfInstallments"
                      type="number"
                      fullWidth
                      error={touched?.paymentSchema?.numberOfInstallments && !!errors?.paymentSchema?.numberOfInstallments}
                      helperText={<ErrorMessage name="paymentSchema.numberOfInstallments" />}
                      InputProps={{ sx: { px: 2, py: 1 } }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Field
                      as={TextField}
                      label="Installment Start Date"
                      variant="outlined"
                      name="paymentSchema.installmentStartDate"
                      type="date"
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      error={touched?.paymentSchema?.installmentStartDate && !!errors?.paymentSchema?.installmentStartDate}
                      helperText={<ErrorMessage name="paymentSchema.installmentStartDate" />}
                      InputProps={{ sx: { px: 2, py: 1 } }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth error={touched?.paymentSchema?.paymentFrequency && !!errors?.paymentSchema?.paymentFrequency}>
                      <InputLabel>Payment to be made</InputLabel>
                      <Select
                        label="Payment to be made"
                        value={values.paymentSchema?.paymentFrequency || 'monthly'}
                        onChange={(e) => setFieldValue('paymentSchema.paymentFrequency', e.target.value)}
                      >
                        <MenuItem value="monthly">Monthly</MenuItem>
                        <MenuItem value="each_3_months">Each 3 months</MenuItem>
                        <MenuItem value="each_6_months">Each 6 months</MenuItem>
                      </Select>
                      {touched?.paymentSchema?.paymentFrequency && errors?.paymentSchema?.paymentFrequency && (
                        <FormHelperText>{errors.paymentSchema.paymentFrequency}</FormHelperText>
                      )}
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ p: 2, border: '1px dashed #e0e0e0', borderRadius: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>Calculated Summary</Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">Discounted Course Fee: {discountedFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                          <Typography variant="caption" color="textSecondary">(Course Fee - Discount)</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">Amount to Finance: {amountToFinance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                          <Typography variant="caption" color="textSecondary">(Discounted Fee - Downpayment)</Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2">Installment Amount (Premium): {installmentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</Typography>
                          <Typography variant="caption" color="textSecondary">Auto-calculated per installment</Typography>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          );
        }

      case 3:
        return (
          <Card>
            <CardContent>
                             <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                 <ReadOutlined style={{ marginRight: 8, fontSize: 24 }} />
                 <Typography variant="h5">Academic Details (Optional)</Typography>
               </Box>
               <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                 This step is optional. You can skip it and complete it later when updating the student profile.
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

      case 4:
        return (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FileTextOutlined style={{ marginRight: 8, fontSize: 24 }} />
                <Typography variant="h5">Required Documents</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                This step can be skipped during registration, but all required documents must be provided to complete the student&apos;s registration status.
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

      case 5:
        return (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PhoneOutlined style={{ marginRight: 8, fontSize: 24 }} />
                <Typography variant="h5">Emergency Contact (Optional)</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                This step is optional. You can skip it and complete it later when updating the student profile.
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

  return (
    <MainCard title="Student Registration Wizard">
             <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmit}>
         {({ errors, handleSubmit, touched, values, setFieldValue, setTouched, setFieldError, validateForm }) => {
           console.log('Form values:', values);
           console.log('Current enrollments in form:', values.enrollments);
           return (
                     <Form onSubmit={(e) => {
             console.log('Form onSubmit triggered, activeStep:', activeStep, 'steps.length:', steps.length);
             // Only allow form submission on the final step
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
                Click &quot;Complete Registration&quot; to submit your student registration.
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

              <Box sx={{ display: 'flex', gap: 2 }}>
                {activeStep === steps.length - 1 ? (
                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveOutlined />}
                  >
                    {submitting ? 'Registering...' : 'Complete Registration'}
                  </Button>
                ) : (
                  <>
                                         <Button
                       type="button"
                       variant="contained"
                       onClick={(e) => {
                         e.preventDefault();
                         e.stopPropagation();
                         handleNext(values, { setTouched, setFieldError, validateForm });
                       }}
                       endIcon={<ArrowRightOutlined />}
                     >
                       Next
                     </Button>
                   {/* Show Skip button for optional steps (4, 5) */}
                   {activeStep >= 3 && activeStep < steps.length - 1 && (
                      <Button
                        type="button"
                        variant="outlined"
                        onClick={() => setActiveStep((prevActiveStep) => prevActiveStep + 1)}
                      >
                        Skip
                      </Button>
                    )}
                  </>
                )}
              </Box>
                         </Box>
          </Form>
        );
        }}
      </Formik>
      {/** Completion Progress (6 steps) **/}
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="textSecondary">Completion Progress:</Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {['step1', 'step2', 'step3', 'step4', 'step5', 'step6'].map((step, index) => (
            <Box
              key={step}
              sx={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                bgcolor: 'grey.300',
                border: '1px solid',
                borderColor: 'grey.400'
              }}
              title={`Step ${index + 1}: ${
                step === 'step1' ? 'Personal Details' :
                step === 'step2' ? 'Course Enrollment' :
                step === 'step3' ? 'Payment Schema' :
                step === 'step4' ? 'Academic Details' :
                step === 'step5' ? 'Required Documents' : 'Emergency Contact'
              }`}
            />
          ))}
        </Box>
      </Box>
    </MainCard>
  );
};

export default AddStudent;
