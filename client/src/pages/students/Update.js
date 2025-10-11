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
  Chip,
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
import { useLocation } from 'react-router-dom';
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

const personalFields = ['firstName', 'lastName', 'dob', 'nic', 'address', 'mobile', 'email'];
const paymentFields = [
  'paymentSchema.courseFee',
  'paymentSchema.isDiscountApplicable',
  'paymentSchema.discountType',
  'paymentSchema.discountValue',
  'paymentSchema.downPayment',
  'paymentSchema.numberOfInstallments',
  'paymentSchema.installmentStartDate',
  'paymentSchema.paymentFrequency'
];
const emergencyFields = [
  'emergencyContact.name',
  'emergencyContact.relationship',
  'emergencyContact.phone',
  'emergencyContact.email',
  'emergencyContact.address'
];

function toTouched(paths, on = true) {
  // builds a nested touched object for setTouched
  const root = {};
  for (const p of paths) {
    const parts = p.split('.');
    let cur = root;
    parts.forEach((seg, idx) => {
      if (idx === parts.length - 1) cur[seg] = on;
      else cur = cur[seg] || (cur[seg] = {});
    });
  }
  return root;
}

function hasAnyError(errs, fields) {
  return fields.some((p) => {
    const parts = p.split('.');
    let cur = errs;
    for (const seg of parts) {
      if (!cur || typeof cur !== 'object') return false;
      cur = cur[seg];
    }
    return !!cur;
  });
}

function firstErrorStep(errs) {
  if (!errs || !Object.keys(errs).length) return -1;
  if (hasAnyError(errs, personalFields)) return 0; // step 0
  const ENABLE_TEMP_BRANCH = false; // flip to true to activate
  if (ENABLE_TEMP_BRANCH) return 1; // course step is read-only
  if (hasAnyError(errs, paymentFields)) return 2; // step 2
  // academic is optional: show if user filled something invalid (schema allows anything -> usually no errors)
  if (errs.highestAcademicQualification || errs.qualificationDescription) return 3;
  // documents typically have no errors unless you add schema — skipping
  if (hasAnyError(errs, emergencyFields)) return 5; // step 5
  return 0;
}

