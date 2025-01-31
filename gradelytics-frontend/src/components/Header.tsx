import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Box,
  Switch,
  Badge,
  Avatar,
  Button,
} from '@mui/material';
import {
  Search,
  AccountCircle,
  Notifications,
  Calculate,
  Timeline,
} from '@mui/icons-material';
import ProfileSidebar from './ProfileSidebar';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

const Header:React.FC<HeaderProps> = ({ darkMode, setDarkMode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          background: darkMode 
            ? 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          borderBottom: '1px solid',
          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar sx={{ height: 80, px: { xs: 2, md: 4 } }}>
          {/* Left Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px'
              }}
            >
              Gradelytics
            </Typography>
            
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button 
                startIcon={<Calculate />}
                sx={{ 
                  borderRadius: '12px',
                  textTransform: 'none',
                  px: 2,
                  color: darkMode ? 'white' : 'text.primary',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  }
                }}
              >
                GPA Calculator
              </Button>
              <Button 
                startIcon={<Timeline />}
                sx={{ 
                  borderRadius: '12px',
                  textTransform: 'none',
                  px: 2,
                  color: darkMode ? 'white' : 'text.primary',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  }
                }}
              >
                CGPA Calculator
              </Button>
            </Box>
          </Box>

          {/* Center Section */}
          <Box sx={{ 
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            px: { xs: 2, md: 4 }
          }}>
            <Box sx={{ 
              maxWidth: '400px',
              width: '100%',
              backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
              borderRadius: '16px',
              padding: '8px 16px',
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
              }
            }}>
              <Search sx={{ color: darkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }} />
              <InputBase 
                placeholder="Search calculations..."
                sx={{ 
                  ml: 1.5,
                  flex: 1,
                  color: 'inherit',
                  '& input::placeholder': {
                    color: darkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
                    opacity: 1
                  }
                }}
              />
            </Box>
          </Box>

          {/* Right Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton 
              sx={{ 
                borderRadius: '12px',
                backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                }
              }}
            >
              <Badge 
                badgeContent={3} 
                color="error"
                sx={{
                  '& .MuiBadge-badge': {
                    backgroundColor: '#FF4B4B',
                  }
                }}
              >
                <Notifications sx={{ color: darkMode ? 'white' : 'text.primary' }} />
              </Badge>
            </IconButton>
            
            <Switch 
              checked={darkMode} 
              onChange={(e) => setDarkMode(e.target.checked)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#2196F3',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: '#2196F3',
                },
              }}
            />
            
            <IconButton 
              onClick={() => setSidebarOpen(true)}
              sx={{ 
                borderRadius: '12px',
                padding: '6px',
                backgroundColor: darkMode ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                '&:hover': {
                  backgroundColor: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                }
              }}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32,
                  backgroundColor: '#2196F3',
                }}
              >
                <AccountCircle />
              </Avatar>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      <Toolbar sx={{ height: 80 }} /> {/* Spacing */}

      <ProfileSidebar 
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        darkMode={darkMode}
      />
    </>
  );
};

export default Header;