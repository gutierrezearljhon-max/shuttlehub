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
  Alert
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import authService from '../../services/authService';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

const Profile = () => {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstname: '',
    middlename: '',
    lastname: '',
    // skillLevel: '',
    phoneNumber: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstname: user.firstname || '',
        middlename: user.middlename || '',
        lastname: user.lastname || '',
        // skillLevel: user.skillLevel || 'Intermediate',
        phoneNumber: user.phoneNumber || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
    }
    setLoading(false);
  };

  const skillLevels = ['Beginner', 'Intermediate', 'Advanced', 'Professional'];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
          <Typography variant="h4">
            My Profile
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
                onClick={() => setIsEditing(false)}
                sx={{ mr: 1 }}
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

        <Box display="flex" justifyContent="center" mb={4}>
          <Avatar
            sx={{
              width: 120,
              height: 120,
              bgcolor: 'primary.main',
              fontSize: 48
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="First Name"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              disabled={!isEditing}
            />
            
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Middle Name"
              name="middlename"
              value={formData.middlename}
              onChange={handleChange}
              disabled={!isEditing}
            />
            
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              label="Last Name"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              disabled={!isEditing}
            />
            
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email"
              value={user?.email || ''}
              disabled
              helperText="Email cannot be changed"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              select
              label="Skill Level"
              name="skillLevel"
              value={formData.skillLevel}
              onChange={handleChange}
              disabled={!isEditing}
              SelectProps={{
                native: true
              }}
            >
              {skillLevels.map(level => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder="Optional"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
            <Box mt={2}>
              <Typography variant="subtitle2" color="textSecondary">
                Account Information
              </Typography>
              <Chip
                label={`Role: ${user?.role}`}
                size="small"
                color="primary"
                sx={{ mr: 1, mt: 1 }}
              />
              <Chip
                label={`Member since: ${new Date(user?.createdAt).toLocaleDateString()}`}
                size="small"
                variant="outlined"
                sx={{ mt: 1 }}
              />
            </Box>
          </Grid>
        </Grid>

        {!isEditing && (
          <Alert severity="info" sx={{ mt: 3 }}>
            Click the "Edit Profile" button to update your information.
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default Profile;