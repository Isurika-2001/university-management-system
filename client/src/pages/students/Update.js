import React, { useState, useEffect, useCallback } from 'react';
import { Button, CircularProgress, Typography, Box, Stepper, Step, StepLabel } from '@mui/material';
import {
  UserOutlined,
  BookOutlined,
  PhoneOutlined,
  FileTextOutlined,
  ReadOutlined,
  ArrowRightOutlined,
  ArrowLeftOutlined,
  SaveOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import { apiRoutes } from 'config';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuthContext } from 'context/useAuthContext';
import { useParams, useNavigate } from 'react-router-dom';

// Step components
import StepPersonalDetails from './steps/StepPersonalDetails';
import StepCourseDetails from './steps/StepCourseDetails';
import StepPaymentSchema from './steps/StepPaymentSchema';
import StepAcademicDetails from './steps/StepAcademicDetails';
import StepRequiredDocuments from './steps/StepRequiredDocuments';
import StepEmergencyContact from './steps/StepEmergencyContact';

const steps = [
  'Personal Details',
  'Course Details',
  'Payment Schema',
  'Academic Details (Optional)',
  'Required Documents',
  'Emergency Contact (Optional)'
];

const academicQualificationOptions = ['O-Level', 'A-Level', 'Diploma', "Bachelor's Degree", "Master's Degree", 'PhD', 'Other'];

const validationSchema = Yup.object().shape({
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

  enrollments: Yup.array()
    .of(
      Yup.object().shape({
        courseId: Yup.string().required('Course is required'),
        batchId: Yup.string().required('Batch is required')
      })
    )
    .min(1, 'At least one course enrollment is required'),

  paymentSchema: Yup.object().optional(),

  highestAcademicQualification: Yup.string().optional(),
  qualificationDescription: Yup.string().optional(),
  requiredDocuments: Yup.array().optional(),
  emergencyContact: Yup.object()
    .shape({
      name: Yup.string().optional(),
      relationship: Yup.string().optional(),
      phone: Yup.string()
        .matches(/^\+?\d{10,12}$/, 'Phone should be 10 to 12 digits with an optional leading + sign')
        .optional(),
      email: Yup.string().email('Invalid email format').optional(),
      address: Yup.string().optional()
    })
    .optional()
});

