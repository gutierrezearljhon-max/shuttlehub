import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Box,
  IconButton
} from '@mui/material';
import courtService from '../../services/courtService';
import queueService from '../../services/queueService';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import toast from 'react-hot-toast';

const ManageCourts = () => {
  const [courts, setCourts] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCourt, setEditingCourt] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    settings: {
      maxQueueSize: 20,
      gameDuration: 15,
      rotationType: 'standard'
    }
  });

  useEffect(() => {
    fetchCourts();
  }, []);

  const fetchCourts = async () => {
    try {
      const data = await courtService.getAllCourts();
      setCourts(data);
    } catch (error) {
      toast.error('Failed to load courts');
    }
  };

  const handleSave = async () => {
    try {
      if (editingCourt) {
        await courtService.updateCourt(editingCourt._id, formData);
        toast.success('Court updated');
      } else {
        await courtService.createCourt(formData);
        toast.success('Court created');
      }
      setOpenDialog(false);
      fetchCourts();
      resetForm();
    } catch (error) {
      toast.error('Failed to save court');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this court?')) {
      try {
        await courtService.deleteCourt(id);
        toast.success('Court deleted');
        fetchCourts();
      } catch (error) {
        toast.error('Failed to delete court');
      }
    }
  };

  const handleClearQueue = async (courtId) => {
    if (window.confirm('Clear the entire queue for this court?')) {
      try {
        await queueService.clearQueue(courtId);
        toast.success('Queue cleared');
        fetchCourts();
      } catch (error) {
        toast.error('Failed to clear queue');
      }
    }
  };

  const resetForm = () => {
    setEditingCourt(null);
    setFormData({
      name: '',
      location: '',
      settings: {
        maxQueueSize: 20,
        gameDuration: 15,
        rotationType: 'standard'
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'occupied': return 'error';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Manage Courts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
        >
          Add Court
        </Button>
      </Box>

      <Grid container spacing={3}>
        {courts.map((court) => (
          <Grid item xs={12} md={6} key={court._id}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography variant="h5">{court.name}</Typography>
                    <Typography variant="body2" color="textSecondary">
                      {court.location}
                    </Typography>
                  </Box>
                  <Chip
                    label={court.status}
                    color={getStatusColor(court.status)}
                    size="small"
                  />
                </Box>

                <Box mt={2}>
                  <Typography variant="body2">
                    Queue Size: {court.queue?.length || 0}/{court.settings?.maxQueueSize || 20}
                  </Typography>
                  <Typography variant="body2">
                    Game Duration: {court.settings?.gameDuration} min
                  </Typography>
                  <Typography variant="body2">
                    Rotation: {court.settings?.rotationType === 'winner-stays' ? 'Winner Stays' : 'Standard'}
                  </Typography>
                </Box>

                <Box mt={2} display="flex" gap={1}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setEditingCourt(court);
                      setFormData({
                        name: court.name,
                        location: court.location,
                        settings: court.settings
                      });
                      setOpenDialog(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => handleDelete(court._id)}
                  >
                    Delete
                  </Button>
                  {court.queue?.length > 0 && (
                    <Button
                      size="small"
                      color="warning"
                      onClick={() => handleClearQueue(court._id)}
                    >
                      Clear Queue
                    </Button>
                  )}
                  <IconButton size="small" onClick={fetchCourts}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Court Form Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCourt ? 'Edit Court' : 'Add New Court'}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Court Name"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Location"
            value={formData.location}
            onChange={(e) => setFormData({...formData, location: e.target.value})}
            margin="normal"
          />
          <TextField
            fullWidth
            type="number"
            label="Max Queue Size"
            value={formData.settings.maxQueueSize}
            onChange={(e) => setFormData({
              ...formData,
              settings: {...formData.settings, maxQueueSize: parseInt(e.target.value)}
            })}
            margin="normal"
          />
          <TextField
            fullWidth
            type="number"
            label="Game Duration (minutes)"
            value={formData.settings.gameDuration}
            onChange={(e) => setFormData({
              ...formData,
              settings: {...formData.settings, gameDuration: parseInt(e.target.value)}
            })}
            margin="normal"
          />
          <TextField
            fullWidth
            select
            label="Rotation Type"
            value={formData.settings.rotationType}
            onChange={(e) => setFormData({
              ...formData,
              settings: {...formData.settings, rotationType: e.target.value}
            })}
            margin="normal"
            SelectProps={{ native: true }}
          >
            <option value="standard">Standard (All players go to back)</option>
            <option value="winner-stays">Winner Stays</option>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {editingCourt ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageCourts;