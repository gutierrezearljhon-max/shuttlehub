import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Alert
} from '@mui/material';
import tournamentService from '../../services/tournamentService';
import matchService from '../../services/matchService';
import toast from 'react-hot-toast';

const TournamentBracket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [tournamentData, matchesData] = await Promise.all([
        tournamentService.getTournamentById(id),
        matchService.getTournamentMatches(id)
      ]);
      setTournament(tournamentData);
      setMatches(matchesData.rounds || {});
    } catch (error) {
      toast.error('Failed to load bracket');
    } finally {
      setLoading(false);
    }
  };

  const generateBracket = async () => {
    try {
      await tournamentService.generateBracket(id);
      toast.success('Bracket generated successfully');
      fetchData();
    } catch (error) {
      toast.error('Failed to generate bracket');
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  const rounds = Object.keys(matches).sort((a, b) => a - b);

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          {tournament?.name} - Tournament Bracket
        </Typography>
        <Button variant="contained" onClick={() => navigate('/organizer/matches')}>
          Manage Matches
        </Button>
      </Box>

      {(!tournament?.bracket || Object.keys(matches).length === 0) ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom>
            No bracket generated yet
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Generate a bracket to start the tournament
          </Typography>
          <Button variant="contained" onClick={generateBracket}>
            Generate Bracket
          </Button>
        </Paper>
      ) : (
        <Box sx={{ overflowX: 'auto' }}>
          <Box display="flex" gap={4} sx={{ minWidth: 'max-content', p: 2 }}>
            {rounds.map((roundNum) => (
              <Box key={roundNum} sx={{ minWidth: 280 }}>
                <Typography variant="h6" align="center" gutterBottom>
                  Round {roundNum}
                </Typography>
                {matches[roundNum]?.map((match) => (
                  <Card key={match._id} sx={{ mb: 2, minWidth: 260 }}>
                    <CardContent>
                      <Typography variant="caption" color="textSecondary">
                        Match #{match.matchNumber}
                      </Typography>
                      {match.players?.map((player, idx) => (
                        <Box
                          key={idx}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          sx={{
                            py: 1,
                            borderBottom: idx === 0 ? '1px solid #eee' : 'none',
                            bgcolor: match.winner === player.user?._id ? '#e8f5e9' : 'transparent'
                          }}
                        >
                          <Typography variant="body2">
                            {player.user?.name || 'TBD'}
                          </Typography>
                          <Chip
                            label={player.score || 0}
                            size="small"
                            color={match.winner === player.user?._id ? 'success' : 'default'}
                          />
                        </Box>
                      ))}
                      <Box mt={1}>
                        <Chip
                          label={match.status}
                          size="small"
                          color={
                            match.status === 'completed' ? 'success' :
                            match.status === 'in-progress' ? 'warning' : 'default'
                          }
                        />
                      </Box>
                    </CardContent>
                  </Card>
                ))}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {tournament?.status === 'completed' && (
        <Alert severity="success" sx={{ mt: 3 }}>
          🏆 Tournament completed! Winner: {tournament.winner?.name}
        </Alert>
      )}
    </Container>
  );
};

export default TournamentBracket;