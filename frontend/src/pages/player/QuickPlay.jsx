import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Chip,
  Box,
  LinearProgress,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio
} from '@mui/material';
import {
  Queue as QueueIcon,
  PersonAdd,
  ExitToApp,
  Refresh,
  SportsTennis
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import courtService from '../../services/courtService';
import queueService from '../../services/queueService';
import toast from 'react-hot-toast';

const QuickPlay = () => {
  const { user } = useAuth();
  const socket = useSocket();
  const [courts, setCourts] = useState([]);
  const [selectedCourt, setSelectedCourt] = useState(null);
  const [queueStatus, setQueueStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openCourtDialog, setOpenCourtDialog] = useState(false);
  const [gameType, setGameType] = useState('singles');

  useEffect(() => {
    fetchCourts();
    
    if (socket) {
      socket.on('queue-updated', handleQueueUpdate);
    }
    
    return () => {
      if (socket) {
        socket.off('queue-updated');
      }
    };
  }, [socket]);

  const fetchCourts = async () => {
    try {
      const courtsData = await courtService.getAllCourts();
      setCourts(courtsData);
    } catch (error) {
      toast.error('Failed to load courts');
    }
  };

  const fetchQueueStatus = async (courtId) => {
    try {
      const status = await queueService.getQueueStatus(courtId);
      setQueueStatus(status);
    } catch (error) {
      console.error('Error fetching queue status:', error);
    }
  };

  const handleQueueUpdate = (data) => {
    if (selectedCourt && data.courtId === selectedCourt._id) {
      fetchQueueStatus(selectedCourt._id);
    }
  };

  const handleJoinQueue = async (court) => {
    setLoading(true);
    try {
      await queueService.joinQueue(court._id);
      setSelectedCourt(court);
      await fetchQueueStatus(court._id);
      toast.success('Added to queue!');
      setOpenCourtDialog(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to join queue');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveQueue = async () => {
    if (!selectedCourt) return;
    
    try {
      await queueService.leaveQueue(selectedCourt._id);
      setSelectedCourt(null);
      setQueueStatus(null);
      toast.success('Left queue');
    } catch (error) {
      toast.error('Failed to leave queue');
    }
  };

  const getCourtStatusColor = (status) => {
    switch (status) {
      case 'available': return 'success';
      case 'occupied': return 'error';
      case 'maintenance': return 'warning';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Quick Play
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Join a queue and play with other players in real-time
      </Typography>

      {selectedCourt ? (
        // Queue Status View
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h5">
                    Queue Status - {selectedCourt.name}
                  </Typography>
                  <IconButton onClick={() => fetchQueueStatus(selectedCourt._id)}>
                    <Refresh />
                  </IconButton>
                </Box>
                
                {queueStatus && (
                  <>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="textSecondary">
                        Total in queue: {queueStatus.queueSize}
                      </Typography>
                      {queueStatus.userPosition && (
                        <Typography variant="h6" sx={{ mt: 1 }}>
                          Your position: #{queueStatus.userPosition}
                        </Typography>
                      )}
                      {queueStatus.estimatedWaitTime && (
                        <Typography variant="body2" color="primary">
                          Estimated wait: {queueStatus.estimatedWaitTime} minutes
                        </Typography>
                      )}
                    </Box>

                    <LinearProgress
                      variant="determinate"
                      value={(queueStatus.queueSize / queueStatus.maxSize) * 100}
                      sx={{ my: 2 }}
                    />

                    <Typography variant="h6" sx={{ mt: 3 }}>
                      Current Queue
                    </Typography>
                    <List>
                      {queueStatus.queue?.slice(0, 10).map((player, index) => (
                        <ListItem key={index}>
                          <ListItemAvatar>
                            <Avatar>
                              {player.user?.name?.charAt(0)}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={player.user?.name}
                            secondary={`Position: ${player.position} • Waiting: ${player.waitTime} min`}
                          />
                          {index < 4 && (
                            <Chip
                              label={index === 0 ? "Next Up" : `Next in ${index}`}
                              size="small"
                              color="primary"
                            />
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Your Queue Status
                </Typography>
                <Box textAlign="center" sx={{ my: 3 }}>
                  <QueueIcon sx={{ fontSize: 60, color: 'primary.main' }} />
                  <Typography variant="h3">
                    #{queueStatus?.userPosition || '?'}
                  </Typography>
                </Box>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  onClick={handleLeaveQueue}
                  startIcon={<ExitToApp />}
                >
                  Leave Queue
                </Button>
              </CardContent>
            </Card>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Court Information
                </Typography>
                <Typography variant="body2">
                  Location: {selectedCourt.location}
                </Typography>
                <Typography variant="body2">
                  Status: {selectedCourt.status}
                </Typography>
                <Typography variant="body2">
                  Game Duration: {selectedCourt.settings?.gameDuration} min
                </Typography>
                <Typography variant="body2">
                  Rotation: {selectedCourt.settings?.rotationType === 'winner-stays' ? 'Winner Stays' : 'Standard'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : (
        // Available Courts View
        <Grid container spacing={3}>
          {courts.filter(c => c.status === 'available').map((court) => (
            <Grid item xs={12} md={6} key={court._id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h5">{court.name}</Typography>
                    <Chip
                      label={court.status}
                      color={getCourtStatusColor(court.status)}
                      size="small"
                    />
                  </Box>
                  <Typography color="textSecondary" gutterBottom>
                    {court.location}
                  </Typography>
                  <Typography variant="body2">
                    Queue size: {court.queue?.length || 0}/{court.settings?.maxQueueSize || 20}
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={((court.queue?.length || 0) / (court.settings?.maxQueueSize || 20)) * 100}
                    sx={{ my: 1 }}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    sx={{ mt: 2 }}
                    onClick={() => {
                      setSelectedCourt(court);
                      setOpenCourtDialog(true);
                    }}
                    startIcon={<PersonAdd />}
                  >
                    Join Queue
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Game Type Selection Dialog */}
      <Dialog open={openCourtDialog} onClose={() => setOpenCourtDialog(false)}>
        <DialogTitle>Join Queue</DialogTitle>
        <DialogContent>
          <Typography variant="body2" paragraph>
            Select game type for {selectedCourt?.name}
          </Typography>
          <RadioGroup value={gameType} onChange={(e) => setGameType(e.target.value)}>
            <FormControlLabel value="singles" control={<Radio />} label="Singles (2 players)" />
            <FormControlLabel value="doubles" control={<Radio />} label="Doubles (4 players)" />
          </RadioGroup>
          <Alert severity="info" sx={{ mt: 2 }}>
            You'll be notified when it's your turn to play
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenCourtDialog(false)}>Cancel</Button>
          <Button
            onClick={() => selectedCourt && handleJoinQueue(selectedCourt)}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Joining...' : 'Join Queue'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default QuickPlay;