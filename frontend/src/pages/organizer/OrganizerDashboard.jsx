import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  AppBar,
  Toolbar,
  Avatar,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Add,
  EmojiEvents,
  SportsTennis,
  Schedule,
  TrendingUp,
  People,
  Logout,
  Person
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import tournamentService from '../../services/tournamentService';
import matchService from '../../services/matchService';
import { Link, useNavigate } from 'react-router-dom';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const OrganizerDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    totalMatches: 0,
    completedMatches: 0,
    totalPlayers: 0
  });
  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

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

  const fetchDashboardData = async () => {
    try {
      const tournamentsData = await tournamentService.getMyTournaments();
      setTournaments(tournamentsData);
      
      const active = tournamentsData.filter(t => t.status === 'in-progress').length;
      const totalPlayers = tournamentsData.reduce((sum, t) => sum + (t.currentPlayers || 0), 0);
      
      setStats({
        totalTournaments: tournamentsData.length,
        activeTournaments: active,
        totalMatches: tournamentsData.reduce((sum, t) => sum + (t.matches?.length || 0), 0),
        completedMatches: tournamentsData.reduce((sum, t) => 
          sum + (t.matches?.filter(m => m.status === 'completed').length || 0), 0),
        totalPlayers: totalPlayers
      });
      
      // Get recent matches from all tournaments
      const allMatches = [];
      for (const tournament of tournamentsData) {
        try {
          const matches = await matchService.getTournamentMatches(tournament._id);
          if (matches && matches.rounds) {
            Object.values(matches.rounds).forEach(roundMatches => {
              if (Array.isArray(roundMatches)) {
                allMatches.push(...roundMatches);
              }
            });
          }
        } catch (error) {
          console.error('Error fetching matches for tournament:', tournament._id, error);
        }
      }
      setRecentMatches(allMatches.slice(-5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const tournamentData = [
    { name: 'Men Singles', value: tournaments.filter(t => t.category === 'men-singles').length },
    { name: 'Women Singles', value: tournaments.filter(t => t.category === 'women-singles').length },
    { name: 'Men Doubles', value: tournaments.filter(t => t.category === 'men-doubles').length },
    { name: 'Women Doubles', value: tournaments.filter(t => t.category === 'womendoubles').length },
    { name: 'Mixed', value: tournaments.filter(t => t.category === 'mixed-doubles').length }
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

  const StatCard = ({ title, value, icon, color }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box sx={{ bgcolor: color, borderRadius: 2, p: 1 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

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
              navigate('/organizer/profile');
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
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            Organizer Dashboard
          </Typography>
          <Button
            component={Link}
            to="/organizer/tournaments/create"
            variant="contained"
            startIcon={<Add />}
          >
            Create Tournament
          </Button>
        </Box>

        {/* Stats Grid */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Tournaments"
              value={stats.totalTournaments}
              icon={<EmojiEvents sx={{ color: 'white' }} />}
              color="#4caf50"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Tournaments"
              value={stats.activeTournaments}
              icon={<SportsTennis sx={{ color: 'white' }} />}
              color="#2196f3"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Matches"
              value={stats.totalMatches}
              icon={<Schedule sx={{ color: 'white' }} />}
              color="#ff9800"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Players"
              value={stats.totalPlayers}
              icon={<People sx={{ color: 'white' }} />}
              color="#9c27b0"
            />
          </Grid>
        </Grid>

        {/* Charts */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Tournament Distribution
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tournamentData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {tournamentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Completion Rate
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={[
                    {
                      name: 'Matches',
                      completed: stats.completedMatches,
                      total: stats.totalMatches - stats.completedMatches
                    }
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="completed" stackId="a" fill="#4caf50" name="Completed" />
                  <Bar dataKey="total" stackId="a" fill="#ff9800" name="Pending" />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Recent Tournaments */}
        <Typography variant="h5" gutterBottom>
          Your Tournaments
        </Typography>
        <Paper sx={{ width: '100%', overflow: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tournament Name</TableCell>
                <TableCell>Format</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Players</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tournaments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No tournaments found. Create your first tournament!
                  </TableCell>
                </TableRow>
              ) : (
                tournaments.map((tournament) => (
                  <TableRow key={tournament._id}>
                    <TableCell>{tournament.name}</TableCell>
                    <TableCell>{tournament.format}</TableCell>
                    <TableCell>
                      <Chip
                        label={tournament.status}
                        color={
                          tournament.status === 'in-progress' ? 'success' :
                          tournament.status === 'completed' ? 'default' : 'warning'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{tournament.currentPlayers}/{tournament.maxPlayers}</TableCell>
                    <TableCell>{new Date(tournament.startDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        size="small"
                        component={Link}
                        to={`/organizer/tournaments/${tournament._id}/bracket`}
                      >
                        View Bracket
                      </Button>
                      <Button
                        size="small"
                        component={Link}
                        to={`/organizer/matches?tournament=${tournament._id}`}
                      >
                        Matches
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Paper>

        {/* Recent Matches */}
        {recentMatches.length > 0 && (
          <>
            <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
              Recent Matches
            </Typography>
            <Paper sx={{ width: '100%', overflow: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Match #</TableCell>
                    <TableCell>Players</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentMatches.map((match) => (
                    <TableRow key={match._id}>
                      <TableCell>Match {match.matchNumber}</TableCell>
                      <TableCell>
                        {match.players?.map(p => p.user?.name).join(' vs ') || 'TBD'}
                      </TableCell>
                      <TableCell>
                        {match.scores?.length > 0 ? (
                          match.scores.map((score, i) => (
                            <span key={i}>
                              {score.set1 && `${score.set1.player1}-${score.set1.player2}`}
                              {i < match.scores.length - 1 && ', '}
                            </span>
                          ))
                        ) : (
                          'Not started'
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={match.status || 'scheduled'}
                          size="small"
                          color={match.status === 'completed' ? 'success' : 'warning'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </>
        )}
      </Container>
    </Box>
  );
};

export default OrganizerDashboard;