const UpdateStudent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [courseOptions, setCourseOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [batchOptionsMap, setBatchOptionsMap] = useState({});
  const [studentData, setStudentData] = useState(null);
  const { user } = useAuthContext();

  // By default, next button is enabled
  const [nextDisabled, setNextDisabled] = useState(false);

  // Track completion status for each step
  const [stepCompletionStatus, setStepCompletionStatus] = useState({
    0: false, // Personal Details - required
    1: false, // Course Details - required
    2: false, // Payment Schema - required
    3: false, // Academic Details - optional
    4: false, // Required Documents - optional
    5: false // Emergency Contact - optional
  });

  // Reset nextDisabled when active step changes
  useEffect(() => {
    setNextDisabled(false);
  }, [activeStep]);

  const Toast = withReactContent(
    Swal.mixin({
      toast: true,
      position: 'bottom',
      customClass: { popup: 'colored-toast' },
      background: 'primary',
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true,
      allowHtml: true
    })
  );

  const showSuccessSwal = (e) => Toast.fire({ icon: 'success', title: e });
  const showErrorSwal = (e) => Toast.fire({ icon: 'error', title: e });

  // Function to prepare initial values from student data
  const prepareInitialValues = useCallback(() => {
    if (!studentData) return {};

    console.log('Preparing initial values from student data:', studentData);

    // Get enrollments from studentData (they come directly from the API response)
    const studentEnrollments = studentData.enrollments || [];
    console.log('Student enrollments:', studentEnrollments);

    // Convert required documents from the student's data
    const studentRequiredDocs = studentData.requiredDocuments || [];
    const providedDocIds = studentRequiredDocs.filter((doc) => doc.isProvided).map((doc) => doc.documentId);
    console.log('Provided document IDs:', providedDocIds);

    // Prepare payment schema from enrollments
    const paymentSchema = {};
    studentEnrollments.forEach((enrollment) => {
      if (enrollment.paymentSchema && enrollment.courseId) {
        // Use the courseId._id if it's populated, otherwise use courseId directly
        const courseId = enrollment.courseId._id || enrollment.courseId;
        paymentSchema[courseId] = enrollment.paymentSchema;
      }
    });
    console.log('Payment schema:', paymentSchema);

    // Prepare enrollments array with correct IDs and names
    const enrollmentArray = studentEnrollments.map((enrollment) => ({
      courseId: enrollment.courseId._id || enrollment.courseId,
      batchId: enrollment.batchId._id || enrollment.batchId,
      courseName: enrollment.courseId?.name || enrollment.course?.name || '',
      batchName: enrollment.batchId?.name || enrollment.batch?.name || ''
    }));
    console.log('Enrollment array:', enrollmentArray);

    const initialValues = {
      // Step 1 - Personal Details
      firstName: studentData.firstName || '',
      lastName: studentData.lastName || '',
      dob: studentData.dob
        ? typeof studentData.dob === 'string'
          ? studentData.dob.split('T')[0]
          : studentData.dob.toISOString().split('T')[0]
        : '',
      nic: studentData.nic || '',
      address: studentData.address || '',
      mobile: studentData.mobile || '',
      homeContact: studentData.homeContact || '',
      email: studentData.email || '',

      // Step 2 - Course Details
      enrollments: enrollmentArray,
      selectedCourses: enrollmentArray.map((enr) => enr.courseId),

      // Step 3 - Payment Schema
      paymentSchema: paymentSchema,

      // Step 4 - Academic Details
      highestAcademicQualification: studentData.highestAcademicQualification || '',
      qualificationDescription: studentData.qualificationDescription || '',

      // Step 5 - Required Documents
      requiredDocuments: providedDocIds,

      // Step 6 - Emergency Contact
      emergencyContact: {
        name: studentData.emergencyContact?.name || '',
        relationship: studentData.emergencyContact?.relationship || '',
        phone: studentData.emergencyContact?.phone || '',
        email: studentData.emergencyContact?.email || '',
        address: studentData.emergencyContact?.address || ''
      }
    };

    console.log('Final initial values:', initialValues);
    return initialValues;
  }, [studentData]);

  // Function to check if a step is completed
  const checkStepCompletion = useCallback(
    (stepIndex, values) => {
      switch (stepIndex) {
        case 0: // Personal Details
          return !!(values.firstName && values.lastName && values.dob && values.nic && values.address && values.mobile && values.email);

        case 1: // Course Details
          return !!(values.enrollments && values.enrollments.length > 0 && values.enrollments.every((enr) => enr.courseId && enr.batchId));

        case 2: {
          // Payment Schema
          // Check if at least one course has a complete payment schema
          const selectedCourses = values.selectedCourses || [];
          console.log('Update - Payment Schema - selectedCourses:', selectedCourses);
          if (selectedCourses.length === 0) return false;

          const paymentSchemas = values.paymentSchema || {};
          console.log('Update - Payment Schema - paymentSchemas:', paymentSchemas);

          // Check if any course has a complete payment schema
          const result = selectedCourses.some((courseId) => {
            const schema = paymentSchemas[courseId] || {};
            console.log(`Update - Payment Schema - checking course ${courseId}:`, schema);
            const requiredFields = ['courseFee', 'downPayment', 'numberOfInstallments', 'installmentStartDate', 'paymentFrequency'];

            // Check all required fields are filled
            const allFieldsFilled = requiredFields.every((field) => {
              const value = schema[field];
              return value !== undefined && value !== null && value !== '';
            });

            // Check discount fields if applicable
            const discountValid =
              !schema.isDiscountApplicable ||
              (schema.discountValue && schema.discountValue !== '' && schema.discountType && schema.discountType !== '');

            const isComplete = allFieldsFilled && discountValid;
            console.log(`Update - Payment Schema - course ${courseId} complete:`, isComplete, { allFieldsFilled, discountValid });
            return isComplete;
          });
          console.log('Update - Payment Schema - overall result:', result);
          return result;
        }

        case 3: // Academic Details (Optional)
          // Only completed if highestAcademicQualification is selected (description alone doesn't count)
          return !!(values.highestAcademicQualification && values.highestAcademicQualification.trim());

        case 4: {
          // Required Documents (Optional)
          // Only completed if all required documents are selected
          const required = requiredDocuments.filter((doc) => doc.isRequired);
          console.log('Update - Required Documents - required docs:', required);
          console.log('Update - Required Documents - selected docs:', values.requiredDocuments);
          if (required.length === 0) {
            // No required docs means completed, but only if we've actually loaded the documents
            // This prevents the step from being marked complete before documents are fetched
            const result = requiredDocuments.length > 0;
            console.log('Update - Required Documents - no required docs, result:', result);
            return result;
          }
          const result = required.every((doc) => values.requiredDocuments && values.requiredDocuments.includes(doc._id));
          console.log('Update - Required Documents - all required selected, result:', result);
          return result;
        }

        case 5: // Emergency Contact (Optional)
          // Only completed if all required fields are provided
          return !!(
            values.emergencyContact &&
            values.emergencyContact.name &&
            values.emergencyContact.name.trim() &&
            values.emergencyContact.relationship &&
            values.emergencyContact.relationship.trim() &&
            values.emergencyContact.phone &&
            values.emergencyContact.phone.trim()
          );

        default:
          return false;
      }
    },
    [requiredDocuments]
  );

  // Function to update step completion status
  const updateStepCompletion = useCallback(
    (values) => {
      const newStatus = {};
      for (let i = 0; i < steps.length; i++) {
        const isCompleted = checkStepCompletion(i, values);
        newStatus[i] = isCompleted;
        console.log(`Update - Step ${i} (${steps[i]}): ${isCompleted ? 'COMPLETED' : 'NOT COMPLETED'}`);
      }
      console.log('Update - Step completion status:', newStatus);
      setStepCompletionStatus(newStatus);
    },
    [checkStepCompletion]
  );

  // Custom StepIcon component to show completion status
  const CustomStepIcon = ({ active, completed, icon }) => {
    if (completed) {
      return (
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: 'success.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}
        >
          <CheckOutlined style={{ fontSize: 16 }} />
        </Box>
      );
    }

    if (active) {
      return (
        <Box
          sx={{
            width: 24,
            height: 24,
            borderRadius: '50%',
            backgroundColor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white'
          }}
        >
          {icon}
        </Box>
      );
    }

    return (
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          backgroundColor: 'grey.300',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'grey.600'
        }}
      >
        {icon}
      </Box>
    );
  };

  // Fetchers
  const fetchStudent = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${apiRoutes.studentRoute}${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }
      });
      const data = await response.json();
      if (!response.ok) {
        showErrorSwal('Failed to fetch student data');
        showSuccessSwal('Student updated successfully');
        navigate('/app/students');
        return;
      }
      setStudentData(data);
    } catch (err) {
      console.error('Error fetching student:', err);
      showErrorSwal('Error fetching student data');
      navigate('/students');
    } finally {
      setLoading(false);
    }
  }, [id, user.token, navigate]);

  const fetchCourses = useCallback(async () => {
    try {
      const response = await fetch(apiRoutes.courseRoute, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }
      });
      const data = await response.json();
      if (!response.ok) return;
      setCourseOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  }, [user.token]);

  const fetchBatches = useCallback(
    async (courseId) => {
      if (!courseId) {
        setBatchOptions([]);
        return;
      }
      try {
        const response = await fetch(apiRoutes.batchRoute + `course/${courseId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }
        });
        const data = await response.json();
        if (!response.ok) return;
        setBatchOptions(data);
        setBatchOptionsMap((prev) => ({ ...prev, [courseId]: data }));
      } catch (err) {
        console.error('Error fetching batches:', err);
      }
    },
    [user.token]
  );

  const fetchRequiredDocs = useCallback(async () => {
    try {
      const response = await fetch(apiRoutes.requiredDocumentRoute, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }
      });
      const data = await response.json();
      const documents = data?.data || data;
      setRequiredDocuments(Array.isArray(documents) ? documents : []);
    } catch (err) {
      console.error('Error fetching required documents:', err);
      setRequiredDocuments([]);
    }
  }, [user.token]);

  useEffect(() => {
    fetchStudent();
    fetchCourses();
    fetchRequiredDocs();
  }, [fetchStudent, fetchCourses, fetchRequiredDocs]);

  // Update step completion when student data is loaded
  useEffect(() => {
    if (studentData) {
      console.log('Updating step completion with student data:', studentData);

      const initialValues = prepareInitialValues();
      console.log('Prepared initial values:', initialValues);
      updateStepCompletion(initialValues);

      // Get enrollments from studentData
      const studentEnrollments = studentData.enrollments || [];
      console.log('Student enrollments:', studentEnrollments);

      // Load batch options for existing enrollments
      studentEnrollments.forEach((enrollment) => {
        const courseId = enrollment.courseId._id || enrollment.courseId;
        if (courseId && !batchOptionsMap[courseId]) {
          console.log('Fetching batches for course:', courseId);
          fetchBatches(courseId);
        }
      });

      // Set selectedCourse to the first enrollment's course if not already set
      if (studentEnrollments.length > 0 && !selectedCourse) {
        const firstCourseId = studentEnrollments[0].courseId._id || studentEnrollments[0].courseId;
        setSelectedCourse(firstCourseId);
      }
    }
  }, [studentData, requiredDocuments, batchOptionsMap, fetchBatches, selectedCourse, prepareInitialValues, updateStepCompletion]);

  useEffect(() => {
    if (selectedCourse) fetchBatches(selectedCourse);
    else setBatchOptions([]);
  }, [selectedCourse, fetchBatches]);

  // Update step completion status when required documents change
  useEffect(() => {
    // This will be called when requiredDocuments change
    // The actual completion check will be done in individual step components
  }, [requiredDocuments]);

  const handleNext = async (values, { setTouched, setFieldError }) => {
    // Validate only the current step fields
    let stepErrors = {};

    if (activeStep === 0) {
      // Personal Details - validate required fields
      const personalFields = ['firstName', 'lastName', 'dob', 'nic', 'address', 'mobile', 'email'];
      personalFields.forEach((field) => {
        if (!values[field]) {
          stepErrors[field] = 'This field is required';
        }
      });

      // Validate NIC format
      if (values.nic && !/^(?:\d{9}[vVxX]|\d{12})$/.test(values.nic)) {
        stepErrors.nic =
          'NIC should either contain 9 digits with an optional last character as a letter (v/V/x/X) or have exactly 12 digits';
      }

      // Validate mobile number format
      if (values.mobile && !/^\+?\d{10,12}$/.test(values.mobile)) {
        stepErrors.mobile = 'Contact No should be 10 to 12 digits with an optional leading + sign';
      }

      // Validate home contact format if provided
      if (values.homeContact && !/^\+?\d{10,12}$/.test(values.homeContact)) {
        stepErrors.homeContact = 'Contact No should be 10 to 12 digits with an optional leading + sign';
      }

      // Validate email format
      if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
        stepErrors.email = 'Invalid email format';
      }
    }

    if (activeStep === 1) {
      // Course Details - validate enrollments
      if (!values.enrollments || values.enrollments.length === 0) {
        stepErrors.enrollments = 'At least one course enrollment is required';
      } else {
        values.enrollments.forEach((enr, idx) => {
          if (!enr.courseId) {
            stepErrors[`enrollments.${idx}.courseId`] = 'Course is required';
          }
          if (!enr.batchId) {
            stepErrors[`enrollments.${idx}.batchId`] = 'Intake is required';
          }
        });
      }
    }

    if (activeStep === 2) {
      // Payment Schema - validate payment schema for selected courses
      const selectedCourses = values.selectedCourses || [];
      if (selectedCourses.length === 0) {
        stepErrors.paymentSchema = 'Please select at least one course';
      } else {
        const paymentSchemas = values.paymentSchema || {};
        let hasValidPaymentSchema = false;

        selectedCourses.forEach((courseId) => {
          const schema = paymentSchemas[courseId] || {};
          const requiredFields = ['courseFee', 'downPayment', 'numberOfInstallments', 'installmentStartDate', 'paymentFrequency'];
          const allFieldsFilled = requiredFields.every((field) => {
            const value = schema[field];
            return value !== undefined && value !== null && value !== '';
          });
          const discountValid =
            !schema.isDiscountApplicable ||
            (schema.discountValue && schema.discountValue !== '' && schema.discountType && schema.discountType !== '');

          if (allFieldsFilled && discountValid) {
            hasValidPaymentSchema = true;
          }
        });

        if (!hasValidPaymentSchema) {
          stepErrors.paymentSchema = 'Please complete the payment schema for at least one course';
        }
      }
    }

    if (activeStep === 3) {
      // Academic Details - optional, no validation needed
    }

    if (activeStep === 4) {
      // Required Documents - optional, no validation needed
    }

    if (activeStep === 5) {
      // Emergency Contact - validate format if provided
      if (values.emergencyContact) {
        // Validate phone format if provided
        if (values.emergencyContact.phone && !/^\+?\d{10,12}$/.test(values.emergencyContact.phone)) {
          stepErrors['emergencyContact.phone'] = 'Phone should be 10 to 12 digits with an optional leading + sign';
        }

        // Validate email format if provided
        if (values.emergencyContact.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.emergencyContact.email)) {
          stepErrors['emergencyContact.email'] = 'Invalid email format';
        }

        // Validate that if any emergency contact field is filled, at least name and relationship should be provided
        const hasAnyField =
          values.emergencyContact.name ||
          values.emergencyContact.relationship ||
          values.emergencyContact.phone ||
          values.emergencyContact.email ||
          values.emergencyContact.address;

        if (hasAnyField) {
          if (!values.emergencyContact.name || !values.emergencyContact.name.trim()) {
            stepErrors['emergencyContact.name'] = 'Name is required when providing emergency contact information';
          }

          if (!values.emergencyContact.relationship || !values.emergencyContact.relationship.trim()) {
            stepErrors['emergencyContact.relationship'] = 'Relationship is required when providing emergency contact information';
          }
        }
      }
    }

    // If there are step-specific errors, show them and prevent navigation
    if (Object.keys(stepErrors).length > 0) {
      // Set field errors
      Object.keys(stepErrors).forEach((field) => {
        setFieldError(field, stepErrors[field]);
      });

      // Set touched for fields with errors
      const touchedFields = {};
      Object.keys(stepErrors).forEach((field) => {
        touchedFields[field] = true;
      });
      setTouched(touchedFields);
      return;
    }

    setActiveStep((s) => s + 1);
  };

  const handleBack = () => setActiveStep((s) => s - 1);

  const handleSubmitForm = async (values, { setFieldError }) => {
    try {
      setSubmitting(true);

      // Validate all steps and find the first step with errors
      const stepErrors = [];

      // Step 0 - Personal Details
      const personalFields = ['firstName', 'lastName', 'dob', 'nic', 'address', 'mobile', 'email'];
      const personalErrors = personalFields.filter((field) => !values[field]);
      if (personalErrors.length > 0) {
        stepErrors.push({ step: 0, errors: personalErrors });
      }

      // Step 1 - Course Details
      if (!values.enrollments || values.enrollments.length === 0) {
        stepErrors.push({ step: 1, errors: ['enrollments'] });
      }

      // Step 2 - Payment Schema
      const selectedCourses = values.selectedCourses || [];
      if (selectedCourses.length === 0) {
        stepErrors.push({ step: 2, errors: ['paymentSchema'] });
      } else {
        const paymentSchemas = values.paymentSchema || {};
        const hasValidPaymentSchema = selectedCourses.some((courseId) => {
          const schema = paymentSchemas[courseId] || {};
          const requiredFields = ['courseFee', 'downPayment', 'numberOfInstallments', 'installmentStartDate', 'paymentFrequency'];
          const allFieldsFilled = requiredFields.every((field) => {
            const value = schema[field];
            return value !== undefined && value !== null && value !== '';
          });
          const discountValid =
            !schema.isDiscountApplicable ||
            (schema.discountValue && schema.discountValue !== '' && schema.discountType && schema.discountType !== '');
          return allFieldsFilled && discountValid;
        });
        if (!hasValidPaymentSchema) {
          stepErrors.push({ step: 2, errors: ['paymentSchema'] });
        }
      }

      // If there are validation errors, navigate to the first step with errors
      if (stepErrors.length > 0) {
        const firstErrorStep = stepErrors[0].step;
        setActiveStep(firstErrorStep);

        // Set field errors for the first step
        if (firstErrorStep === 0) {
          stepErrors[0].errors.forEach((field) => {
            setFieldError(field, 'This field is required');
          });
        } else if (firstErrorStep === 1) {
          setFieldError('enrollments', 'At least one course enrollment is required');
        } else if (firstErrorStep === 2) {
          setFieldError('paymentSchema', 'Payment schema is incomplete');
        }

        showErrorSwal(`Please complete the required fields in step ${firstErrorStep + 1}`);
        setSubmitting(false);
        return;
      }

      if (!values.enrollments || values.enrollments.length === 0) {
        showErrorSwal('At least one course enrollment is required');
        setSubmitting(false);
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
        // Send all enrollments and payment schemas
        enrollments: values.enrollments,
        paymentSchema: values.paymentSchema || {},
        ...(values.highestAcademicQualification?.trim() && { highestAcademicQualification: values.highestAcademicQualification }),
        ...(values.qualificationDescription?.trim() && { qualificationDescription: values.qualificationDescription }),
        ...(Array.isArray(values.requiredDocuments) &&
          values.requiredDocuments.length > 0 && {
            requiredDocuments: values.requiredDocuments.map((docId) => ({ documentId: docId, isProvided: true }))
          }),
        ...(values.emergencyContact &&
          values.emergencyContact.name?.trim() &&
          values.emergencyContact.relationship?.trim() &&
          values.emergencyContact.phone?.trim() && {
            emergencyContact: values.emergencyContact
          })
      };

      const studentResponse = await fetch(`${apiRoutes.studentRoute}${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(studentData)
      });
      const studentResponseData = await studentResponse.json();

      if (!studentResponse.ok) {
        let msg = 'Failed to update student';
        if (studentResponseData.message && studentResponseData.error) {
          msg = `<strong>${studentResponseData.message}</strong><br/><small>${studentResponseData.error}</small>`;
        } else if (studentResponseData.message) {
          msg = `<strong>${studentResponseData.message}</strong>`;
        } else if (studentResponseData.error) {
          msg = `<strong>Error:</strong><br/><small>${studentResponseData.error}</small>`;
        }
        showErrorSwal(msg);
        return;
      }

      let successMessage = studentResponseData.message || 'Student updated successfully';
      const completionStatus = studentResponseData?.data?.completionStatus;
      if (completionStatus) {
        if (completionStatus.overall === 'completed') {
          successMessage = 'Student updated successfully! Registration is complete.';
        } else if (completionStatus.overall === 'incomplete') {
          const missing = [];
          if (!completionStatus.step1) missing.push('Personal Details');
          if (!completionStatus.step2) missing.push('Course Enrollment');
          if (!completionStatus.step3) missing.push('Academic Details');
          if (!completionStatus.step4) missing.push('Required Documents');
          if (!completionStatus.step5) missing.push('Emergency Contact');
          successMessage = `Student updated successfully! To complete registration, please provide: ${missing.join(', ')}`;
        }
      }

      showSuccessSwal(successMessage);
      navigate('/app/students');
    } catch (error) {
      let msg = 'An unexpected error occurred. Please try again.';
      if (error?.message) msg = error.message;
      else if (typeof error === 'string') msg = error;
      showErrorSwal(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStep = (step, formBag) => {
    const commonStepIcons = [UserOutlined, BookOutlined, ReadOutlined, ReadOutlined, FileTextOutlined, PhoneOutlined];
    const IconCmp = commonStepIcons[step] || UserOutlined;

    switch (step) {
      case 0:
        return <StepPersonalDetails IconCmp={IconCmp} formBag={formBag} updateStepCompletion={updateStepCompletion} />;
      case 1:
        return (
          <StepCourseDetails
            IconCmp={IconCmp}
            formBag={formBag}
            courseOptions={courseOptions}
            batchOptions={batchOptions}
            batchOptionsMap={batchOptionsMap}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            fetchBatches={fetchBatches}
            setNextDisabled={setNextDisabled}
            updateStepCompletion={updateStepCompletion}
            isUpdateMode={true}
          />
        );
      case 2:
        return (
          <StepPaymentSchema
            IconCmp={IconCmp}
            formBag={formBag}
            setNextDisabled={setNextDisabled}
            updateStepCompletion={updateStepCompletion}
          />
        );
      case 3:
        return (
          <StepAcademicDetails
            IconCmp={IconCmp}
            formBag={formBag}
            academicQualificationOptions={academicQualificationOptions}
            updateStepCompletion={updateStepCompletion}
          />
        );
      case 4:
        return (
          <StepRequiredDocuments
            IconCmp={IconCmp}
            formBag={formBag}
            requiredDocuments={requiredDocuments}
            updateStepCompletion={updateStepCompletion}
          />
        );
      case 5:
        return <StepEmergencyContact IconCmp={IconCmp} formBag={formBag} updateStepCompletion={updateStepCompletion} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <MainCard title="Update Student">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading student data...</Typography>
        </Box>
      </MainCard>
    );
  }

  if (!studentData) {
    return (
      <MainCard title="Update Student">
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="h6" color="error">
            Student not found
          </Typography>
          <Button onClick={() => navigate('/app/students')} sx={{ mt: 2 }}>
            Back to Students
          </Button>
        </Box>
      </MainCard>
    );
  }

  const initialValues = prepareInitialValues();

  return (
    <MainCard title="Update Student Registration">
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, formBag) => handleSubmitForm(values, formBag)}
        enableReinitialize
      >
        {(formBag) => {
          const { values } = formBag;

          return (
            <Form
              onSubmit={(e) => {
                if (activeStep !== steps.length - 1) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
                formBag.handleSubmit(e);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && activeStep !== steps.length - 1) {
                  e.preventDefault();
                  e.stopPropagation();
                  return false;
                }
              }}
              noValidate
            >
              <Box sx={{ width: '100%', mb: 4 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label, index) => (
                    <Step key={label} completed={stepCompletionStatus[index]}>
                      <StepLabel StepIconComponent={(props) => <CustomStepIcon {...props} icon={index + 1} />}>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <Box sx={{ mt: 2, mb: 4 }}>{renderStep(activeStep, formBag)}</Box>

              {activeStep === steps.length - 1 && (
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
                  Click &quot;Update Registration&quot; to save your changes.
                </Typography>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                <Button type="button" disabled={activeStep === 0} onClick={handleBack} startIcon={<ArrowLeftOutlined />} variant="outlined">
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
                      {submitting ? 'Updating...' : 'Update Registration'}
                    </Button>
                  ) : (
                    <>
                      <Button
                        type="button"
                        variant="contained"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          const { setTouched, setFieldError } = formBag;
                          handleNext(values, { setTouched, setFieldError });
                        }}
                        endIcon={<ArrowRightOutlined />}
                        disabled={nextDisabled}
                      >
                        Next
                      </Button>
                      {activeStep >= 3 && activeStep < steps.length - 1 && (
                        <Button type="button" variant="outlined" onClick={() => setActiveStep((s) => s + 1)}>
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
    </MainCard>
  );
};

export default UpdateStudent;
