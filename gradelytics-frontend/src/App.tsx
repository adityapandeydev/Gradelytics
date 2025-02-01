import React, { useState, useMemo, useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Typography } from '@mui/material';
import { supabase } from './config/supabase';
import Header from './components/Header';
import GpaCalculator from './components/GpaCalculator';
import CgpaCalculator from './components/CgpaCalculator';
import Login from './components/Login';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';

type Page = 'home' | 'gpa' | 'cgpa'; // Type alias for the union type

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>('home'); // Use the type alias
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

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
          ? '#283E51' // Dark mode background
          : '#F0F7FF', // Light mode background
        paper: darkMode 
          ? '#1e2c3a' // Darker variant used in header
          : '#FFFFFF', // Light mode paper color
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

  if (!session) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Login />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/gpa" element={<GpaCalculator />} />
          <Route path="/cgpa" element={<CgpaCalculator />} />
          <Route path="/login" element={<Login />} />
          {/* Add other routes as needed */}
        </Routes>
      </Router>
      <Box 
        sx={{ 
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
          overflow: 'hidden',
        }}
      >
        <Header 
          darkMode={darkMode} 
          setDarkMode={setDarkMode}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          session={session}
        />
        
        {currentPage === 'home' && (
          <Box 
            sx={{ 
              mt: { xs: 2, sm: 4, md: 8 }, 
              p: { xs: 2, sm: 3 },
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            <Typography 
              variant="h4" 
              sx={{ 
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
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
                fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
                color: 'text.secondary',
                maxWidth: 600,
                mx: { xs: 'auto', md: 0 },
              }}
            >
              Your intelligent companion for academic performance tracking and grade analysis
            </Typography>
          </Box>
        )}
        
        {currentPage === 'gpa' && <GpaCalculator />}
        {currentPage === 'cgpa' && <CgpaCalculator />}
      </Box>
    </ThemeProvider>
  );
}

export default App;