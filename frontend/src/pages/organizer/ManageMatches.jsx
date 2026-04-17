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
  Chip,
  Button,
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import matchService from '../../services/matchService';
import tournamentService from '../../services/tournamentService';
import toast from 'react-hot-toast';

const ManageMatches = () => {
  const [searchParams] = useSearchParams();
  const tournamentId = searchParams.get('tournament');
  const [matches, setMatches] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(tournamentId || '');
  const [openScoreDialog, setOpenScoreDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [scores, setScores] = useState({
    set1: { player1: 0, player2: 0 },
    set2: { player1: 0, player2: 0 },
    set3: { player1: 0, player2: 0 }
  });

  useEffect(() => {
    fetchTournaments();
  }, []);

  useEffect(() => {
    if (selectedTournament) {
      fetchMatches();
    }
  }, [selectedTournament]);

  const fetchTournaments = async () => {
    try {
      const data = await tournamentService.getMyTournaments();
      setTournaments(data);
    } catch (error) {
      toast.error('Failed to load tournaments');
    }
  };

  const fetchMatches = async () => {
    try {
      const data = await matchService.getTournamentMatches(selectedTournament);
      const allMatches = [];
      Object.values(data.rounds || {}).forEach(roundMatches => {
        allMatches.push(...roundMatches);
      });
      setMatches(allMatches);
    } catch (error) {
      toast.error('Failed to load matches');
    }
  };

  const handleUpdateScore = async () => {
    try {
      await matchService.updateMatchScore(selectedMatch._id, [scores]);
      toast.success('Score updated successfully');
      setOpenScoreDialog(false);
      fetchMatches();
    } catch (error) {
      toast.error('Failed to update score');
    }
  };

  const handleCompleteMatch = async (matchId) => {
    if (window.confirm('Mark this match as completed?')) {
      try {
        await matchService.completeMatch(matchId);
        toast.success('Match completed');
        fetchMatches();
      } catch (error) {
        toast.error('Failed to complete match');
      }
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Manage Matches
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          select
          label="Select Tournament"
          value={selectedTournament}
          onChange={(e) => setSelectedTournament(e.target.value)}
          fullWidth
          SelectProps={{ native: true }}
        >
          <option value="">Select a tournament</option>
          {tournaments.map(t => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </TextField>
      </Paper>

      {selectedTournament && (
        <Paper sx={{ width: '100%', overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Match #</TableCell>
                <TableCell>Round</TableCell>
                <TableCell>Players</TableCell>
                <TableCell>Score</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {matches.map((match) => (
                <TableRow key={match._id}>
                  <TableCell>{match.matchNumber}</TableCell>
                  <TableCell>{match.round}</TableCell>
                  <TableCell>
                    {match.players?.map(p => p.user?.name).join(' vs ')}
                  </TableCell>
                  <TableCell>
                    {match.scores?.map((score, i) => (
                      <Box key={i}>
                        {score.set1 && `${score.set1.player1}-${score.set1.player2}`}
                      </Box>
                    ))}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={match.status}
                      color={match.status === 'completed' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {match.status !== 'completed' && (
                      <>
                        <Button
                          size="small"
                          onClick={() => {
                            setSelectedMatch(match);
                            setOpenScoreDialog(true);
                          }}
                        >
                          Update Score
                        </Button>
                        <Button
                          size="small"
                          color="success"
                          onClick={() => handleCompleteMatch(match._id)}
                        >
                          Complete
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      )}

      {/* Score Update Dialog */}
      <Dialog open={openScoreDialog} onClose={() => setOpenScoreDialog(false)} maxWidth="md">
        <DialogTitle>Update Match Score</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {[1, 2, 3].map(setNum => (
              <Grid item xs={12} key={setNum}>
                <Typography variant="subtitle1">Set {setNum}</Typography>
                <Box display="flex" gap={2}>
                  <TextField
                    type="number"
                    label={`Player 1 Score`}
                    value={scores[`set${setNum}`].player1}
                    onChange={(e) => setScores({
                      ...scores,
                      [`set${setNum}`]: {
                        ...scores[`set${setNum}`],
                        player1: parseInt(e.target.value) || 0
                      }
                    })}
                    fullWidth
                  />
                  <TextField
                    type="number"
                    label={`Player 2 Score`}
                    value={scores[`set${setNum}`].player2}
                    onChange={(e) => setScores({
                      ...scores,
                      [`set${setNum}`]: {
                        ...scores[`set${setNum}`],
                        player2: parseInt(e.target.value) || 0
                      }
                    })}
                    fullWidth
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenScoreDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateScore} variant="contained">Save Score</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ManageMatches;