import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Avatar,
  TextField,
  Button,
  Grid,
  Chip,
  Divider,
  Alert,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import BadgeIcon from '@mui/icons-material/Badge';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import PeopleIcon from '@mui/icons-material/People';
import toast from 'react-hot-toast';
import tournamentService from '../../services/tournamentService';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalTournaments: 0,
    activeTournaments: 0,
    totalPlayers: 0,
    totalMatches: 0
  });
  const [formData, setFormData] = useState({
    firstname: '',
    middlename: '',
    lastname: '',
    //skillLevel: '',
    phoneNumber: ''
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.firstname || '',
        middlename: user.middlename || '',
        lastname: user.lastname || '',
        skillLevel: user.skillLevel || 'Intermediate',
        phoneNumber: user.phoneNumber || ''
      });
      fetchOrganizerStats();
    }
  }, [user]);

  const fetchOrganizerStats = async () => {
    try {
      const tournaments = await tournamentService.getMyTournaments();
      const active = tournaments.filter(t => t.status === 'in-progress').length;
      const totalPlayers = tournaments.reduce((sum, t) => sum + (t.currentPlayers || 0), 0);
      const totalMatches = tournaments.reduce((sum, t) => sum + (t.matches?.length || 0), 0);
      
      setStats({
        totalTournaments: tournaments.length,
        activeTournaments: active,
        totalPlayers: totalPlayers,
        totalMatches: totalMatches
      });
    } catch (error) {
      console.error('Error fetching organizer stats:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updateData = {
        firstnamename: formData.firstname,
        middlenamename: formData.middlename,
        lastnamename: formData.lastname,
        //skillLevel: formData.skillLevel,
        phoneNumber: formData.phoneNumber
      };
      
      const success = await updateProfile(updateData);
      if (success) {
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (error) {
      console.error('Update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstname: user?.firstname || '',
      middlename: user?.middlename || '',
      lastname: user?.lastname || '',
      //skillLevel: user?.skillLevel || 'Intermediate',
      phoneNumber: user?.phoneNumber || ''
    });
    setIsEditing(false);
  };

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];

  if (!user) {
    return (
      <Container sx={{ mt: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <LinearProgress />
          <Typography sx={{ mt: 2 }}>Loading profile...</Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Profile Information Section */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Box position="relative" display="inline-block">
              <Avatar
                sx={{
                  width: 120,
                  height: 120,
                  bgcolor: 'primary.main',
                  fontSize: 48,
                  margin: '0 auto',
                  mb: 2
                }}
              >
                {user.firstname?.charAt(0).toUpperCase() || 'O'}
              </Avatar>
              {isEditing && (
                <IconButton
                  sx={{
                    position: 'absolute',
                    bottom: 10,
                    right: 10,
                    bgcolor: 'background.paper',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                  size="small"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
            
            <Typography variant="h5" gutterBottom>
              {user.firstname + " " +user.lastname}
            </Typography>
            <Chip
              label={`Role: ${user.role || 'organizer'}`}
              size="small"
              color="primary"
              sx={{ mb: 1 }}
            />
            {/* <Chip
              label={`Skill: ${user.skillLevel || 'Intermediate'}`}
              size="small"
              variant="outlined"
              sx={{ mb: 2 }}
            /> */}
            
            <Divider sx={{ my: 2 }} />
            
            <Box textAlign="left">
              <Box display="flex" alignItems="center" gap={1} mb={1}>
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2">{user.email}</Typography>
              </Box>
              {user.phoneNumber && (
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2">{user.phoneNumber}</Typography>
                </Box>
              )}
              {user.createdAt && (
                <Box display="flex" alignItems="center" gap={1}>
                  <CalendarTodayIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                  </Typography>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Stats and Edit Section */}
        <Grid item xs={12} md={8}>
          {/* Stats Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <EmojiEventsIcon color="primary" sx={{ fontSize: 40 }} />
                  <Typography variant="h4">{stats.totalTournaments}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Tournaments
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <EmojiEventsIcon color="warning" sx={{ fontSize: 40 }} />
                  <Typography variant="h4">{stats.activeTournaments}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Active
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <PeopleIcon color="secondary" sx={{ fontSize: 40 }} />
                  <Typography variant="h4">{stats.totalPlayers}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Total Players
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <VisibilityIcon color="info" sx={{ fontSize: 40 }} />
                  <Typography variant="h4">{stats.totalMatches}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Matches
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Edit Profile Form */}
          <Paper sx={{ p: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5">
                Profile Information
              </Typography>
              {!isEditing ? (
                <Button
                  startIcon={<EditIcon />}
                  variant="outlined"
                  onClick={() => setIsEditing(true)}
                >
                  Edit Profile
                </Button>
              ) : (
                <Box>
                  <Button
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    sx={{ mr: 1 }}
                    disabled={loading}
                  >
                    Cancel
                  </Button>
                  <Button
                    startIcon={<SaveIcon />}
                    variant="contained"
                    onClick={handleSave}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </Box>
              )}
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Firs Name"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  InputProps={{
                    startAdornment: (
                      <BadgeIcon color="action" sx={{ mr: 1 }} />
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Middle Name"
                  name="middlename"
                  value={formData.middlename}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  InputProps={{
                    startAdornment: (
                      <BadgeIcon color="action" sx={{ mr: 1 }} />
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  disabled={!isEditing}
                  required
                  InputProps={{
                    startAdornment: (
                      <BadgeIcon color="action" sx={{ mr: 1 }} />
                    ),
                  }}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  value={user.email || ''}
                  disabled
                  helperText="Email cannot be changed"
                  InputProps={{
                    startAdornment: (
                      <EmailIcon color="action" sx={{ mr: 1 }} />
                    ),
                  }}
                />
              </Grid>

              {/* <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  select
                  label="Skill Level"
                  name="skillLevel"
                  value={formData.skillLevel}
                  onChange={handleChange}
                  disabled={!isEditing}
                >
                  {skillLevels.map(level => (
                    <MenuItem key={level} value={level}>
                      {level}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid> */}

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Optional"
                  InputProps={{
                    startAdornment: (
                      <PhoneIcon color="action" sx={{ mr: 1 }} />
                    ),
                  }}
                />
              </Grid>
            </Grid>

            {!isEditing && (
              <Alert severity="info" sx={{ mt: 3 }}>
                Click the "Edit Profile" button to update your information.
              </Alert>
            )}
          </Paper>

          {/* Organizer Tips */}
          <Paper sx={{ p: 3, mt: 3, bgcolor: '#e3f2fd' }}>
            <Typography variant="h6" gutterBottom>
               Organizer Tips
            </Typography>
            <Typography variant="body2" paragraph>
              • Create tournaments in advance to allow players time to register
            </Typography>
            <Typography variant="body2" paragraph>
              • Use the bracket generator to automatically create match schedules
            </Typography>
            <Typography variant="body2" paragraph>
              • Update match scores in real-time to keep players informed
            </Typography>
            <Typography variant="body2">
              • Monitor queue status for quick play courts to ensure smooth gameplay
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Profile;