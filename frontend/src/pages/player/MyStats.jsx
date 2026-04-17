import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Avatar,
  LinearProgress,
  Divider
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import StarIcon from '@mui/icons-material/Star';

const MyStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const data = await authService.getUserStats();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const winLossData = stats ? [
    { name: 'Wins', value: stats.wins },
    { name: 'Losses', value: stats.losses }
  ] : [];

  const COLORS = ['#4caf50', '#f44336'];

  const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card sx={{ height: '100%', background: `linear-gradient(135deg, ${color} 0%, ${color}dd 100%)`, color: 'white' }}>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              {title}
            </Typography>
            <Typography variant="h3" component="div" fontWeight="bold">
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container sx={{ mt: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        My Statistics
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Track your performance and progress
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Matches"
            value={stats?.totalMatches || 0}
            icon={<SportsTennisIcon />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Win Rate"
            value={`${stats?.winRate || 0}%`}
            icon={<TrendingUpIcon />}
            color="#4caf50"
            subtitle={`${stats?.wins || 0} Wins / ${stats?.losses || 0} Losses`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Current Rating"
            value={stats?.currentRating || 1200}
            icon={<StarIcon />}
            color="#ff9800"
            subtitle="ELO Rating"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Tournaments Won"
            value={stats?.tournamentsWon || 0}
            icon={<EmojiEventsIcon />}
            color="#9c27b0"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Win/Loss Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={winLossData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {winLossData.map((entry, index) => (
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
              Recent Performance
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats?.recentPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="result" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8">
                  {stats?.recentPerformance?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.result === 'Win' ? '#4caf50' : '#f44336'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Rating History
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={stats?.ratingHistory || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip />
                <Line type="monotone" dataKey="rating" stroke="#2196f3" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Matches Table */}
      {stats?.recentPerformance && stats.recentPerformance.length > 0 && (
        <Paper sx={{ mt: 4, p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Matches
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {stats.recentPerformance.map((match, index) => (
            <Box key={index} display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Box>
                <Typography variant="body2" color="textSecondary">
                  {new Date(match.date).toLocaleDateString()}
                </Typography>
                <Typography variant="body1">
                  Result: <strong style={{ color: match.result === 'Win' ? '#4caf50' : '#f44336' }}>
                    {match.result}
                  </strong>
                </Typography>
              </Box>
              <Chip
                label={match.result}
                color={match.result === 'Win' ? 'success' : 'error'}
                size="small"
              />
            </Box>
          ))}
        </Paper>
      )}
    </Container>
  );
};

export default MyStats;