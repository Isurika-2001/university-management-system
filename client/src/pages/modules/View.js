import React, { useEffect, useState, useCallback } from 'react';
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
  CircularProgress
} from '@mui/material';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const View = () => {
  const [data, setData] = useState([]); // modules per course rows
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [moduleInput, setModuleInput] = useState('');
  const [tempModules, setTempModules] = useState([]);
  const [isSavingModules, setIsSavingModules] = useState(false); // New state for saving modules loading

  const Toast = withReactContent(
    Swal.mixin({
      toast: true,
      position: 'bottom',
      customClass: { popup: 'colored-toast' },
      background: 'primary',
      showConfirmButton: false,
      timer: 3500,
      timerProgressBar: true
    })
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
  }, [setData, showErrorSwal]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenDialog = (course) => {
    setSelectedCourse(course);
    setTempModules([...(course.modules || [])]);
    setModuleInput('');
    setOpenDialog(true);
  };

  const handleAddModule = () => {
    const trimmed = moduleInput.trim();
    if (trimmed && !tempModules.includes(trimmed)) {
      setTempModules([...tempModules, trimmed]);
      setModuleInput('');
    }
  };

  const handleRemoveModule = (index) => {
    setTempModules(tempModules.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!selectedCourse) return;

    try {
      setIsSavingModules(true); // Set loading true
      await modulesAPI.upsert({ courseId: selectedCourse.courseId || selectedCourse.courseId || selectedCourse._id, modules: tempModules });
      await fetchData();
      setOpenDialog(false);
      showSuccessSwal('Modules saved successfully');
    } catch (err) {
      console.error(err);
      showErrorSwal('Error saving modules');
    } finally {
      setIsSavingModules(false); // Set loading false
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCourse(null);
    setTempModules([]);
    setModuleInput('');
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
                <TableCell>Action</TableCell>
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
                        {(row.modules || []).map((mod, idx) => (
                          <Chip key={idx} label={mod} size="small" variant="outlined" />
                        ))}
                      </Box>
                    ) : (
                      <Typography color="textSecondary">Empty</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button variant="outlined" size="small" onClick={() => handleOpenDialog(row)}>
                      Manage
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Manage Modules Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Modules - {selectedCourse?.courseName}</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          {/* Input Section */}
          <Grid container spacing={1} sx={{ mb: 3 }}>
            <Grid item xs={11}>
              <TextField
                fullWidth
                size="small"
                label="Enter module name"
                value={moduleInput}
                onChange={(e) => setModuleInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddModule();
                  }
                }}
                variant="outlined"
              />
            </Grid>
            <Grid item xs={1}>
              <IconButton color="primary" onClick={handleAddModule} disabled={!moduleInput.trim()} sx={{ mt: 0.5 }}>
                <PlusOutlined />
              </IconButton>
            </Grid>
          </Grid>

          {/* Modules List */}
          {tempModules.length > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                Added Modules:
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {tempModules.map((mod, idx) => (
                  <Chip key={idx} label={mod} onDelete={() => handleRemoveModule(idx)} icon={<DeleteOutlined />} color="primary" />
                ))}
              </Box>
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
