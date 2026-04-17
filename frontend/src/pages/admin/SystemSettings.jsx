import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import toast from 'react-hot-toast';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'Badminton Sport Manager',
    contactEmail: 'admin@badminton.com',
    allowRegistration: true,
    requireEmailVerification: false,
    defaultMatchDuration: 15,
    maxQueueSize: 20,
    maintenanceMode: false
  });

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setSettings({
      ...settings,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSave = () => {
    // In production, this would save to backend
    toast.success('Settings saved successfully');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>

      <Paper sx={{ p: 4 }}>
        <Typography variant="h6" gutterBottom>
          General Settings
        </Typography>
        <TextField
          fullWidth
          label="Site Name"
          name="siteName"
          value={settings.siteName}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          label="Contact Email"
          name="contactEmail"
          type="email"
          value={settings.contactEmail}
          onChange={handleChange}
          margin="normal"
        />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Registration Settings
        </Typography>
        <FormControlLabel
          control={
            <Switch
              name="allowRegistration"
              checked={settings.allowRegistration}
              onChange={handleChange}
            />
          }
          label="Allow New Registrations"
        />
        <FormControlLabel
          control={
            <Switch
              name="requireEmailVerification"
              checked={settings.requireEmailVerification}
              onChange={handleChange}
            />
          }
          label="Require Email Verification"
        />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Game Settings
        </Typography>
        <TextField
          fullWidth
          type="number"
          label="Default Match Duration (minutes)"
          name="defaultMatchDuration"
          value={settings.defaultMatchDuration}
          onChange={handleChange}
          margin="normal"
        />
        <TextField
          fullWidth
          type="number"
          label="Maximum Queue Size"
          name="maxQueueSize"
          value={settings.maxQueueSize}
          onChange={handleChange}
          margin="normal"
        />

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" gutterBottom>
          Maintenance
        </Typography>
        <FormControlLabel
          control={
            <Switch
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
              color="error"
            />
          }
          label="Maintenance Mode"
        />
        {settings.maintenanceMode && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Maintenance mode is enabled. Only admins can access the site.
          </Alert>
        )}

        <Box mt={3}>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={handleSave}
            fullWidth
          >
            Save Settings
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default SystemSettings;