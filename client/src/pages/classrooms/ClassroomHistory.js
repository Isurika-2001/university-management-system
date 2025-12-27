import React, { useEffect, useState } from 'react';
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, Paper, CircularProgress } from '@mui/material';
import { apiRoutes } from 'config';
import { useAuthContext } from 'context/useAuthContext';

const ClassroomHistory = ({ enrollmentId }) => {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function fetchHistory() {
      if (!enrollmentId) return;
      setLoading(true);
      try {
        const res = await fetch(`${apiRoutes.studentRoute}enrollment/${enrollmentId}/history`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${user.token}` }
        });
        const json = await res.json();
        if (!mounted) return;
        setHistory(json.data || []);
      } catch (err) {
        console.error('Error fetching classroom history:', err);
        setHistory([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchHistory();
    return () => {
      mounted = false;
    };
  }, [enrollmentId, user.token]);

  if (!enrollmentId) return null;

  return (
    <Box sx={{ mb: 3 }}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Classroom History
        </Typography>
        {loading ? (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CircularProgress size={20} />
            <Typography>Loading history...</Typography>
          </Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Classroom</TableCell>
                <TableCell>Course</TableCell>
                <TableCell>Batch</TableCell>
                <TableCell>Module</TableCell>
                <TableCell>Assigned At</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center' }}>
                    No classroom assignments found
                  </TableCell>
                </TableRow>
              ) : (
                history.map((h) => (
                  <TableRow key={h._id}>
                    <TableCell>{h.classroomId?.name || '-'}</TableCell>
                    <TableCell>{h.classroomId?.courseId?.name || '-'}</TableCell>
                    <TableCell>{h.classroomId?.batchId?.name || '-'}</TableCell>
                    <TableCell>{h.classroomId?.moduleId?.name || '-'}</TableCell>
                    <TableCell>{h.createdAt ? new Date(h.createdAt).toLocaleString() : '-'}</TableCell>
                    <TableCell>{h.status || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </Paper>
    </Box>
  );
};

export default ClassroomHistory;
