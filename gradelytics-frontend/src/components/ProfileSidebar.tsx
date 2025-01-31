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
  ListItemIcon,
  ListItemText,
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
      sx={{
        '& .MuiDrawer-paper': {
          width: 280,
          background: darkMode 
            ? 'linear-gradient(145deg, #283E51 0%, #4B79A1 100%)'
            : 'linear-gradient(145deg, #F0F7FF 0%, #FFFFFF 100%)',
          p: 3,
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Profile Section */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 2,
          mb: 3,
        }}>
          <Avatar 
            sx={{ 
              width: 48, 
              height: 48,
              bgcolor: '#2196F3',
            }}
          >
            <AccountCircle />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              John Doe
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              john.doe@example.com
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Menu Items */}
        <List sx={{ flex: 1 }}>
          {menuItems.map((item, index) => (
            <ListItem 
              key={index}
              sx={{ 
                mb: 1,
                borderRadius: 2,
                backgroundColor: item.primary 
                  ? (darkMode ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.08)')
                  : 'transparent',
              }}
            >
              <ListItemIcon sx={{ 
                color: item.primary ? '#2196F3' : 'inherit',
                minWidth: 40,
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{ 
                  color: item.primary ? '#2196F3' : 'inherit',
                }}
              />
            </ListItem>
          ))}
        </List>

        {/* Logout Button */}
        <Button
          startIcon={<Logout />}
          fullWidth
          sx={{
            borderRadius: 2,
            p: 1.5,
            justifyContent: 'flex-start',
            color: '#FF4B4B',
            '&:hover': {
              backgroundColor: 'rgba(255,75,75,0.1)',
            }
          }}
        >
          Logout
        </Button>
      </Box>
    </Drawer>
  );
};

export default ProfileSidebar; 