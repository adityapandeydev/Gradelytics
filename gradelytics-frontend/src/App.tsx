import React, { useState, useMemo } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Typography } from '@mui/material';
import Header from './components/Header';

const App: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);

  const theme = useMemo(() => createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
      background: {
        default: darkMode ? '#303030' : '#f5f5f5',
        paper: darkMode ? '#424242' : '#fff',
      },
    },
    components: {
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
  }), [darkMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
        minHeight: '100vh',
        bgcolor: 'background.default',
        color: 'text.primary',
      }}>
        <Header darkMode={darkMode} setDarkMode={setDarkMode} />
        <Box sx={{ mt: 8, p: 3 }}>
          <Typography variant="h4">Welcome to Gradelytics</Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default App;