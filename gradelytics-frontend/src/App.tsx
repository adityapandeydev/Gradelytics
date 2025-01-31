import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Typography } from '@mui/material';
import Header from './components/Header';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#2196F3',
        light: '#64B5F6',
        dark: '#1976D2',
      },
      secondary: {
        main: '#FF4B4B',
      },
      background: {
        default: darkMode 
          ? '#1A2035' // Dark blue-gray
          : '#F0F7FF', // Very light blue
        paper: darkMode 
          ? '#232B45' // Slightly lighter blue-gray
          : '#FFFFFF',
      },
      text: {
        primary: darkMode ? '#FFFFFF' : '#1A2035',
        secondary: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(26,32,53,0.7)',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: darkMode 
              ? '#232B45' // Match with paper color
              : '#FFFFFF',
          },
        },
      },
    },
  }), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box 
        sx={{ 
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />
        <Box 
          sx={{ 
            mt: 8, 
            p: 3,
          }}
        >
          <Typography 
            variant="h4" 
            sx={{ 
              fontWeight: 800,
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Welcome to Gradelytics
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: 'text.secondary',
              maxWidth: 600,
            }}
          >
            Your intelligent companion for academic performance tracking and grade analysis
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;