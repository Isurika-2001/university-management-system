import React, { useEffect, useState, useCallback, useMemo } from 'react';
import MainCard from 'components/MainCard';
import { PATHWAY_LIST } from 'constants/pathways';
import { modulesAPI } from '../../api/modules';
import { coursesAPI } from '../../api/courses';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Grid,
  IconButton,
  Typography,
  CircularProgress,
  FormControlLabel,
  Switch,
  Divider
} from '@mui/material';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useAuthContext } from 'context/useAuthContext';
import { hasPermission } from 'utils/userTypeUtils';

const View = () => {
  const { user } = useAuthContext();

  // Check if user has any action permissions
  const hasAnyAction = useMemo(() => {
    return hasPermission(user, 'modules', 'U');
  }, [user]);

  const [data, setData] = useState([]); // modules per course rows
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [moduleInput, setModuleInput] = useState('');
  const [tempModules, setTempModules] = useState([]);
  const [isSavingModules, setIsSavingModules] = useState(false); // New state for saving modules loading
  const [isSequentialMode, setIsSequentialMode] = useState(false); // Sequential modules mode
  const [newModuleIsSequential, setNewModuleIsSequential] = useState(true); // Whether new module should be sequential

  const Toast = useMemo(
    () =>
      withReactContent(
        Swal.mixin({
          toast: true,
          position: 'bottom',
          customClass: { popup: 'colored-toast' },
          background: 'primary',
          showConfirmButton: false,
          timer: 3500,
          timerProgressBar: true
        })
      ),
    []
  );

  const showSuccessSwal = useCallback(
    (msg) => {
      Toast.fire({ icon: 'success', title: msg });
    },
    [Toast]
  );

  const showErrorSwal = useCallback(
    (msg) => {
      Toast.fire({ icon: 'error', title: msg });
    },
    [Toast]
  );

  const fetchData = useCallback(async () => {
    try {
      const [coursesRes, modulesRes] = await Promise.all([coursesAPI.getAll(), modulesAPI.getAll()]);

      const coursesList = Array.isArray(coursesRes) ? coursesRes : (coursesRes && coursesRes.data) || [];

      const modulesList = (modulesRes && modulesRes.data) || [];

      // map modules by courseId for quick lookup
      const map = {};
      modulesList.forEach((m) => {
        map[m.courseId] = m.modules || [];
      });

      // Build rows combining courses and modules
      const rows = coursesList.map((c) => ({ courseId: c._id, courseName: c.name, pathway: c.pathway, modules: map[c._id] || [] }));
      setData(rows);
    } catch (error) {
      console.error(error);
      showErrorSwal('Error loading modules');
    }
  }, [showErrorSwal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = async (course) => {
    setSelectedCourse(course);
    setModuleInput('');
    setOpenDialog(true);

    // Fetch detailed module information for this course
    try {
      const modulesRes = await modulesAPI.getAll({ courseId: course.courseId || course._id });
      const moduleList = Array.isArray(modulesRes) ? modulesRes : modulesRes?.data || [];

      // Check if any module is sequential to determine mode
      const hasSequential = moduleList.some((m) => m.isSequential);
      setIsSequentialMode(hasSequential);
      setNewModuleIsSequential(true); // Default to sequential when adding new modules

      // Convert module entries to format for editing
      const formattedModules = moduleList.map((m) => ({
        _id: m._id,
        name: m.name,
        isSequential: m.isSequential || false,
        sequenceNumber: m.sequenceNumber || null
      }));

      // Sort: sequential modules first (by sequence number), then non-sequential
      formattedModules.sort((a, b) => {
        if (a.isSequential && b.isSequential) {
          return (a.sequenceNumber || 0) - (b.sequenceNumber || 0);
        }
        if (a.isSequential) return -1;
        if (b.isSequential) return 1;
        return 0;
      });

      setTempModules(formattedModules);
    } catch (error) {
      console.error('Error fetching modules:', error);
      // Fallback to legacy format
      setTempModules((course.modules || []).map((name) => ({ name, isSequential: false, sequenceNumber: null })));
    }
  };

  const handleAddModule = () => {
    const trimmed = moduleInput.trim();
    if (!trimmed) return;

    // Check if module name already exists
    if (tempModules.some((m) => m.name === trimmed)) {
      showErrorSwal('Module name already exists');
      return;
    }

    if (isSequentialMode && newModuleIsSequential) {
      // Find the highest sequence number
      const sequentialModules = tempModules.filter((m) => m.isSequential);
      const maxSeq = sequentialModules.length > 0 ? Math.max(...sequentialModules.map((m) => m.sequenceNumber || 0)) : 0;

      const newModule = {
        name: trimmed,
        isSequential: true,
        sequenceNumber: maxSeq + 1
      };
      setTempModules([...tempModules, newModule]);
    } else {
      // Non-sequential module
      const newModule = {
        name: trimmed,
        isSequential: false,
        sequenceNumber: null
      };
      setTempModules([...tempModules, newModule]);
    }

    setModuleInput('');
  };

  const handleSave = async () => {
    if (!selectedCourse) return;

    try {
      setIsSavingModules(true);
      const courseId = selectedCourse.courseId || selectedCourse._id;

      // Convert tempModules to the format expected by the API
      const modulesToSave = tempModules.map((m) => ({
        name: m.name,
        isSequential: m.isSequential || false,
        sequenceNumber: m.isSequential ? m.sequenceNumber || null : null
      }));

      await modulesAPI.upsert({ courseId, modules: modulesToSave });
      await fetchData();
      showSuccessSwal('Modules saved successfully');
    } catch (err) {
      console.error(err);
      showErrorSwal(err.message || 'Error saving modules');
    } finally {
      setOpenDialog(false);
      setIsSavingModules(false);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCourse(null);
    setTempModules([]);
    setModuleInput('');
    setIsSequentialMode(false);
    setNewModuleIsSequential(true);
  };

  const handleToggleSequentialMode = () => {
    // Just toggle the mode - don't convert existing modules
    setIsSequentialMode(!isSequentialMode);
  };

  const handleRemoveModule = (index) => {
    const updated = tempModules.filter((_, i) => i !== index);

    // If in sequential mode, renumber remaining sequential modules
    if (isSequentialMode) {
      let seqNum = 1;
      updated.forEach((m) => {
        if (m.isSequential) {
          m.sequenceNumber = seqNum++;
        }
      });
    }

    setTempModules(updated);
  };

  return (
    <MainCard title="Course Modules">
      <Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Course</TableCell>
                <TableCell>Pathway</TableCell>
                <TableCell>Modules</TableCell>
                {hasAnyAction && <TableCell>Action</TableCell>}
              </TableRow>
            </TableHead>
            <TableBody>
              {data.map((row) => (
                <TableRow key={row.courseId}>
                  <TableCell>{row.courseName}</TableCell>
                  <TableCell>{(PATHWAY_LIST.find((p) => p.id === row.pathway) || {}).label}</TableCell>
                  <TableCell>
                    {(row.modules || []).length > 0 ? (
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {(row.modules || []).map((mod, idx) => {
                          const moduleName = typeof mod === 'string' ? mod : mod.name;
                          const isSeq = typeof mod === 'object' && mod.isSequential;
                          const seqNum = typeof mod === 'object' && mod.sequenceNumber;
                          const label = isSeq && seqNum ? `${moduleName} (#${seqNum})` : moduleName;
                          return (
                            <Chip
                              key={idx}
                              label={label}
                              size="small"
                              variant={isSeq ? 'filled' : 'outlined'}
                              color={isSeq ? 'primary' : 'default'}
                            />
                          );
                        })}
                      </Box>
                    ) : (
                      <Typography color="textSecondary">Empty</Typography>
                    )}
                  </TableCell>
                  {hasAnyAction && (
                    <TableCell>
                      {hasPermission(user, 'modules', 'U') && (
                        <Button variant="outlined" size="small" onClick={() => handleOpenDialog(row)}>
                          Manage
                        </Button>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Manage Modules Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>Manage Modules - {selectedCourse?.courseName}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {/* Sequential Mode Toggle */}
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Switch checked={isSequentialMode} onChange={handleToggleSequentialMode} disabled={!hasPermission(user, 'modules', 'C')} />
              }
              label={
                <Typography variant="body1">
                  <strong>Enable Sequential Modules</strong>
                  <Typography variant="caption" display="block" color="textSecondary">
                    Allow creating numbered sequential modules that students must complete in order. You can also add optional
                    non-sequential modules.
                  </Typography>
                </Typography>
              }
            />
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Input Section */}
          <Grid container spacing={1} sx={{ mb: 3 }}>
            <Grid item xs={isSequentialMode ? 9 : 11}>
              <TextField
                fullWidth
                size="small"
                label="Enter module name"
                value={moduleInput}
                onChange={(e) => setModuleInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (hasPermission(user, 'modules', 'C')) {
                      handleAddModule();
                    }
                  }
                }}
                variant="outlined"
              />
            </Grid>
            {isSequentialMode && (
              <Grid item xs={2}>
                <FormControlLabel
                  control={
                    <Switch checked={newModuleIsSequential} onChange={(e) => setNewModuleIsSequential(e.target.checked)} size="small" />
                  }
                  label={<Typography variant="caption">Sequential</Typography>}
                />
              </Grid>
            )}
            <Grid item xs={1}>
              {hasPermission(user, 'modules', 'C') && (
                <IconButton color="primary" onClick={handleAddModule} disabled={!moduleInput.trim()} sx={{ mt: 0.5 }}>
                  <PlusOutlined />
                </IconButton>
              )}
            </Grid>
          </Grid>

          {/* Modules List */}
          {tempModules.length > 0 && (
            <Box sx={{ mb: 2 }}>
              {/* Sequential Modules Section */}
              {tempModules.some((m) => m.isSequential) && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Sequential Modules (students must complete in order):
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {tempModules
                      .filter((m) => m.isSequential)
                      .sort((a, b) => (a.sequenceNumber || 0) - (b.sequenceNumber || 0))
                      .map((mod) => {
                        const originalIdx = tempModules.findIndex((m) => m.name === mod.name);
                        const label = mod.sequenceNumber ? `${mod.name} (#${mod.sequenceNumber})` : mod.name;
                        return (
                          <Chip
                            key={originalIdx}
                            label={label}
                            onDelete={hasPermission(user, 'modules', 'D') ? () => handleRemoveModule(originalIdx) : undefined}
                            icon={hasPermission(user, 'modules', 'D') ? <DeleteOutlined /> : undefined}
                            color="primary"
                            variant="filled"
                          />
                        );
                      })}
                  </Box>
                </Box>
              )}

              {/* Non-Sequential Modules Section */}
              {tempModules.some((m) => !m.isSequential) && (
                <Box>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Optional Modules (available after completing all sequential modules):
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {tempModules
                      .filter((m) => !m.isSequential)
                      .map((mod) => {
                        const originalIdx = tempModules.findIndex((m) => m.name === mod.name);
                        return (
                          <Chip
                            key={originalIdx}
                            label={mod.name}
                            onDelete={hasPermission(user, 'modules', 'D') ? () => handleRemoveModule(originalIdx) : undefined}
                            icon={hasPermission(user, 'modules', 'D') ? <DeleteOutlined /> : undefined}
                            color="default"
                            variant="outlined"
                          />
                        );
                      })}
                  </Box>
                </Box>
              )}
            </Box>
          )}

          {tempModules.length === 0 && (
            <Typography color="textSecondary" variant="body2">
              No modules added yet
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary" disabled={isSavingModules}>
            {isSavingModules ? <CircularProgress size={20} color="inherit" /> : 'Save Modules'}
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default View;
