import React, { useEffect, useState } from 'react';
import MainCard from 'components/MainCard';
import { PATHWAY_LIST } from 'constants/pathways';
import { modulesAPI } from '../../api/modules';
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
  Typography
} from '@mui/material';
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const View = () => {
  const [data, setData] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState(null);
  const [moduleInput, setModuleInput] = useState('');
  const [tempModules, setTempModules] = useState([]);

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

  const showSuccessSwal = (msg) => {
    Toast.fire({ icon: 'success', title: msg });
  };

  const showErrorSwal = (msg) => {
    Toast.fire({ icon: 'error', title: msg });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await modulesAPI.getAll();
      if (res && res.data) setData(res.data);
    } catch (error) {
      console.error(error);
      showErrorSwal('Error loading modules');
    }
  };

  const handleOpenDialog = (pathway) => {
    const row = data.find((d) => d.pathway === pathway.id) || { modules: [] };
    setSelectedPathway(pathway);
    setTempModules([...(row.modules || [])]);
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
    if (!selectedPathway) return;

    try {
      await modulesAPI.upsert({ pathway: selectedPathway.id, modules: tempModules });
      await fetchData();
      setOpenDialog(false);
      showSuccessSwal('Modules saved successfully');
    } catch (err) {
      console.error(err);
      showErrorSwal('Error saving modules');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedPathway(null);
    setTempModules([]);
    setModuleInput('');
  };

  return (
    <MainCard title="Pathway Modules">
      <Box>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Pathway</TableCell>
                <TableCell>Modules</TableCell>
                <TableCell>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {PATHWAY_LIST.map((p) => {
                const row = data.find((d) => d.pathway === p.id) || { modules: [] };
                return (
                  <TableRow key={p.id}>
                    <TableCell>{p.label}</TableCell>
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
                      <Button variant="outlined" size="small" onClick={() => handleOpenDialog(p)}>
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Manage Modules Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Manage Modules - {selectedPathway?.label}</DialogTitle>
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
          <Button onClick={handleSave} variant="contained" color="primary">
            Save Modules
          </Button>
        </DialogActions>
      </Dialog>
    </MainCard>
  );
};

export default View;
