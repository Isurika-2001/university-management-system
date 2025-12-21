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
  SaveOutlined
} from '@ant-design/icons';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import MainCard from 'components/MainCard';
import { apiRoutes } from 'config';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuthContext } from 'context/useAuthContext';

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

const initialValues = {
  // Step 1
  firstName: '',
  lastName: '',
  dob: '',
  nic: '',
  address: '',
  mobile: '',
  homeContact: '',
  email: '',
  // Step 2
  enrollments: [],
  // Step 3
  paymentSchema: {
    courseFee: '',
    isDiscountApplicable: false,
    discountType: 'amount',
    discountValue: '',
    downPayment: '',
    numberOfInstallments: '',
    installmentStartDate: '',
    paymentFrequency: 'monthly'
  },
  // Step 4
  highestAcademicQualification: '',
  qualificationDescription: '',
  // Step 5
  requiredDocuments: [],
  // Step 6
  emergencyContact: {
    name: '',
    relationship: '',
    phone: '',
    email: '',
    address: ''
  }
};

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

  paymentSchema: Yup.object().shape({
    courseFee: Yup.number()
      .transform((v, o) => (o === '' || o === null ? undefined : Number(o)))
      .typeError('Course fee is required')
      .min(0, 'Must be >= 0')
      .required('Course fee is required'),
    isDiscountApplicable: Yup.boolean().optional(),
    discountType: Yup.string()
      .oneOf(['amount', 'percentage'])
      .when('isDiscountApplicable', { is: true, then: (s) => s.required('Discount type is required') }),
    discountValue: Yup.number()
      .transform((v, o) => (o === '' || o === null ? 0 : Number(o)))
      .when('isDiscountApplicable', {
        is: true,
        then: (s) => s.typeError('Discount is required').min(0, 'Must be >= 0').required('Discount is required'),
        otherwise: (s) => s.min(0, 'Must be >= 0')
      }),
    downPayment: Yup.number()
      .transform((v, o) => (o === '' || o === null ? undefined : Number(o)))
      .typeError('Downpayment is required')
      .min(0, 'Must be >= 0')
      .required('Downpayment is required'),
    numberOfInstallments: Yup.number()
      .transform((v, o) => (o === '' || o === null ? undefined : Number(o)))
      .typeError('No. of installments is required')
      .integer('Must be an integer')
      .min(1, 'At least 1')
      .required('No. of installments is required'),
    installmentStartDate: Yup.string().required('Installment start date is required'),
    paymentFrequency: Yup.string().oneOf(['monthly', 'each_3_months', 'each_6_months']).required('Payment frequency is required')
  }),

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

