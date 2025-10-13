import React, { useEffect } from 'react';
import { Card, CardContent, Box, Typography, Grid, Checkbox, FormControlLabel } from '@mui/material';

const StepRequiredDocuments = ({ IconCmp, formBag, requiredDocuments, updateStepCompletion }) => {
  const { values, setFieldValue } = formBag;

  // Update completion status when values change
  useEffect(() => {
    if (updateStepCompletion) {
      updateStepCompletion(values);
    }
  }, [values.requiredDocuments, updateStepCompletion]);

  const required = Array.isArray(requiredDocuments) ? requiredDocuments.filter((d) => d.isRequired) : [];
  const optional = Array.isArray(requiredDocuments) ? requiredDocuments.filter((d) => !d.isRequired) : [];

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconCmp style={{ marginRight: 8, fontSize: 24 }} />
          <Typography variant="h5">Required Documents</Typography>
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          {`This step can be skipped during registration, but all required documents must be provided to complete the student's registration status.`}
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Select documents that have been provided:
            </Typography>

            {/* Required */}
            {required.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'error.main' }}>
                  Required Documents *
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                  These documents are mandatory for completing your registration
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {required.map((doc) => (
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

            {/* Optional */}
            {optional.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold', color: 'success.main' }}>
                  Optional Documents
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ mb: 2, display: 'block' }}>
                  These documents are optional and can be provided later
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {optional.map((doc) => (
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

            {/* None */}
            {Array.isArray(requiredDocuments) && requiredDocuments.length === 0 && (
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
};

export default StepRequiredDocuments;
