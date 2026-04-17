import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  MenuItem,
  Box,
  Stepper,
  Step,
  StepLabel,
  Alert,
  FormHelperText
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import tournamentService from '../../services/tournamentService';
import toast from 'react-hot-toast';

const validationSchema = Yup.object({
  name: Yup.string().required('Tournament name is required').min(3, 'Minimum 3 characters'),
  format: Yup.string().required('Format is required'),
  category: Yup.string().required('Category is required'),
  startDate: Yup.date().required('Start date is required').min(new Date(), 'Start date must be in future'),
  venue: Yup.string().required('Venue is required'),
  maxPlayers: Yup.number().required('Max players required').min(2, 'Minimum 2 players').max(128, 'Maximum 128 players'),
  entryFee: Yup.number().min(0, 'Entry fee cannot be negative'),
  prizePool: Yup.number().min(0, 'Prize pool cannot be negative'),
  description: Yup.string().max(500, 'Maximum 500 characters')
});

const CreateTournament = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  
  const steps = ['Basic Information', 'Tournament Settings', 'Review & Create'];

  const initialValues = {
    name: '',
    format: 'single-elimination',
    category: 'singles',
    startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    endDate: null,
    venue: '',
    maxPlayers: 16,
    entryFee: 0,
    prizePool: 0,
    description: ''
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    try {
      await tournamentService.createTournament(values);
      toast.success('Tournament created successfully!');
      navigate('/organizer/tournaments');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create tournament');
    } finally {
      setSubmitting(false);
    }
  };

  // format: {
  //   type: String,
  //   enum: ['single-elimination', 'round-robin', 'double-elimination', 'group-stage'],
  //   required: true
  // },
  // category: {
  //   type: String,
  //   enum: ["men-singles", "women-singles", "men-doubles", "women-doubles", "mixed-doubles"],
  //   required: true
  // },

  const formatOptions = [
    { value: 'single-elimination', label: 'Single Elimination' },
    { value: 'double-elimination', label: 'Double Elimination' },
    { value: 'round-robin', label: 'Round Robin' },
    { value: 'group-stage', label: 'Group Stage + Knockout' }
  ];

  const categoryOptions = [
    { value: 'men-singles', label: 'Men Singles' },
    { value: 'women-singles', label: 'Women Singles' },
    { value: 'men-doubles', label: 'Men Doubles' },
    { value: 'women-doubles', label: 'Women Doubles' },
    { value: 'mixed-doubles', label: 'Mixed Doubles' }
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom align="center">
          Create New Tournament
        </Typography>
        
        <Stepper activeStep={activeStep} sx={{ my: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue, isSubmitting, errors, touched }) => (
            <Form>
              {activeStep === 0 && (
                <Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="name"
                        label="Tournament Name"
                        value={values.name}
                        onChange={(e) => setFieldValue('name', e.target.value)}
                        error={touched.name && !!errors.name}
                        helperText={touched.name && errors.name}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        select
                        name="format"
                        label="Tournament Format"
                        value={values.format}
                        onChange={(e) => setFieldValue('format', e.target.value)}
                      >
                        {formatOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        select
                        name="category"
                        label="Category"
                        value={values.category}
                        onChange={(e) => setFieldValue('category', e.target.value)}
                      >
                        {categoryOptions.map(option => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        name="venue"
                        label="Venue"
                        value={values.venue}
                        onChange={(e) => setFieldValue('venue', e.target.value)}
                        error={touched.venue && !!errors.venue}
                        helperText={touched.venue && errors.venue}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                          label="Start Date & Time"
                          value={values.startDate}
                          onChange={(newValue) => setFieldValue('startDate', newValue)}
                          renderInput={(params) => (
                            <TextField {...params} fullWidth />
                          )}
                        />
                      </LocalizationProvider>
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(1)}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              )}

              {activeStep === 1 && (
                <Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        name="maxPlayers"
                        label="Maximum Players"
                        value={values.maxPlayers}
                        onChange={(e) => setFieldValue('maxPlayers', parseInt(e.target.value))}
                        error={touched.maxPlayers && !!errors.maxPlayers}
                        helperText={touched.maxPlayers && errors.maxPlayers}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        name="entryFee"
                        label="Entry Fee (Php)"
                        value={values.entryFee}
                        onChange={(e) => setFieldValue('entryFee', parseFloat(e.target.value))}
                        error={touched.entryFee && !!errors.entryFee}
                        helperText={touched.entryFee && errors.entryFee}
                      />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        type="number"
                        name="prizePool"
                        label="Prize Pool (Php)"
                        value={values.prizePool}
                        onChange={(e) => setFieldValue('prizePool', parseFloat(e.target.value))}
                        error={touched.prizePool && !!errors.prizePool}
                        helperText={touched.prizePool && errors.prizePool}
                      />
                    </Grid>
                    
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        multiline
                        rows={4}
                        name="description"
                        label="Tournament Description"
                        value={values.description}
                        onChange={(e) => setFieldValue('description', e.target.value)}
                      />
                    </Grid>
                  </Grid>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button onClick={() => setActiveStep(0)}>
                      Back
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => setActiveStep(2)}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              )}

              {activeStep === 2 && (
                <Box>
                  <Alert severity="info" sx={{ mb: 3 }}>
                    Please review the tournament details before creating
                  </Alert>
                  
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Tournament Name</Typography>
                      <Typography variant="body1">{values.name}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Format</Typography>
                      <Typography variant="body1">{values.format}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Category</Typography>
                      <Typography variant="body1">{values.category}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Start Date</Typography>
                      <Typography variant="body1">{new Date(values.startDate).toLocaleString()}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Venue</Typography>
                      <Typography variant="body1">{values.venue}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Max Players</Typography>
                      <Typography variant="body1">{values.maxPlayers}</Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">Entry Fee</Typography>
                      <Typography variant="body1">Php{values.entryFee}</Typography>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">Prize Pool</Typography>
                      <Typography variant="body1">Php{values.prizePool}</Typography>
                    </Grid>
                    
                    {values.description && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="textSecondary">Description</Typography>
                        <Typography variant="body1">{values.description}</Typography>
                      </Grid>
                    )}
                  </Grid>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                    <Button onClick={() => setActiveStep(1)}>
                      Back
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Creating...' : 'Create Tournament'}
                    </Button>
                  </Box>
                </Box>
              )}
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default CreateTournament;