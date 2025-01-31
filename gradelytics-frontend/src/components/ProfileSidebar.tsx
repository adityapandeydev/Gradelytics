import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  List,
  ListItem,
  Button,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Settings,
  Help,
  Feedback,
  Logout,
  AccountCircle,
  Person,
  School,
  Notifications,
} from '@mui/icons-material';

interface ProfileSidebarProps {
  open: boolean;
  onClose: () => void;
  darkMode: boolean;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({ open, onClose, darkMode }) => {
  const menuItems = [
    { icon: <Person />, text: 'Profile', primary: true },
    { icon: <School />, text: 'My Courses' },
    { icon: <Notifications />, text: 'Notifications' },
    { icon: <Settings />, text: 'Settings' },
    { icon: <Help />, text: 'Help & Support' },
    { icon: <Feedback />, text: 'Feedback' },
  ];

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 320,
          background: darkMode 
            ? 'linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%)'
            : 'linear-gradient(145deg, #f8f9fa 0%, #ffffff 100%)',
          borderLeft: 'none',
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header Section */}
        <Box 
          sx={{ 
            p: 3,
            background: darkMode 
              ? 'linear-gradient(145deg, #2196F3 0%, #21CBF3 100%)'
              : 'linear-gradient(145deg, #2196F3 0%, #21CBF3 100%)',
            color: 'white',
          }}
        >
          <Box sx={{ textAlign: 'center', mb: 2 }}>
            <Avatar 
              sx={{ 
                width: 80, 
                height: 80, 
                margin: '0 auto 16px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                border: '4px solid rgba(255,255,255,0.3)',
              }}
            >
              <AccountCircle sx={{ fontSize: 40 }} />
            </Avatar>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>John Doe</Typography>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              john.doe@university.edu
            </Typography>
          </Box>
        </Box>

        {/* Menu Items */}
        <Box sx={{ p: 2, flex: 1 }}>
          <List>
            {menuItems.map((item, index) => (
              <React.Fragment key={index}>
                <ListItem sx={{ p: 0.5 }}>
                  <Button
                    fullWidth
                    startIcon={item.icon}
                    sx={{
                      justifyContent: 'flex-start',
                      textTransform: 'none',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      color: item.primary ? '#2196F3' : (darkMode ? 'white' : '#1a1a1a'),
                      backgroundColor: item.primary 
                        ? (darkMode ? 'rgba(33, 150, 243, 0.1)' : 'rgba(33, 150, 243, 0.1)')
                        : 'transparent',
                      '&:hover': {
                        backgroundColor: darkMode 
                          ? 'rgba(255,255,255,0.05)' 
                          : 'rgba(0,0,0,0.04)',
                      }
                    }}
                  >
                    {item.text}
                  </Button>
                </ListItem>
                {index === 2 && (
                  <Divider sx={{ my: 1, borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }} />
                )}
              </React.Fragment>
            ))}
          </List>
        </Box>

        {/* Logout Button */}
        <Box sx={{ p: 2 }}>
          <Button
            fullWidth
            startIcon={<Logout />}
            sx={{
              justifyContent: 'flex-start',
              textTransform: 'none',
              borderRadius: '12px',
              padding: '12px 16px',
              color: darkMode ? '#FF4B4B' : '#FF4B4B',
              '&:hover': {
                backgroundColor: 'rgba(255,75,75,0.1)',
              }
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ProfileSidebar; 