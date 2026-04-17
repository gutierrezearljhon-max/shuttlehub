import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import tournamentService from '../../services/tournamentService';
import toast from 'react-hot-toast';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PeopleIcon from '@mui/icons-material/People';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

const AvailableTournaments = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState([]);
  const [myTournaments, setMyTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [available, registered] = await Promise.all([
        tournamentService.getAvailableTournaments(),
        tournamentService.getMyTournaments()
      ]);
      setTournaments(available);
      setMyTournaments(registered);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
    } finally {
      setLoading(false);
    }
  };

  const isRegistered = (tournamentId) => {
    return myTournaments.some(t => t._id === tournamentId);
  };

  const handleRegister = async (tournament) => {
    try {
      await tournamentService.registerForTournament(tournament._id);
      toast.success(`Successfully registered for ${tournament.name}!`);
      setOpenDialog(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Available Tournaments
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Browse and register for upcoming tournaments
      </Typography>

      <Grid container spacing={3}>
        {tournaments.length === 0 ? (
          <Grid item xs={12}>
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No tournaments available for registration at the moment.
              </Typography>
            </Paper>
          </Grid>
        ) : (
          tournaments.map((tournament) => (
            <Grid item xs={12} md={6} key={tournament._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="start">
                    <Typography variant="h5" gutterBottom>
                      {tournament.name}
                    </Typography>
                    <Chip
                      label={tournament.format.replace('-', ' ')}
                      size="small"
                      color="primary"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" gutterBottom>
                    {tournament.category}
                  </Typography>
                  
                  <Box mt={2}>
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <CalendarTodayIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {new Date(tournament.startDate).toLocaleDateString()}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <LocationOnIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {tournament.venue}
                      </Typography>
                    </Box>
                    
                    <Box display="flex" alignItems="center" gap={1} mb={1}>
                      <PeopleIcon fontSize="small" color="action" />
                      <Typography variant="body2">
                        {tournament.currentPlayers}/{tournament.maxPlayers} Players
                      </Typography>
                    </Box>
                    
                    {tournament.entryFee > 0 && (
                      <Box display="flex" alignItems="center" gap={1} mb={1}>
                        <AttachMoneyIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          Entry Fee: Php{tournament.entryFee}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                  
                  <LinearProgress
                    variant="determinate"
                    value={(tournament.currentPlayers / tournament.maxPlayers) * 100}
                    sx={{ my: 2 }}
                  />
                  
                  {tournament.prizePool > 0 && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Prize Pool: Php{tournament.prizePool}
                    </Alert>
                  )}
                </CardContent>
                
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => {
                      setSelectedTournament(tournament);
                      setOpenDialog(true);
                    }}
                    disabled={isRegistered(tournament._id) || tournament.currentPlayers >= tournament.maxPlayers}
                  >
                    {isRegistered(tournament._id) 
                      ? 'Already Registered' 
                      : tournament.currentPlayers >= tournament.maxPlayers 
                        ? 'Tournament Full' 
                        : 'Register Now'}
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {/* Registration Confirmation Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Confirm Registration</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to register for <strong>{selectedTournament?.name}</strong>?
          </Typography>
          {selectedTournament?.entryFee > 0 && (
            <Typography color="warning" sx={{ mt: 2 }}>
              Entry Fee: Php{selectedTournament?.entryFee} will be charged.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={() => handleRegister(selectedTournament)} variant="contained" color="primary">
            Confirm Registration
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AvailableTournaments;