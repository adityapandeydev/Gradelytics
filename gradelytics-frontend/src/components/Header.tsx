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
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Search,
  AccountCircle,
  Notifications,
  Calculate,
  Timeline,
  Menu as MenuIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import ProfileSidebar from './ProfileSidebar';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
  currentPage: 'home' | 'gpa' | 'cgpa';
  setCurrentPage: (page: 'home' | 'gpa' | 'cgpa') => void;
}

interface MobileNavigationProps {
  open: boolean;
  onClose: () => void;
  darkMode: boolean;
  currentPage: 'home' | 'gpa' | 'cgpa';
  setCurrentPage: (page: 'home' | 'gpa' | 'cgpa') => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({ 
  open, 
  onClose, 
  darkMode, 
  currentPage, 
  setCurrentPage 
}) => {
  const navigationItems = [
    { icon: <HomeIcon />, text: 'Home', value: 'home' },
    { icon: <Calculate />, text: 'GPA Calculator', value: 'gpa' },
    { icon: <Timeline />, text: 'CGPA Calculator', value: 'cgpa' },
  ];

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': {
          width: 280,
          background: darkMode 
            ? 'linear-gradient(145deg, #283E51 0%, #4B79A1 100%)'
            : 'linear-gradient(145deg, #F0F7FF 0%, #FFFFFF 100%)',
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2,
            fontWeight: 700,
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Gradelytics
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <List>
          {navigationItems.map((item) => (
            <ListItem 
              key={item.value}
              onClick={() => {
                setCurrentPage(item.value as 'home' | 'gpa' | 'cgpa');
                onClose();
              }}
              sx={{
                borderRadius: 2,
                mb: 1,
                backgroundColor: currentPage === item.value 
                  ? (darkMode ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.08)')
                  : 'transparent',
              }}
            >
              <ListItemIcon sx={{ 
                color: currentPage === item.value ? '#2196F3' : 'inherit',
                minWidth: 40,
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                sx={{ 
                  color: currentPage === item.value ? '#2196F3' : 'inherit',
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
};

const Header: React.FC<HeaderProps> = ({ darkMode, setDarkMode, currentPage, setCurrentPage }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  
  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{
          background: darkMode 
            ? 'linear-gradient(145deg, #1e2c3a 0%, #3a5d7c 100%)'
            : 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
          borderBottom: '1px solid',
          borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar sx={{ height: { xs: 64, md: 80 }, px: { xs: 2, md: 4 } }}>
          {/* Left Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 3 } }}>
            <IconButton
              onClick={() => setMobileNavOpen(true)}
              sx={{ 
                display: { xs: 'flex', md: 'none' },
                color: darkMode ? 'white' : 'text.primary',
              }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography 
              variant="h5" 
              sx={{ 
                fontSize: { xs: '1.25rem', md: '1.5rem' },
                fontWeight: 800,
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
                cursor: 'pointer'
              }}
              onClick={() => setCurrentPage('home')}
            >
              Gradelytics
            </Typography>
            
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              <Button 
                startIcon={<Calculate />}
                onClick={() => setCurrentPage('gpa')}
                sx={{ 
                  borderRadius: '12px',
                  textTransform: 'none',
                  px: 2,
                  color: currentPage === 'gpa' ? '#2196F3' : (darkMode ? 'white' : 'text.primary'),
                  backgroundColor: currentPage === 'gpa' 
                    ? (darkMode ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.08)')
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  }
                }}
              >
                GPA Calculator
              </Button>
              <Button 
                startIcon={<Timeline />}
                onClick={() => setCurrentPage('cgpa')}
                sx={{ 
                  borderRadius: '12px',
                  textTransform: 'none',
                  px: 2,
                  color: currentPage === 'cgpa' ? '#2196F3' : (darkMode ? 'white' : 'text.primary'),
                  backgroundColor: currentPage === 'cgpa'
                    ? (darkMode ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.08)')
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                  }
                }}
              >
                CGPA Calculator
              </Button>
            </Box>
          </Box>

          {/* Center Section - Hide on mobile */}
          <Box sx={{ 
            flex: 1,
            display: { xs: 'none', md: 'flex' },
            justifyContent: 'center',
            px: 4
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
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: { xs: 1, md: 2 },
            ml: { xs: 'auto', md: 0 }
          }}>
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

      <MobileNavigation 
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        darkMode={darkMode}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      
      <Toolbar sx={{ height: { xs: 64, md: 80 } }} />
      <ProfileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} darkMode={darkMode} />
    </>
  );
};

export default Header;