const AddStudent = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [courseOptions, setCourseOptions] = useState([]);
  const [batchOptions, setBatchOptions] = useState([]);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [batchOptionsMap, setBatchOptionsMap] = useState({});
  const { user } = useAuthContext();

  // --- Added based on error: setNextDisabled is not defined ---
  // By default, next button is enabled
  const [nextDisabled, setNextDisabled] = useState(false);
  // ------------------------------------------------------------

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

  // Fetchers
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
    fetchCourses();
    fetchRequiredDocs();
  }, [fetchCourses, fetchRequiredDocs]);

  useEffect(() => {
    if (selectedCourse) fetchBatches(selectedCourse);
    else setBatchOptions([]);
  }, [selectedCourse, fetchBatches]);

  const handleNext = async (values, { setTouched, setFieldError, validateForm }) => {
    if (activeStep === 0) {
      const personalFields = ['firstName', 'lastName', 'dob', 'nic', 'address', 'mobile', 'email'];
      let hasErrors = false;
      personalFields.forEach((f) => {
        if (!values[f]) {
          setFieldError(f, 'This field is required');
          hasErrors = true;
        }
      });
      if (hasErrors) {
        setTouched({ firstName: true, lastName: true, dob: true, nic: true, address: true, mobile: true, email: true });
        return;
      }
    }

    if (activeStep === 1) {
      if (!values.enrollments || values.enrollments.length === 0) {
        setFieldError('enrollments', 'At least one course enrollment is required');
        setTouched({ enrollments: true });
        return;
      }
      let hasErrors = false;
      values.enrollments.forEach((enr, idx) => {
        if (!enr.courseId) {
          setFieldError(`enrollments.${idx}.courseId`, 'Course is required');
          hasErrors = true;
        }
        if (!enr.batchId) {
          setFieldError(`enrollments.${idx}.batchId`, 'Intake is required');
          hasErrors = true;
        }
      });
      if (hasErrors) {
        setTouched({ enrollments: true });
        return;
      }
    }

    if (activeStep === 2) {
      const formErrors = await validateForm();
      if (formErrors && formErrors.paymentSchema) {
        setTouched(
          {
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
          },
          true
        );
        return;
      }
    }

    setActiveStep((s) => s + 1);
  };

  const handleBack = () => setActiveStep((s) => s - 1);

  const handleSubmitForm = async (values) => {
    try {
      setSubmitting(true);

      const firstEnrollment = values.enrollments?.[0] || null;
      if (!firstEnrollment?.courseId || !firstEnrollment?.batchId) {
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
          }),
        courseId: firstEnrollment.courseId,
        batchId: firstEnrollment.batchId
      };

      const studentResponse = await fetch(apiRoutes.studentRoute, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(studentData)
      });
      const studentResponseData = await studentResponse.json();

      if (!studentResponse.ok) {
        let msg = 'Failed to register student';
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

      let successMessage = studentResponseData.message || 'Student registered successfully';
      const completionStatus = studentResponseData?.data?.completionStatus;
      if (completionStatus) {
        if (completionStatus.overall === 'completed') {
          successMessage = 'Student registered successfully! Registration is complete.';
        } else if (completionStatus.overall === 'incomplete') {
          const missing = [];
          if (!completionStatus.step1) missing.push('Personal Details');
          if (!completionStatus.step2) missing.push('Course Enrollment');
          if (!completionStatus.step3) missing.push('Academic Details');
          if (!completionStatus.step4) missing.push('Required Documents');
          if (!completionStatus.step5) missing.push('Emergency Contact');
          successMessage = `Student registered successfully! To complete registration, please provide: ${missing.join(', ')}`;
        }
      }

      // Add extra enrollments (skip first)
      if (values.enrollments && values.enrollments.length > 1) {
        for (let i = 1; i < values.enrollments.length; i += 1) {
          const enr = values.enrollments[i];
          if (!enr.courseId || !enr.batchId) {
            showErrorSwal('Invalid enrollment data: missing courseId or intake');
            return;
          }
          const enrollmentData = {
            studentId: studentResponseData.data.studentId,
            courseId: enr.courseId,
            batchId: enr.batchId
          };
          const enrollmentResponse = await fetch(apiRoutes.enrollmentRoute, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
            body: JSON.stringify(enrollmentData)
          });
          if (!enrollmentResponse.ok) {
            const errorData = await enrollmentResponse.json();
            let msg = 'Student created but additional enrollment creation failed';
            if (errorData.message && errorData.error) {
              msg = `<strong>${errorData.message}</strong><br/><small>${errorData.error}</small>`;
            } else if (errorData.message) {
              msg = `<strong>${errorData.message}</strong>`;
            } else if (errorData.error) {
              msg = `<strong>Enrollment Error:</strong><br/><small>${errorData.error}</small>`;
            } else {
              msg = '<strong>Enrollment Error:</strong><br/><small>Unknown error</small>';
            }
            showErrorSwal(msg);
            return;
          }
        }
      }

      showSuccessSwal(successMessage);
      window.location.reload();
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
        return <StepPersonalDetails IconCmp={IconCmp} formBag={formBag} />;
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
          />
        );
      case 2:
        return <StepPaymentSchema IconCmp={IconCmp} formBag={formBag} />;
      case 3:
        return <StepAcademicDetails IconCmp={IconCmp} formBag={formBag} academicQualificationOptions={academicQualificationOptions} />;
      case 4:
        return <StepRequiredDocuments IconCmp={IconCmp} formBag={formBag} requiredDocuments={requiredDocuments} />;
      case 5:
        return <StepEmergencyContact IconCmp={IconCmp} formBag={formBag} />;
      default:
        return null;
    }
  };

  return (
    <MainCard title="Student Registration Wizard">
      <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={handleSubmitForm}>
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
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              <Box sx={{ mt: 2, mb: 4 }}>{renderStep(activeStep, formBag)}</Box>

              {activeStep === steps.length - 1 && (
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
                  Click &quot;Complete Registration&quot; to submit your student registration.
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
                          const { setTouched, setFieldError, validateForm } = formBag;
                          handleNext(values, { setTouched, setFieldError, validateForm });
                        }}
                        endIcon={<ArrowRightOutlined />}
                        disabled={nextDisabled} // Only difference: disables "Next" if nextDisabled is true
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

      {/* Completion dots (visual only) */}
      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="caption" color="textSecondary">
          Completion Progress:
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {['step1', 'step2', 'step3', 'step4', 'step5', 'step6'].map((_, idx) => (
            <Box
              key={idx}
              sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'grey.300', border: '1px solid', borderColor: 'grey.400' }}
            />
          ))}
        </Box>
      </Box>
    </MainCard>
  );
};

export default AddStudent;
