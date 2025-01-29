import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  InputBase,
  Box,
  Drawer,
  List,
  ListItem,
  Switch,
  Badge,
} from '@mui/material';
import {
  Search,
  AccountCircle,
  Notifications,
  Settings,
  Help,
  Feedback,
  Logout,
} from '@mui/icons-material';

interface HeaderProps {
  darkMode: boolean;
  setDarkMode: (darkMode: boolean) => void;
}

const Header = ({ darkMode, setDarkMode }: HeaderProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  return (
    <>
      <AppBar position="fixed">
        <Toolbar sx={{ justifyContent: 'space-between', height: 70, px: 2 }}>
          {/* Left Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Gradelytics</Typography>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 2 }}>
              <Typography sx={{ cursor: 'pointer' }}>GPA Calculator</Typography>
              <Typography sx={{ cursor: 'pointer' }}>CGPA Calculator</Typography>
            </Box>
          </Box>

          {/* Center Section */}
          <Box sx={{ 
            backgroundColor: 'background.paper',
            borderRadius: 1,
            padding: '4px 8px',
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            width: '300px'
          }}>
            <Search />
            <InputBase 
              placeholder="Search calculations..."
              sx={{ ml: 1, flex: 1, color: 'inherit' }}
            />
          </Box>

          {/* Right Section */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton color="inherit">
              <Badge badgeContent={3} color="secondary">
                <Notifications />
              </Badge>
            </IconButton>
            <Switch 
              checked={darkMode} 
              onChange={(e) => setDarkMode(e.target.checked)}
              color="default"
            />
            <IconButton color="inherit" onClick={() => setSidebarOpen(true)}>
              <AccountCircle />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Add toolbar spacing */}
      <Toolbar />

      {/* Profile Sidebar */}
      <Drawer
        anchor="right"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      >
        <Box sx={{ width: 300, padding: 2 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <AccountCircle sx={{ fontSize: 64 }} />
            <Typography variant="h6">User Name</Typography>
            <Typography variant="body2">user@email.com</Typography>
          </Box>

          <List>
            {[
              { icon: <Settings />, text: 'Settings' },
              { icon: <Help />, text: 'Help & Support' },
              { icon: <Feedback />, text: 'Feedback' },
              { icon: <Logout />, text: 'Logout' },
            ].map((item, index) => (
              <ListItem key={index} sx={{ p: 0.5 }}>
                <IconButton sx={{ width: '100%', justifyContent: 'flex-start', gap: 1 }}>
                  {item.icon}
                  <Typography>{item.text}</Typography>
                </IconButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default Header;