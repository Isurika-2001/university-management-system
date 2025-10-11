import React, { useEffect, useState } from 'react';
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
  Divider,
  Paper,
  IconButton,
  Collapse
} from '@mui/material';

// Import Ant Design icons via @ant-design/icons
import { CaretDownOutlined, CaretUpOutlined } from '@ant-design/icons';

const StepPaymentSchema = ({ IconCmp, formBag, setNextDisabled }) => {
  const { values, errors, touched, setFieldValue } = formBag;

  const selectedCourses = values.selectedCourses || [];
  const paymentSchemas = values.paymentSchema || {};

  // Track expansion state for each course
  const [expanded, setExpanded] = useState({});

  // Initialize 'expanded' state for new/removed courses (default collapsed)
  useEffect(() => {
    let initial = {};
    selectedCourses.forEach((cid) => {
      initial[cid] = false;
    });
    setExpanded((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((cid) => {
        if (!selectedCourses.includes(cid)) delete updated[cid];
      });
      return { ...initial, ...updated };
    });
  }, [selectedCourses]);

  const handleToggle = (courseId) => {
    setExpanded((prev) => ({
      ...prev,
      [courseId]: !prev[courseId]
    }));
  };

  const getFieldName = (courseId, field) => `paymentSchema.${courseId}.${field}`;

  const getNested = (obj, path) => path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);

  // Utility to check if a value is empty
  const isEmpty = (val) => val === undefined || val === null || (typeof val === 'string' && val.trim() === '');

  // Enable/disable Next button based on validation
  useEffect(() => {
    let hasError = false;

    if (selectedCourses.length === 0) {
      hasError = true;
    }

    for (const courseId of selectedCourses) {
      const schema = paymentSchemas[courseId] || {};
      const requiredFields = ['courseFee', 'downPayment', 'numberOfInstallments', 'installmentStartDate', 'paymentFrequency'];

      for (const field of requiredFields) {
        if (isEmpty(schema[field])) {
          hasError = true;
          break;
        }
      }

      if (schema.isDiscountApplicable) {
        if (isEmpty(schema.discountValue) || isEmpty(schema.discountType)) {
          hasError = true;
          break;
        }
      }

      if (hasError) break;
    }

    if (setNextDisabled) setNextDisabled(hasError);
  }, [selectedCourses, paymentSchemas, setNextDisabled]);

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconCmp style={{ marginRight: 8, fontSize: 24 }} />
          <Typography variant="h5">Payment Schema</Typography>
        </Box>

        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Configure the payment plan for each selected course. All fields are required per course.
        </Typography>

        {selectedCourses.length === 0 && (
          <Box sx={{ my: 3 }}>
            <Typography color="error" variant="body1">
              Please select at least one course in the Course Details step to configure payment schemas.
            </Typography>
          </Box>
        )}

        {selectedCourses.map((courseId, idx) => {
          const schema = paymentSchemas[courseId] || {};
          const courseName = (values.courseInfoById && values.courseInfoById[courseId]?.name) || `Course ${idx + 1}`;
          const schemaTouched = getNested(touched, `paymentSchema.${courseId}`) || {};
          const schemaErrors = getNested(errors, `paymentSchema.${courseId}`) || {};

          const courseFee = parseFloat(schema?.courseFee || 0);
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
            <Paper
              sx={{
                mb: 5,
                boxShadow: 'none',
                border: '1px solid #e0e0e0',
                borderRadius: 2,
                p: 0,
                overflow: 'hidden'
              }}
              key={courseId}
              elevation={0}
            >
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  px: 2,
                  py: 1,
                  backgroundColor: '#fafafa',
                  borderTopLeftRadius: 8,
                  borderTopRightRadius: 8,
                  borderBottom: '1px solid #eee',
                  cursor: 'pointer',
                  transition: 'background 0.2s'
                }}
                onClick={() => handleToggle(courseId)}
                tabIndex={0}
                role="button"
                aria-pressed={expanded[courseId] ? 'true' : 'false'}
              >
                <IconButton edge="start" size="small" sx={{ mr: 1 }} disableRipple tabIndex={-1}>
                  {expanded[courseId] ? (
                    <CaretUpOutlined style={{ fontSize: 20, color: '#1976d2' }} />
                  ) : (
                    <CaretDownOutlined style={{ fontSize: 20, color: '#1976d2' }} />
                  )}
                </IconButton>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: expanded[courseId] ? 'primary.main' : 'text.primary',
                    flex: 1
                  }}
                >
                  {courseName}
                </Typography>
              </Box>
              <Collapse in={expanded[courseId]} timeout="auto" unmountOnExit>
                <Box sx={{ px: 2, pt: 2, pb: 3 }}>
                  <Grid container spacing={2}>
                    {/* Course Fee */}
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

                    {/* Discount Applicable */}
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

                    {/* Discount Fields */}
                    {discountApplicable && (
                      <>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth error={!!schemaTouched?.discountType && !!schemaErrors?.discountType}>
                            <InputLabel>Discount Type</InputLabel>
                            <Select
                              label="Discount Type"
                              value={schema?.discountType || ''}
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

                    {/* DownPayment */}
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

                    {/* Number of Installments */}
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

                    {/* Installment Start Date */}
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

                    {/* Payment Frequency */}
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth error={!!schemaTouched?.paymentFrequency && !!schemaErrors?.paymentFrequency}>
                        <InputLabel>Payment to be made</InputLabel>
                        <Select
                          label="Payment to be made"
                          value={schema?.paymentFrequency || ''}
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

                    {/* Calculated Summary */}
                    <Grid item xs={12}>
                      <Box sx={{ p: 2, border: '1px dashed #e0e0e0', borderRadius: 1 }}>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Calculated Summary
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              Discounted Course Fee:{' '}
                              {discountedFee.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              (Course Fee - Discount)
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              Amount to Finance:{' '}
                              {amountToFinance.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              (Discounted Fee - Downpayment)
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2">
                              Installment Amount (Premium):{' '}
                              {installmentAmount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              Auto-calculated per installment
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
              {idx < selectedCourses.length - 1 && <Divider sx={{ my: 0 }} />}
            </Paper>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default StepPaymentSchema;
