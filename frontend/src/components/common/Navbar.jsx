import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Avatar,
  Menu,
  MenuItem,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  useTheme,
  Divider
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SportsTennis from '@mui/icons-material/SportsTennis';
import QueueIcon from '@mui/icons-material/Queue';
import PersonIcon from '@mui/icons-material/Person';
import PeopleIcon from '@mui/icons-material/People';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import LogoutButton from './LogoutButton';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const getDashboardLink = () => {
    switch (user?.role) {
      case 'admin':
        return '/admin';
      case 'organizer':
        return '/organizer';
      default:
        return '/player';
    }
  };

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
          { text: 'Matches', icon: <SportsTennis />, path: '/organizer/matches' },
          { text: 'Courts', icon: <SportsTennisIcon />, path: '/organizer/courts' }
        ];
      default:
        return [
          { text: 'Dashboard', icon: <DashboardIcon />, path: '/player' },
          { text: 'Matches', icon: <SportsTennis />, path: '/player/matches' },
          { text: 'Tournaments', icon: <EmojiEventsIcon />, path: '/player/tournaments' },
          { text: 'Quick Play', icon: <QueueIcon />, path: '/player/quick-play' },
          { text: 'Stats', icon: <PersonIcon />, path: '/player/stats' }
        ];
    }
  };

  const drawer = (
    <Box>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
        <SportsTennisIcon color="primary" />
        <Typography variant="h6">Badminton Manager</Typography>
      </Box>
      <Divider />
      <List>
        {getNavItems().map((item) => (
          <ListItem
            button
            key={item.text}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            selected={location.pathname === item.path}
            sx={{
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
    </Box>
  );

  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <SportsTennisIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Badminton Sport Manager
          </Typography>
          
          {user && (
            <Box display="flex" alignItems="center" gap={2}>
              {!isMobile && (
                <Typography variant="body2">
                  {user.role.toUpperCase()}
                </Typography>
              )}
              <IconButton onClick={handleMenu} color="inherit">
                <Avatar sx={{ bgcolor: 'secondary.main' }}>
                  {user.name?.charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={() => {
                  handleClose();
                  navigate(`${getDashboardLink()}/profile`);
                }}>
                  <ListItemIcon>
                    <PersonIcon fontSize="small" />
                  </ListItemIcon>
                  Profile
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleClose}>
                  <LogoutButton size="small" variant="text" showIcon={true} />
                </MenuItem>
              </Menu>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { width: 280 }
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export default Navbar;