const UpdateStudent = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const location = useLocation();
  const { user } = useAuthContext();

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

  const showSuccessSwal = (e) => {
    Toast.fire({ icon: 'success', title: e });
  };
  const showErrorSwal = (e) => {
    Toast.fire({ icon: 'error', title: e });
  };

  useEffect(() => {
    fetchStudentData();
    fetchRequiredDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  async function fetchStudentData() {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');

    try {
      const studentResponse = await fetch(apiRoutes.studentRoute + id, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }
      });
      const studentData = await studentResponse.json();
      if (!studentResponse.ok) {
        if (studentResponse.status === 500) console.error('Internal Server Error.');
        return;
      }

      const enrollmentResponse = await fetch(apiRoutes.enrollmentRoute + `student/${id}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }
      });

      let enrollmentData = [];
      if (enrollmentResponse.ok) {
        const response = await enrollmentResponse.json();
        enrollmentData = response.data || [];
      }

      const combinedData = { ...studentData, enrollments: enrollmentData };
      setData(combinedData);
      setEnrollments(enrollmentData);
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchRequiredDocuments() {
    try {
      const response = await fetch(apiRoutes.requiredDocumentRoute, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }
      });

      const payload = await response.json();
      if (!response.ok) {
        if (response.status === 500) console.error('Internal Server Error.');
        return;
      }
      const documents = payload.data || payload;
      setRequiredDocuments(Array.isArray(documents) ? documents : []);
    } catch (error) {
      console.error('Error fetching required documents:', error);
      setRequiredDocuments([]);
    }
  }

  const academicQualificationOptions = ['O-Level', 'A-Level', 'Diploma', "Bachelor's Degree", "Master's Degree", 'PhD', 'Other'];

  const getInitialValues = () => {
    if (!data) return {};

    const firstEnrollment = enrollments && enrollments.length > 0 ? enrollments[0] : null;
    const ps = firstEnrollment && firstEnrollment.paymentSchema ? firstEnrollment.paymentSchema : {};

    return {
      // Step 1: Personal Details
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      dob: data.dob ? new Date(data.dob).toISOString().split('T')[0] : '',
      nic: data.nic || '',
      address: data.address || '',
      mobile: data.mobile || '',
      homeContact: data.homeContact || '',
      email: data.email || '',

      // Step 2: Course Details (read-only)
      enrollments:
        enrollments && enrollments.length > 0
          ? enrollments.map((enrollment) => ({
              enrollmentId: enrollment._id,
              courseId: enrollment.courseId || enrollment.course?._id || '',
              batchId: enrollment.batchId || enrollment.batch?._id || '',
              courseName: enrollment.course?.name || '',
              batchName: enrollment.batch?.name || ''
            }))
          : [],

      // Step 3: Payment Schema
      paymentSchema: {
        courseFee: ps.courseFee ?? '',
        isDiscountApplicable: !!ps.isDiscountApplicable,
        discountType: ps.discountType || 'amount',
        discountValue: ps.discountValue ?? '',
        downPayment: ps.downPayment ?? '',
        numberOfInstallments: ps.numberOfInstallments ?? '',
        installmentStartDate: ps.installmentStartDate ? new Date(ps.installmentStartDate).toISOString().split('T')[0] : '',
        paymentFrequency: ps.paymentFrequency || 'monthly'
      },

      // Step 4: Academic
      highestAcademicQualification: data.highestAcademicQualification || '',
      qualificationDescription: data.qualificationDescription || '',

      // Step 5: Documents
      requiredDocuments:
        data.requiredDocuments && Array.isArray(data.requiredDocuments)
          ? data.requiredDocuments.map((doc) => doc.documentId || doc._id)
          : [],

      // Step 6: Emergency
      emergencyContact: data.emergencyContact || { name: '', relationship: '', phone: '', email: '', address: '' }
    };
  };

  const validationSchema = Yup.object().shape({
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    dob: Yup.string().required('Date of Birth is required'),
    nic: Yup.string()
      .matches(/^(?:\d{9}[vVxX]|\d{12})$/, 'NIC should either contain 9 digits + letter (v/V/x/X) or exactly 12 digits')
      .required('NIC is required'),
    address: Yup.string().required('Address is required'),
    mobile: Yup.string()
      .matches(/^\+?\d{10,12}$/, 'Contact No should be 10 to 12 digits with an optional leading + sign')
      .required('Contact No is required'),
    homeContact: Yup.string().matches(/^\+?\d{10,12}$/, 'Contact No should be 10 to 12 digits with an optional leading + sign'),
    email: Yup.string().email('Invalid email format').required('Email is required'),
    enrollments: Yup.array(),
    paymentSchema: Yup.object().shape({
      courseFee: Yup.number()
        .transform((v, o) => (o === '' || o === null ? undefined : Number(o)))
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
        .transform((v, o) => (o === '' || o === null ? 0 : Number(o)))
        .when('isDiscountApplicable', {
          is: true,
          then: (schema) => schema.typeError('Discount is required').min(0, 'Must be >= 0').required('Discount is required'),
          otherwise: (schema) => schema.min(0, 'Must be >= 0')
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
    highestAcademicQualification: Yup.string(),
    qualificationDescription: Yup.string(),
    emergencyContact: Yup.object().shape({
      name: Yup.string(),
      relationship: Yup.string(),
      phone: Yup.string().matches(/^\+?\d{10,12}$/, 'Phone should be 10 to 12 digits with an optional leading + sign'),
      email: Yup.string().email('Invalid email format'),
      address: Yup.string()
    })
  });

  const handleNext = async (values, { setTouched, setFieldError, validateForm }) => {
    // validate only the current step and show messages within the step
    const errs = await validateForm();

    if (activeStep === 0) {
      // Personal step
      if (hasAnyError(errs, personalFields)) {
        setTouched(toTouched(personalFields), true);
        // also mark empty inputs as errors for quick feedback
        personalFields.forEach((f) => {
          const parts = f.split('.');
          const k = parts[parts.length - 1];
          if (!values[k]) setFieldError(k, 'This field is required');
        });
        return;
      }
    }

    if (activeStep === 2) {
      // Payment step
      if (hasAnyError(errs, paymentFields)) {
        setTouched(toTouched(paymentFields), true);
        return;
      }
    }

    // Steps 3/4/5 are optional here; move forward
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  // renamed to avoid confusion with Formik's handleSubmit
  const submitStudent = async (values) => {
    const searchParams = new URLSearchParams(location.search);
    const id = searchParams.get('id');
    if (!id) return showErrorSwal('Student ID not found');
    if (!data) return showErrorSwal('Student data not available');

    try {
      setSubmitting(true);
      const firstEnrollment = enrollments && enrollments.length > 0 ? enrollments[0] : null;

      if (firstEnrollment && firstEnrollment._id) {
        const enrollmentUpdateRes = await fetch(apiRoutes.enrollmentRoute + firstEnrollment._id, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
          body: JSON.stringify({ paymentSchema: values.paymentSchema })
        });
        if (!enrollmentUpdateRes.ok) {
          const err = await enrollmentUpdateRes.json().catch(() => ({}));
          console.error('Failed updating enrollment payment schema', err);
          showErrorSwal('Failed to update payment schema');
          setSubmitting(false);
          return;
        }
      }

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
        requiredDocuments: Array.isArray(values.requiredDocuments)
          ? values.requiredDocuments.map((docId) => ({ documentId: docId, isProvided: true }))
          : [],
        emergencyContact: values.emergencyContact
      };

      const studentResponse = await fetch(apiRoutes.studentRoute + id, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` },
        body: JSON.stringify(studentUpdateData)
      });

      if (!studentResponse.ok) {
        const errorData = await studentResponse.json();
        let errorMessage = 'Failed to update student';
        if (errorData.message && errorData.error)
          errorMessage = `<strong>${errorData.message}</strong><br/><small>${errorData.error}</small>`;
        else if (errorData.message) errorMessage = `<strong>${errorData.message}</strong>`;
        else if (errorData.error) errorMessage = `<strong>Error:</strong><br/><small>${errorData.error}</small>`;
        showErrorSwal(errorMessage);
        setSubmitting(false);
        return;
      }

      const responseData = await studentResponse.json();
      let statusMessage = responseData.message || 'Student updated successfully';
      if (responseData.data && responseData.data.completionStatus) {
        const completionStatus = responseData.data.completionStatus;
        if (completionStatus.overall === 'completed') statusMessage = 'Student updated successfully! Registration is now complete.';
        else if (completionStatus.overall === 'incomplete') {
          const missingSteps = [];
          if (!completionStatus.step1) missingSteps.push('Personal Details');
          if (!completionStatus.step2) missingSteps.push('Course Enrollment');
          if (!completionStatus.step3 && !completionStatus.payment) missingSteps.push('Payment Schema');
          if (!completionStatus.step4 && !completionStatus.academic) missingSteps.push('Academic Details');
          if (!completionStatus.step5 && !completionStatus.documents) missingSteps.push('Required Documents');
          if (!completionStatus.step6 && !completionStatus.emergency) missingSteps.push('Emergency Contact');
          statusMessage = `Student updated successfully! To complete registration, please provide: ${missingSteps.join(', ')}`;
        } else statusMessage = 'Student updated successfully! Registration is still pending.';
      }

      showSuccessSwal(statusMessage);
      window.location.href = '/app/students';
    } catch (error) {
      console.error('Error in submitStudent:', error);
      showErrorSwal(error?.message || 'An unexpected error occurred while updating student. Please try again.');
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
                  <strong>Note:</strong> Course enrollments can only be managed through the dedicated enrollment management page. This
                  wizard is for updating student personal information only.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        );

      case 2: {
        const courseFee = parseFloat(values.paymentSchema?.courseFee || 0) || 0;
        const discountApplicable = !!values.paymentSchema?.isDiscountApplicable;
        const discountType = values.paymentSchema?.discountType || 'amount';
        const discountValueRaw = parseFloat(values.paymentSchema?.discountValue || 0) || 0;
        const downPayment = parseFloat(values.paymentSchema?.downPayment || 0) || 0;
        const numberOfInstallments = parseInt(values.paymentSchema?.numberOfInstallments || 0, 10) || 0;

        const discountAmount = discountApplicable
          ? discountType === 'percentage'
            ? (courseFee * discountValueRaw) / 100
            : discountValueRaw
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
                    error={touched?.paymentSchema?.courseFee && !!errors?.paymentSchema?.courseFee}
                    helperText={<ErrorMessage name="paymentSchema.courseFee" />}
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
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>
                      Calculated Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          Discounted Course Fee:{' '}
                          {discountedFee.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          (Course Fee - Discount)
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          Amount to Finance:{' '}
                          {amountToFinance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          (Discounted Fee - Downpayment)
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2">
                          Installment Amount (Premium):{' '}
                          {installmentAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          Auto-calculated per installment
                        </Typography>
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

      case 4:
        return (
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <FileTextOutlined style={{ marginRight: 8, fontSize: 24 }} />
                <Typography variant="h5">Required Documents</Typography>
              </Box>

              <Typography variant="body2" color="textSecondary" sx={{ mb: 3, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                This step can be skipped during update, but all required documents must be provided to complete the student&apos;s
                registration status.
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Select documents that have been provided:
                  </Typography>

                  {Array.isArray(requiredDocuments) && requiredDocuments.filter((doc) => doc.isRequired).length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'error.main' }}>
                        Required Documents *
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                        These documents are mandatory for completing your registration
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {requiredDocuments
                          .filter((doc) => doc.isRequired)
                          .map((doc) => (
                            <FormControlLabel
                              key={doc._id}
                              control={
                                <Checkbox
                                  checked={values.requiredDocuments.includes(doc._id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFieldValue('requiredDocuments', [...values.requiredDocuments, doc._id]);
                                    } else {
                                      setFieldValue(
                                        'requiredDocuments',
                                        values.requiredDocuments.filter((id) => id !== doc._id)
                                      );
                                    }
                                  }}
                                />
                              }
                              label={
                                <Box
                                  sx={{
                                    border: '1px solid',
                                    borderColor: 'error.main',
                                    borderRadius: 1,
                                    p: 1,
                                    backgroundColor: 'rgba(244, 67, 54, 0.1)'
                                  }}
                                >
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

                  {Array.isArray(requiredDocuments) && requiredDocuments.filter((doc) => !doc.isRequired).length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'success.main' }}>
                        Optional Documents
                      </Typography>
                      <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                        These documents are optional and can be provided later
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {requiredDocuments
                          .filter((doc) => !doc.isRequired)
                          .map((doc) => (
                            <FormControlLabel
                              key={doc._id}
                              control={
                                <Checkbox
                                  checked={values.requiredDocuments.includes(doc._id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFieldValue('requiredDocuments', [...values.requiredDocuments, doc._id]);
                                    } else {
                                      setFieldValue(
                                        'requiredDocuments',
                                        values.requiredDocuments.filter((id) => id !== doc._id)
                                      );
                                    }
                                  }}
                                />
                              }
                              label={
                                <Box
                                  sx={{
                                    border: '1px solid',
                                    borderColor: 'success.main',
                                    borderRadius: 1,
                                    p: 1,
                                    backgroundColor: 'rgba(76, 175, 80, 0.1)'
                                  }}
                                >
                                  <Typography variant="body2">{doc.name}</Typography>
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
                    error={touched?.emergencyContact?.name && !!errors?.emergencyContact?.name}
                    helperText={<ErrorMessage name="emergencyContact.name" />}
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
                    error={touched?.emergencyContact?.relationship && !!errors?.emergencyContact?.relationship}
                    helperText={<ErrorMessage name="emergencyContact.relationship" />}
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
                    error={touched?.emergencyContact?.phone && !!errors?.emergencyContact?.phone}
                    helperText={<ErrorMessage name="emergencyContact.phone" />}
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
                    error={touched?.emergencyContact?.email && !!errors?.emergencyContact?.email}
                    helperText={<ErrorMessage name="emergencyContact.email" />}
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
                    error={touched?.emergencyContact?.address && !!errors?.emergencyContact?.address}
                    helperText={<ErrorMessage name="emergencyContact.address" />}
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

  // server-reported completion, used as fallback
  const serverCS = data?.completionStatus || {};

  return (
    <MainCard
      title={
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h4">Update Student - Registration Wizard</Typography>
          {data && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Status:
              </Typography>
              <Chip
                label={data.status || 'pending'}
                color={data.status === 'completed' ? 'success' : data.status === 'incomplete' ? 'warning' : 'default'}
                size="small"
              />
            </Box>
          )}
        </Box>
      }
    >
      <Formik initialValues={getInitialValues()} validationSchema={validationSchema} onSubmit={submitStudent} enableReinitialize>
        {({ errors, handleSubmit: formikSubmit, touched, values, setFieldValue, setTouched, setFieldError, validateForm }) => {
          // ===== Recompute completion LIVE from current form values (with server fallback) =====
          const paymentFromCS = serverCS.payment ?? serverCS.step3_payment ?? serverCS.paymentSchema ?? serverCS.payments ?? false;

          const requiredIds = (requiredDocuments || []).filter((d) => d.isRequired).map((d) => d._id);
          const providedSet = new Set(values.requiredDocuments || []);

          const personalDone =
            !!serverCS.step1 ||
            !!(values.firstName && values.lastName && values.dob && values.nic && values.address && values.mobile && values.email);

          const courseDone = !!serverCS.step2 || (Array.isArray(values.enrollments) && values.enrollments.length > 0);

          const paymentFromValues =
            !!values.paymentSchema &&
            values.paymentSchema.courseFee !== '' &&
            values.paymentSchema.downPayment !== '' &&
            values.paymentSchema.numberOfInstallments !== '' &&
            !!values.paymentSchema.installmentStartDate &&
            !!values.paymentSchema.paymentFrequency;

          const paymentDone = !!(paymentFromCS || paymentFromValues);

          const academicDone =
            !!(serverCS.academic ?? serverCS.step3) || !!(values.highestAcademicQualification || values.qualificationDescription);

          const documentsFromCS = serverCS.documents ?? serverCS.step4 ?? false;
          const documentsFromValues = requiredIds.length > 0 ? requiredIds.every((id) => providedSet.has(id)) : false;
          const documentsDone = !!(documentsFromCS || documentsFromValues);

          const emergencyFromCS = serverCS.emergency ?? serverCS.step5 ?? serverCS.step6 ?? false;
          const emergencyFromValues = !!(values.emergencyContact?.name && values.emergencyContact?.phone);
          const emergencyDone = !!(emergencyFromCS || emergencyFromValues);

          const completedMap = {
            1: !!personalDone,
            2: !!courseDone,
            3: !!paymentDone,
            4: !!academicDone,
            5: !!documentsDone,
            6: !!emergencyDone
          };

          return (
            <Form
              noValidate
              onKeyDown={(e) => {
                // prevent Enter from jumping steps
                if (e.key === 'Enter' && activeStep !== steps.length - 1) {
                  e.preventDefault();
                  e.stopPropagation();
                }
              }}
            >
              <Box sx={{ width: '100%', mb: 4 }}>
                <Stepper activeStep={activeStep} alternativeLabel>
                  {steps.map((label, idx) => (
                    <Step key={label} completed={!!completedMap[idx + 1]}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>

              {/* Tiny progress dots */}
              <Box sx={{ mb: 2, display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'center' }}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <Box
                    key={n}
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: completedMap[n] ? 'success.main' : 'grey.300',
                      border: '1px solid',
                      borderColor: completedMap[n] ? 'success.main' : 'grey.400'
                    }}
                    title={
                      `Step ${n}: ` +
                      (n === 1
                        ? 'Personal Details'
                        : n === 2
                          ? 'Course Enrollment'
                          : n === 3
                            ? 'Payment Schema'
                            : n === 4
                              ? 'Academic Details'
                              : n === 5
                                ? 'Required Documents'
                                : 'Emergency Contact')
                    }
                  />
                ))}
              </Box>

              <Box sx={{ mt: 2, mb: 4 }}>{renderStepContent(activeStep, values, errors, touched, setFieldValue)}</Box>

              {activeStep === steps.length - 1 && (
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2, textAlign: 'center' }}>
                  Click &quot;Update Student&quot; to submit your changes.
                </Typography>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 2 }}>
                <Button type="button" disabled={activeStep === 0} onClick={handleBack} startIcon={<ArrowLeftOutlined />} variant="outlined">
                  Back
                </Button>

                <Box sx={{ display: 'flex', gap: 1 }}>
                  {activeStep >= 3 && activeStep < steps.length - 1 && (
                    <Button type="button" variant="outlined" onClick={() => setActiveStep((prev) => prev + 1)}>
                      Skip
                    </Button>
                  )}

                  {activeStep === steps.length - 1 ? (
                    <Button
                      type="button"
                      variant="contained"
                      color="primary"
                      disabled={submitting}
                      startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <SaveOutlined />}
                      onClick={async () => {
                        // validate the whole form and show ALL messages everywhere
                        const errs = await validateForm();

                        // mark *all* relevant fields as touched so every message shows
                        const allFields = [
                          ...personalFields,
                          ...paymentFields,
                          ...emergencyFields,
                          // add top-level academic fields (optional but mark touched so they show if you add rules later)
                          'highestAcademicQualification',
                          'qualificationDescription'
                        ];
                        setTouched(toTouched(allFields), true);

                        if (errs && Object.keys(errs).length) {
                          const stepIdx = firstErrorStep(errs);
                          if (stepIdx >= 0) setActiveStep(stepIdx);
                          return;
                        }
                        // No errors → submit
                        formikSubmit();
                      }}
                    >
                      {submitting ? 'Updating...' : 'Update Student'}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="contained"
                      onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        await handleNext(values, { setTouched, setFieldError, validateForm });
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
