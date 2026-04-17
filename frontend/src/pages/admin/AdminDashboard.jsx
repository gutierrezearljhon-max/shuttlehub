import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Button
} from '@mui/material';
import {
  People,
  EmojiEvents,
  SportsTennis,
  AttachMoney,
  TrendingUp,
  Warning
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeTournaments: 0,
    totalMatches: 0,
    revenue: 0,
    monthlyGrowth: [],
    userDistribution: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await api.get('/admin/reports/overview');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Set fallback data if API fails
      setStats({
        totalUsers: 0,
        activeTournaments: 0,
        totalMatches: 0,
        revenue: 0,
        monthlyGrowth: [],
        userDistribution: [
          { name: 'Admins', value: 0 },
          { name: 'Organizers', value: 0 },
          { name: 'Players', value: 0 }
        ],
        recentActivities: []
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, trend }) => (
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
            {trend && (
              <Typography variant="caption" color={trend > 0 ? 'success.main' : 'error.main'}>
                {trend > 0 ? '+' : ''}{trend}% from last month
              </Typography>
            )}
          </Box>
          <Box sx={{ bgcolor: color, borderRadius: 2, p: 1.5 }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Loading dashboard...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>
      <Typography variant="body1" color="textSecondary" paragraph>
        Welcome back, {user?.name}! Here's an overview of the platform.
      </Typography>

      {/* Stats Grid */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={<People sx={{ color: 'white' }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Active Tournaments"
            value={stats.activeTournaments}
            icon={<EmojiEvents sx={{ color: 'white' }} />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Matches"
            value={stats.totalMatches}
            icon={<SportsTennis sx={{ color: 'white' }} />}
            color="#9c27b0"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenue"
            value={`$${stats.revenue.toLocaleString()}`}
            icon={<AttachMoney sx={{ color: 'white' }} />}
            color="#2e7d32"
          />
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Platform Growth
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.monthlyGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="matches" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              User Distribution
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.userDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.userDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Recent Activities */}
      <Typography variant="h5" gutterBottom>
        Recent Activities
      </Typography>
      <Paper sx={{ width: '100%', overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Activity</TableCell>
              <TableCell>User</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {stats.recentActivities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No recent activities
                </TableCell>
              </TableRow>
            ) : (
              stats.recentActivities.map((activity, index) => (
                <TableRow key={index}>
                  <TableCell>{activity.description}</TableCell>
                  <TableCell>{activity.user}</TableCell>
                  <TableCell>{new Date(activity.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    <Chip
                      label={activity.status}
                      size="small"
                      color={activity.status === 'success' ? 'success' : 'warning'}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Quick Actions */}
      <Grid container spacing={2} sx={{ mt: 3 }}>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<People />}
            sx={{ py: 2 }}
            href="/admin/users"
          >
            Manage Users
          </Button>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<EmojiEvents />}
            sx={{ py: 2 }}
            href="/organizer/tournaments/create"
          >
            Create Tournament
          </Button>
        </Grid>
        <Grid item xs={12} md={4}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<Warning />}
            sx={{ py: 2 }}
            href="/admin/reports"
          >
            View Reports
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;