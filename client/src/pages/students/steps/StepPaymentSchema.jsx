import React from 'react';
import { Field, ErrorMessage } from 'formik';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Grid,
  TextField,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Divider
} from '@mui/material';

/**
 * StepPaymentSchema now supports multiple courses, each with its own paymentSchema object.
 * For this to work, values.paymentSchema must be an object like:
 * {
 *   [courseId]: { ...paymentObjForThatCourse }
 * }
 * And the selected course IDs are available in values.selectedCourses (an array of IDs).
 *
 * This depends on the values structure in Formik.
 */
const StepPaymentSchema = ({ IconCmp, formBag }) => {
  const { values, errors, touched, setFieldValue } = formBag;

  // Fallback: selectedCourses is an array of IDs that are being registered for.
  const selectedCourses = values.selectedCourses || [];

  // We'll render a set of payment fields for each selected course.
  // paymentSchema is an object: { [courseId]: { ... } }
  const paymentSchemas = values.paymentSchema || {};

  // Utility: get field name for Formik
  const getFieldName = (courseId, field) => `paymentSchema.${courseId}.${field}`;

  // For error/touched helpers
  const getNested = (obj, path) => path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconCmp style={{ marginRight: 8, fontSize: 24 }} />
          <Typography variant="h5">Payment Schema</Typography>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {`Configure the payment plan for each selected course. All fields are required per course.`}
        </Typography>

        {selectedCourses.length === 0 && (
          <Box sx={{ my: 3 }}>
            <Typography color="error" variant="body1">
              Please select at least one course in the Course Details step to configure payment schemas.
            </Typography>
          </Box>
        )}

        {selectedCourses.map((courseId, idx) => {
          // You may enhance this with courseName lookup if you have courseList somewhere.
          const schema = paymentSchemas[courseId] || {};
          const courseName = (values.courseInfoById && values.courseInfoById[courseId]?.name) || `Course ${idx + 1}`;
          const schemaTouched = getNested(touched, `paymentSchema.${courseId}`) || {};
          const schemaErrors = getNested(errors, `paymentSchema.${courseId}`) || {};

          const courseFee = parseFloat(schema?.courseFee || 0) || 0;
          const discountApplicable = !!schema?.isDiscountApplicable;
          const discountType = schema?.discountType || 'amount';
          const discountValueRaw = parseFloat(schema?.discountValue || 0) || 0;
          const downPayment = parseFloat(schema?.downPayment || 0) || 0;
          const numberOfInstallments = parseInt(schema?.numberOfInstallments || 0, 10) || 0;

          const discountAmount = discountApplicable
            ? discountType === 'percentage'
              ? (courseFee * discountValueRaw) / 100
              : discountValueRaw
            : 0;
          const discountedFee = Math.max(courseFee - discountAmount, 0);
          const amountToFinance = Math.max(discountedFee - downPayment, 0);
          const installmentAmount = numberOfInstallments > 0 ? amountToFinance / numberOfInstallments : 0;

          return (
            <Box sx={{ mb: 5 }} key={courseId}>
              <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                {courseName}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Course Fee"
                    variant="outlined"
                    name={getFieldName(courseId, 'courseFee')}
                    type="number"
                    fullWidth
                    InputProps={{ sx: { px: 2, py: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={!!schema?.isDiscountApplicable}
                        onChange={(e) => setFieldValue(getFieldName(courseId, 'isDiscountApplicable'), e.target.checked)}
                      />
                    }
                    label="Discount Applicable?"
                  />
                </Grid>

                {discountApplicable && (
                  <>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={!!schemaTouched?.discountType && !!schemaErrors?.discountType}>
                        <InputLabel>Discount Type</InputLabel>
                        <Select
                          label="Discount Type"
                          value={discountType}
                          onChange={(e) => setFieldValue(getFieldName(courseId, 'discountType'), e.target.value)}
                        >
                          <MenuItem value="amount">Amount</MenuItem>
                          <MenuItem value="percentage">Percentage</MenuItem>
                        </Select>
                        {schemaTouched?.discountType && schemaErrors?.discountType && (
                          <FormHelperText>{schemaErrors.discountType}</FormHelperText>
                        )}
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Field
                        as={TextField}
                        label={discountType === 'percentage' ? 'Discount (%)' : 'Discount Amount'}
                        variant="outlined"
                        name={getFieldName(courseId, 'discountValue')}
                        type="number"
                        fullWidth
                        error={!!schemaTouched?.discountValue && !!schemaErrors?.discountValue}
                        helperText={<ErrorMessage name={getFieldName(courseId, 'discountValue')} />}
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
                    name={getFieldName(courseId, 'downPayment')}
                    type="number"
                    fullWidth
                    error={!!schemaTouched?.downPayment && !!schemaErrors?.downPayment}
                    helperText={<ErrorMessage name={getFieldName(courseId, 'downPayment')} />}
                    InputProps={{ sx: { px: 2, py: 1 } }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="No. of Installments"
                    variant="outlined"
                    name={getFieldName(courseId, 'numberOfInstallments')}
                    type="number"
                    fullWidth
                    error={!!schemaTouched?.numberOfInstallments && !!schemaErrors?.numberOfInstallments}
                    helperText={<ErrorMessage name={getFieldName(courseId, 'numberOfInstallments')} />}
                    InputProps={{ sx: { px: 2, py: 1 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    label="Installment Start Date"
                    variant="outlined"
                    name={getFieldName(courseId, 'installmentStartDate')}
                    type="date"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    error={!!schemaTouched?.installmentStartDate && !!schemaErrors?.installmentStartDate}
                    helperText={<ErrorMessage name={getFieldName(courseId, 'installmentStartDate')} />}
                    InputProps={{ sx: { px: 2, py: 1 } }}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!schemaTouched?.paymentFrequency && !!schemaErrors?.paymentFrequency}>
                    <InputLabel>Payment to be made</InputLabel>
                    <Select
                      label="Payment to be made"
                      value={schema?.paymentFrequency || 'monthly'}
                      onChange={(e) => setFieldValue(getFieldName(courseId, 'paymentFrequency'), e.target.value)}
                    >
                      <MenuItem value="monthly">Monthly</MenuItem>
                      <MenuItem value="each_3_months">Each 3 months</MenuItem>
                      <MenuItem value="each_6_months">Each 6 months</MenuItem>
                    </Select>
                    {schemaTouched?.paymentFrequency && schemaErrors?.paymentFrequency && (
                      <FormHelperText>{schemaErrors.paymentFrequency}</FormHelperText>
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
              {idx < selectedCourses.length - 1 && <Divider sx={{ my: 4 }} />}
            </Box>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default StepPaymentSchema;
