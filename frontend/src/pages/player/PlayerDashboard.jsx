import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Button,
  LinearProgress,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem
} from '@mui/material';
import {
  SportsTennis,
  EmojiEvents,
  Groups,
  TrendingUp,
  Schedule,
  Queue,
  Logout,
  Person
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import tournamentService from '../../services/tournamentService';
import matchService from '../../services/matchService';
import { Link, useNavigate } from 'react-router-dom';


const StatCard = ({ title, value, icon, color, loading }) => (
  <Card sx={{ height: '100%' }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography color="textSecondary" gutterBottom variant="body2">
            {title}
          </Typography>
          {loading ? (
            <LinearProgress />
          ) : (
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          )}
        </Box>
        <Avatar sx={{ bgcolor: color, width: 48, height: 48 }}>
          {icon}
        </Avatar>
      </Box>
    </CardContent>
  </Card>
);

const PlayerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [upcomingMatches, setUpcomingMatches] = useState([]);
  const [activeTournaments, setActiveTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [queueStatus, setQueueStatus] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsData, matchesData, tournamentsData] = await Promise.all([
        authService.getUserStats(),
        matchService.getMyMatches(),
        tournamentService.getMyTournaments()
      ]);

      setStats(statsData);
      setUpcomingMatches(matchesData.upcoming || []);
      setActiveTournaments(tournamentsData.filter(t => t.status === 'in-progress'));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
  };

  const quickActions = [
    { title: 'Find Tournament', path: '/player/tournaments', icon: <EmojiEvents />, color: '#e91e63' },
    { title: 'Quick Play', path: '/player/quick-play', icon: <Queue />, color: '#2196f3' },
    { title: 'My Matches', path: '/player/matches', icon: <SportsTennis />, color: '#4caf50' },
    { title: 'View Stats', path: '/player/stats', icon: <TrendingUp />, color: '#ff9800' }
  ];

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Top Navigation Bar with Logout */}
      <AppBar position="sticky" color="primary">
        <Toolbar>
          <SportsTennis sx={{ mr: 2 }} />
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            ShuttleHub
          </Typography>
          
          {/* <Typography variant="body2" sx={{ mr: 2 }}>
            {user?.name || user?.firstname}
          </Typography> */}
          
          <IconButton onClick={handleMenu} color="inherit">
            <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32 }}>
              {(user?.name || user?.firstname)?.charAt(0)?.toUpperCase() || 'U'}
            </Avatar>
          </IconButton>
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => {
              handleClose();
              navigate('/player/profile');
            }}>
              <Person sx={{ mr: 1 }} /> Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <Logout sx={{ mr: 1 }} /> Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome Section */}
        <Paper sx={{ p: 3, mb: 3, bgcolor: 'primary.main', color: 'white' }}>
          <Typography variant="h4" gutterBottom>
            Welcome back, {user?.firstname || user?.name}!
          </Typography>
          <Typography variant="body1">
            Ready to play some badminton? Check your upcoming matches or join a quick game.
          </Typography>
        </Paper>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Matches Played"
              value={stats?.totalMatches || 0}
              icon={<SportsTennis />}
              color="#4caf50"
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Win Rate"
              value={`${stats?.winRate || 0}%`}
              icon={<TrendingUp />}
              color="#2196f3"
              loading={loading}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <StatCard
              title="Tournaments Won"
              value={stats?.tournamentsWon || 0}
              icon={<EmojiEvents />}
              color="#ff9800"
              loading={loading}
            />
          </Grid>
          {/* <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Current Rating"
              value={stats?.currentRating || 1200}
              icon={<Groups />}
              color="#9c27b0"
              loading={loading}
            />
          </Grid> */}
        </Grid>

        {/* Quick Actions */}
        <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {quickActions.map((action) => (
            <Grid item xs={6} sm={3} key={action.title}>
              <Button
                component={Link}
                to={action.path}
                variant="outlined"
                fullWidth
                sx={{
                  py: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  borderColor: action.color,
                  color: action.color,
                  '&:hover': {
                    borderColor: action.color,
                    bgcolor: `${action.color}10`
                  }
                }}
              >
                {action.icon}
                <Typography variant="body2">{action.title}</Typography>
              </Button>
            </Grid>
          ))}
        </Grid>

        {/* Upcoming Matches */}
        <Typography variant="h5" gutterBottom>
          Upcoming Matches
        </Typography>
        <Grid container spacing={3}>
          {upcomingMatches.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="textSecondary">
                  No upcoming matches. Join a tournament or quick play!
                </Typography>
                <Button
                  component={Link}
                  to="/player/quick-play"
                  variant="contained"
                  sx={{ mt: 2 }}
                >
                  Join Quick Play
                </Button>
              </Paper>
            </Grid>
          ) : (
            upcomingMatches.map((match) => (
              <Grid item xs={12} md={6} key={match._id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="h6">
                        {match.tournament?.name || 'Friendly Match'}
                      </Typography>
                      <Schedule color="action" />
                    </Box>
                    <Typography color="textSecondary">
                      {new Date(match.scheduledTime).toLocaleString()}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 2 }}>
                      Opponent: {match.players?.find(p => p.user?._id !== user?._id)?.user?.name || 'TBD'}
                    </Typography>
                    <Typography variant="body2">
                      Court: {match.court?.name || 'To be assigned'}
                    </Typography>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ mt: 2 }}
                      component={Link}
                      to={`/player/matches/${match._id}`}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>

        {/* Active Tournaments */}
        {activeTournaments.length > 0 && (
          <>
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              Active Tournaments
            </Typography>
            <Grid container spacing={3}>
              {activeTournaments.map((tournament) => (
                <Grid item xs={12} md={4} key={tournament._id}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6">{tournament.name}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Format: {tournament.format}
                      </Typography>
                      <Typography variant="body2">
                        Players: {tournament.currentPlayers}/{tournament.maxPlayers}
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={(tournament.currentPlayers / tournament.maxPlayers) * 100}
                        sx={{ my: 1 }}
                      />
                      <Button
                        size="small"
                        component={Link}
                        to={`/player/tournaments/${tournament._id}`}
                      >
                        View Bracket
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </>
        )}
      </Container>
    </Box>
  );
};

export default PlayerDashboard;