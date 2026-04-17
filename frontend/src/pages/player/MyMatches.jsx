import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  Button,
  Grid,
  Tabs,
  Tab,
  Avatar,
  Divider
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import matchService from '../../services/matchService';
import ScheduleIcon from '@mui/icons-material/Schedule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';

const MyMatches = () => {
  const { user } = useAuth();
  const [matches, setMatches] = useState({ upcoming: [], inProgress: [], completed: [] });
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const data = await matchService.getMyMatches();
      setMatches(data);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOpponent = (match) => {
    const opponent = match.players?.find(p => p.user?._id !== user?._id);
    return opponent?.user?.name || 'TBD';
  };

  const getScore = (match) => {
    if (!match.scores || match.scores.length === 0) return 'VS';
    const sets = match.scores.map((score, i) => {
      if (score.set1) return `${score.set1.player1}-${score.set1.player2}`;
      return '';
    }).filter(s => s);
    return sets.join(', ');
  };

  const MatchCard = ({ match, type }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h6">
              {match.tournament?.name || 'Friendly Match'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Round {match.round} • Match #{match.matchNumber}
            </Typography>
          </Box>
          <Chip
            label={match.status}
            color={match.status === 'completed' ? 'success' : match.status === 'in-progress' ? 'warning' : 'info'}
            size="small"
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Avatar sx={{ bgcolor: 'primary.main' }}>
              <SportsTennisIcon />
            </Avatar>
            <Typography variant="body1">
              {type === 'completed' ? 'Result: ' : 'Opponent: '}
              <strong>{getOpponent(match)}</strong>
            </Typography>
          </Box>
          <Typography variant="h6" color="primary">
            {getScore(match)}
          </Typography>
        </Box>
        
        {match.scheduledTime && (
          <Box mt={2} display="flex" alignItems="center" gap={1}>
            <ScheduleIcon fontSize="small" color="action" />
            <Typography variant="body2" color="textSecondary">
              {new Date(match.scheduledTime).toLocaleString()}
            </Typography>
          </Box>
        )}
        
        {match.court && (
          <Typography variant="body2" color="textSecondary" mt={1}>
            Court: {match.court.name}
          </Typography>
        )}
        
        {type !== 'completed' && match.status !== 'completed' && (
          <Button variant="outlined" size="small" sx={{ mt: 2 }}>
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Matches
      </Typography>
      
      <Paper sx={{ width: '100%', mb: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(e, v) => setTabValue(v)}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
        >
          <Tab label={`Upcoming (${matches.upcoming?.length || 0})`} />
          <Tab label={`In Progress (${matches.inProgress?.length || 0})`} />
          <Tab label={`Completed (${matches.completed?.length || 0})`} />
        </Tabs>
      </Paper>
      
      <Box>
        {tabValue === 0 && (
          matches.upcoming?.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No upcoming matches. Join a tournament to get started!
              </Typography>
            </Paper>
          ) : (
            matches.upcoming.map(match => (
              <MatchCard key={match._id} match={match} type="upcoming" />
            ))
          )
        )}
        
        {tabValue === 1 && (
          matches.inProgress?.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No matches in progress
              </Typography>
            </Paper>
          ) : (
            matches.inProgress.map(match => (
              <MatchCard key={match._id} match={match} type="in-progress" />
            ))
          )
        )}
        
        {tabValue === 2 && (
          matches.completed?.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="textSecondary">
                No completed matches yet
              </Typography>
            </Paper>
          ) : (
            matches.completed.map(match => (
              <MatchCard key={match._id} match={match} type="completed" />
            ))
          )
        )}
      </Box>
    </Container>
  );
};

export default MyMatches;