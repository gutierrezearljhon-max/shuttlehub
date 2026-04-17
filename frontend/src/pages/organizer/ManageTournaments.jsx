import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  TextField
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import tournamentService from '../../services/tournamentService';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VisibilityIcon from '@mui/icons-material/Visibility';
import toast from 'react-hot-toast';

const ManageTournaments = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [newStatus, setNewStatus] = useState('');

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const data = await tournamentService.getMyTournaments();
      setTournaments(data);
    } catch (error) {
      toast.error('Failed to load tournaments');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this tournament?')) {
      try {
        await tournamentService.deleteTournament(id);
        toast.success('Tournament deleted');
        fetchTournaments();
      } catch (error) {
        toast.error('Failed to delete tournament');
      }
    }
  };

  const handleStatusChange = async () => {
    try {
      await tournamentService.updateTournamentStatus(selectedTournament._id, newStatus);
      toast.success('Tournament status updated');
      setOpenDialog(false);
      fetchTournaments();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'registration': return 'warning';
      case 'in-progress': return 'info';
      case 'completed': return 'success';
      case 'cancelled': return 'error';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Manage Tournaments
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/organizer/tournaments/create')}
        >
          Create Tournament
        </Button>
      </Box>

      <Paper sx={{ width: '100%', overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tournament Name</TableCell>
              <TableCell>Format</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Players</TableCell>
              <TableCell>Start Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tournaments.map((tournament) => (
              <TableRow key={tournament._id}>
                <TableCell>{tournament.name}</TableCell>
                <TableCell>{tournament.format}</TableCell>
                <TableCell>{tournament.category}</TableCell>
                <TableCell>
                  <Chip
                    label={tournament.status}
                    color={getStatusColor(tournament.status)}
                    size="small"
                    onClick={() => {
                      setSelectedTournament(tournament);
                      setNewStatus(tournament.status);
                      setOpenDialog(true);
                    }}
                  />
                </TableCell>
                <TableCell>{tournament.currentPlayers}/{tournament.maxPlayers}</TableCell>
                <TableCell>{new Date(tournament.startDate).toLocaleDateString()}</TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/organizer/tournaments/${tournament._id}/bracket`)}
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDelete(tournament._id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Status Change Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Update Tournament Status</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            select
            label="New Status"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            margin="normal"
          >
            <MenuItem value="registration">Registration</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleStatusChange} variant="contained">Update</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageTournaments;