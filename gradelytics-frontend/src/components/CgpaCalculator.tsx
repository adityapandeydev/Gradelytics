import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Fade,
  InputAdornment,
} from '@mui/material';
import { Calculate } from '@mui/icons-material';

const CgpaCalculator: React.FC = () => {
  const [formData, setFormData] = useState({
    creditsLastSem: '',
    cgpaLastSem: '',
    creditsThisSem: '',
    gpaThisSem: ''
  });
  const [cgpa, setCgpa] = useState<number | null>(null);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    const numValue = parseFloat(value);
    
    // Validation checks
    if (field === 'creditsLastSem' && numValue > 200) return;
    if (field === 'creditsThisSem' && numValue > 31) return;
    if ((field === 'cgpaLastSem' || field === 'gpaThisSem') && numValue > 10) return;
    
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateCGPA = (event: React.FormEvent) => {
    event.preventDefault();
    
    const creditsLastSem = parseFloat(formData.creditsLastSem);
    const cgpaLastSem = parseFloat(formData.cgpaLastSem);
    const creditsThisSem = parseFloat(formData.creditsThisSem);
    const gpaThisSem = parseFloat(formData.gpaThisSem);

    if (isNaN(creditsLastSem) || isNaN(cgpaLastSem) || 
        isNaN(creditsThisSem) || isNaN(gpaThisSem)) {
      alert('Please enter valid numerical values.');
      return;
    }

    const totalGradePoints = (creditsLastSem * cgpaLastSem) + (creditsThisSem * gpaThisSem);
    const totalCredits = creditsLastSem + creditsThisSem;
    const calculatedCGPA = totalGradePoints / totalCredits;

    setCgpa(Number(calculatedCGPA.toFixed(2)));
  };

  return (
    <Box sx={{ 
      p: { xs: 2, sm: 3 }, 
      maxWidth: { xs: '100%', sm: 600, md: 800 }, 
      margin: '0 auto' 
    }}>
      <Typography 
        variant="h4" 
        sx={{ 
          mb: { xs: 3, md: 4 }, 
          fontWeight: 700, 
          textAlign: 'center',
          fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
        }}
      >
        CGPA Calculator
      </Typography>

      <Paper 
        component="form" 
        onSubmit={calculateCGPA}
        elevation={0} 
        sx={{ 
          p: { xs: 2, sm: 3, md: 4 },
          borderRadius: 3,
          border: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
          '& input[type=number]': {
            '-moz-appearance': 'textfield',
            '&::-webkit-outer-spin-button, &::-webkit-inner-spin-button': {
              '-webkit-appearance': 'none',
              margin: 0,
            },
          },
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          gap: { xs: 2, sm: 3 }
        }}>
          <TextField
            label="Credits till Last Semester"
            value={formData.creditsLastSem}
            onChange={handleChange('creditsLastSem')}
            type="number"
            required
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end">max 200</InputAdornment>,
            }}
            inputProps={{ 
              step: "0.01",
              min: "0",
              max: "200"
            }}
          />

          <TextField
            label="CGPA till Last Semester"
            value={formData.cgpaLastSem}
            onChange={handleChange('cgpaLastSem')}
            type="number"
            required
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end">max 10</InputAdornment>,
            }}
            inputProps={{ 
              step: "0.01",
              min: "0",
              max: "10"
            }}
          />

          <TextField
            label="Credits this Semester"
            value={formData.creditsThisSem}
            onChange={handleChange('creditsThisSem')}
            type="number"
            required
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end">max 31</InputAdornment>,
            }}
            inputProps={{ 
              step: "0.01",
              min: "0",
              max: "31"
            }}
          />

          <TextField
            label="GPA this Semester"
            value={formData.gpaThisSem}
            onChange={handleChange('gpaThisSem')}
            type="number"
            required
            fullWidth
            InputProps={{
              endAdornment: <InputAdornment position="end">max 10</InputAdornment>,
            }}
            inputProps={{ 
              step: "0.01",
              min: "0",
              max: "10"
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            startIcon={<Calculate />}
            sx={{ 
              mt: { xs: 1, sm: 2 },
              py: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            }}
          >
            Calculate CGPA
          </Button>
        </Box>
      </Paper>

      <Fade in={cgpa !== null}>
        <Box sx={{ 
          mt: { xs: 3, md: 4 }, 
          textAlign: 'center',
          p: { xs: 2, sm: 3 },
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: theme => `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
        }}>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Your CGPA is: <span style={{ color: '#2196F3' }}>{cgpa}</span>
          </Typography>
        </Box>
      </Fade>
    </Box>
  );
};

export default CgpaCalculator;