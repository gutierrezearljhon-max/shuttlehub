import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Typography,
  Divider,
  Avatar
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import QueueIcon from '@mui/icons-material/Queue';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutButton from './LogoutButton';

const DRAWER_WIDTH = 280;

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin' },
          { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
          { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
          { text: 'Reports', icon: <EmojiEventsIcon />, path: '/admin/reports' }
        ];
      case 'organizer':
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/organizer' },
          { text: 'Tournaments', icon: <EmojiEventsIcon />, path: '/organizer/tournaments' },
          { text: 'Matches', icon: <SportsTennisIcon />, path: '/organizer/matches' },
          { text: 'Courts', icon: <SportsTennisIcon />, path: '/organizer/courts' }
        ];
      default:
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/player' },
          { text: 'Matches', icon: <SportsTennisIcon />, path: '/player/matches' },
          { text: 'Tournaments', icon: <EmojiEventsIcon />, path: '/player/tournaments' },
          { text: 'Quick Play', icon: <QueueIcon />, path: '/player/quick-play' },
          { text: 'Stats', icon: <PersonIcon />, path: '/player/stats' },
          { text: 'Profile', icon: <PersonIcon />, path: '/player/profile' }
        ];
    }
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: DRAWER_WIDTH,
          boxSizing: 'border-box',
          bgcolor: 'background.paper',
          borderRight: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          flexDirection: 'column'
        },
      }}
    >
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            margin: '0 auto',
            bgcolor: 'primary.main',
            mb: 2
          }}
        >
          {user?.name?.charAt(0).toUpperCase()}
        </Avatar>
        <Typography variant="h6">{user?.name}</Typography>
        <Typography variant="body2" color="textSecondary">
          {user?.role.toUpperCase()}
        </Typography>
      </Box>
      
      <Divider />
      
      <List sx={{ flex: 1 }}>
        {getNavItems().map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => navigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              mx: 1,
              borderRadius: 1,
              '&.Mui-selected': {
                bgcolor: 'primary.light',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.main',
                },
                '& .MuiListItemIcon-root': {
                  color: 'white',
                },
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
      
      <Divider />
      
      <Box sx={{ p: 2 }}>
        <LogoutButton fullWidth variant="outlined" />
      </Box>
    </Drawer>
  );
};

export default Sidebar;