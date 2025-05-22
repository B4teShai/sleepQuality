import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  Button,
  Alert,
  InputLabel,
  FormControl,
  FormHelperText,
  Chip,
  CircularProgress,
  Stack
} from '@mui/material';
import NightsStayIcon from '@mui/icons-material/NightsStay';

export default function App() {
  const [form, setForm] = useState({
    Age: '', Gender: 0, Physical_Activity_Level: '', Stress_Level: '',
    Sleep_Duration: '', Heart_Rate: '', Daily_Steps: '', Sleep_Disorder: 0
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const validateForm = () => {
    const errors = [];
    if (form.Age < 0 || form.Age > 100) errors.push('Age must be between 0 and 100');
    if (form.Physical_Activity_Level < 0 || form.Physical_Activity_Level > 10) 
      errors.push('Physical Activity Level must be between 0 and 10');
    if (form.Stress_Level < 0 || form.Stress_Level > 10) 
      errors.push('Stress Level must be between 0 and 10');
    if (form.Sleep_Duration < 0 || form.Sleep_Duration > 24) 
      errors.push('Sleep Duration must be between 0 and 24 hours');
    if (form.Heart_Rate < 30 || form.Heart_Rate > 200) 
      errors.push('Heart Rate must be between 30 and 200');
    if (form.Daily_Steps < 0 || form.Daily_Steps > 50000) 
      errors.push('Daily Steps must be between 0 and 50000');
    
    return errors;
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors.join(', '));
      return;
    }

    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          Age: Number(form.Age),
          Gender: Number(form.Gender),
          Physical_Activity_Level: Number(form.Physical_Activity_Level),
          Stress_Level: Number(form.Stress_Level),
          Sleep_Duration: Number(form.Sleep_Duration),
          Heart_Rate: Number(form.Heart_Rate),
          Daily_Steps: Number(form.Daily_Steps),
          Sleep_Disorder: Number(form.Sleep_Disorder),
        })
      });

      if (!response.ok) {
        throw new Error('Server error occurred');
      }

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setError(error.message || 'An error occurred while processing your request');
    } finally {
      setLoading(false);
    }
  };

  // Helper for badge color
  const getQualityColor = (quality) => {
    if (!quality) return 'default';
    if (quality.toLowerCase().includes('good')) return 'success';
    if (quality.toLowerCase().includes('poor')) return 'error';
    return 'warning';
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'linear-gradient(120deg, #e0eafc 0%, #cfdef3 100%)', pb: 4 }}>
      <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ pt: 5, pb: 2 }}>
        <NightsStayIcon sx={{ fontSize: 38, color: '#1976d2' }} />
        <Typography variant="h4" fontWeight={700} color="primary.dark">
          Sleep Quality Predictor
        </Typography>
      </Stack>
      <Card className="glass-card animate-pop" sx={{ maxWidth: 700, mx: 'auto', mt: 2, p: 2, borderRadius: 5, boxShadow: 8, background: 'transparent' }}>
        <CardContent sx={{ background: 'transparent' }}>
          <Typography variant="h6" align="center" gutterBottom fontWeight={600}>
            Enter Your Details
          </Typography>
          <Box component="form" onSubmit={handleSubmit} autoComplete="off" sx={{ mt: 2 }}>
            <Stack spacing={2}>
              <TextField
                label="Age"
                name="Age"
                type="number"
                inputProps={{ min: 0, max: 100 }}
                value={form.Age}
                onChange={handleChange}
                required
                helperText="0-100"
              />
              <FormControl>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  name="Gender"
                  value={form.Gender}
                  label="Gender"
                  onChange={handleChange}
                >
                  <MenuItem value={0}>Male</MenuItem>
                  <MenuItem value={1}>Female</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Physical Activity Level"
                name="Physical_Activity_Level"
                type="number"
                inputProps={{ min: 0, max: 10 }}
                value={form.Physical_Activity_Level}
                onChange={handleChange}
                required
                helperText="0 = none, 10 = very active"
              />
              <TextField
                label="Stress Level"
                name="Stress_Level"
                type="number"
                inputProps={{ min: 0, max: 10 }}
                value={form.Stress_Level}
                onChange={handleChange}
                required
                helperText="0 = none, 10 = very high"
              />
              <TextField
                label="Sleep Duration (hours)"
                name="Sleep_Duration"
                type="number"
                inputProps={{ min: 0, max: 24, step: 0.1 }}
                value={form.Sleep_Duration}
                onChange={handleChange}
                required
                helperText="0-24"
              />
              <TextField
                label="Heart Rate (bpm)"
                name="Heart_Rate"
                type="number"
                inputProps={{ min: 30, max: 200 }}
                value={form.Heart_Rate}
                onChange={handleChange}
                required
                helperText="30-200 bpm"
              />
              <TextField
                label="Daily Steps"
                name="Daily_Steps"
                type="number"
                inputProps={{ min: 0, max: 50000 }}
                value={form.Daily_Steps}
                onChange={handleChange}
                required
                helperText="0-50000"
              />
              <FormControl>
                <InputLabel id="sleep-disorder-label">Sleep Disorder</InputLabel>
                <Select
                  labelId="sleep-disorder-label"
                  name="Sleep_Disorder"
                  value={form.Sleep_Disorder}
                  label="Sleep Disorder"
                  onChange={handleChange}
                >
                  <MenuItem value={0}>None</MenuItem>
                  <MenuItem value={1}>Insomnia</MenuItem>
                  <MenuItem value={2}>Sleep Apnea</MenuItem>
                </Select>
                <FormHelperText>Choose if you have a diagnosed disorder</FormHelperText>
              </FormControl>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                sx={{ mt: 1, fontWeight: 600 }}
                startIcon={loading && <CircularProgress size={20} color="inherit" />}
              >
                {loading ? 'Predicting...' : 'Predict Sleep Quality'}
              </Button>
              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          </Box>
        </CardContent>
      </Card>
      {result && !error && (
        <Card className="glass-card animate-pop" sx={{ maxWidth: 430, mx: 'auto', mt: 4, p: 2, borderRadius: 5, boxShadow: 8, background: 'transparent' }}>
          <CardContent sx={{ textAlign: 'center', background: 'transparent' }}>
            <Typography variant="h6" gutterBottom>Prediction Results</Typography>
            <Chip
              label={result.quality}
              color={getQualityColor(result.quality)}
              size="medium"
              sx={{ fontSize: '1.1rem', fontWeight: 600, mb: 1, px: 2, py: 1 }}
            />
            <Typography variant="body1" sx={{ mt: 1 }}>
              Confidence: <b>{result.probability}%</b>
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
} 