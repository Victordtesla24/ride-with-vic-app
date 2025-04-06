import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  Tooltip,
  Badge,
  Container,
  useTheme,
  alpha,
  Fade,
  Paper
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import CalculateIcon from '@mui/icons-material/Calculate';
import HistoryIcon from '@mui/icons-material/History';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import TeslaIcon from '@mui/icons-material/ElectricCar';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';

// Import mock data for user profile
import { userProfile } from 'lib/mockData';

export default function Layout({ children, themeContext }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileMenu, setProfileMenu] = useState(null);
  const [notificationMenu, setNotificationMenu] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [userData, setUserData] = useState(userProfile);
  
  const router = useRouter();
  const theme = useTheme();
  const { darkMode, toggleTheme } = themeContext || {};
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Navigation menu items
  const menuItems = [
    { text: 'Home', icon: <HomeIcon />, path: '/' },
    { text: 'Book a Ride', icon: <DirectionsCarIcon />, path: '/book' },
    { text: 'My Tesla', icon: <TeslaIcon />, path: '/tesla' },
    { text: 'Compare Rides', icon: <CompareArrowsIcon />, path: '/compare' },
    { text: 'Trip History', icon: <HistoryIcon />, path: '/trip-history' }
  ];
  
  // Mock notifications
  const notifications = [
    { id: 1, message: 'Your Tesla Model 3 is ready for pickup!', time: '5 minutes ago', read: false },
    { id: 2, message: 'Upcoming ride at 3:00 PM today', time: '1 hour ago', read: false },
    { id: 3, message: 'Your last trip receipt is available', time: '2 days ago', read: true },
  ];
  
  // Handle scroll effect for AppBar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Handle drawer toggle
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };
  
  // Handle profile menu
  const handleProfileMenuOpen = (event) => {
    setProfileMenu(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setProfileMenu(null);
  };
  
  // Handle notification menu
  const handleNotificationMenuOpen = (event) => {
    setNotificationMenu(event.currentTarget);
  };
  
  const handleNotificationMenuClose = () => {
    setNotificationMenu(null);
  };
  
  // Handle navigation
  const handleNavigation = (path) => {
    router.push(path);
    
    if (isMobile) {
      setDrawerOpen(false);
    }
    
    if (profileMenu) {
      setProfileMenu(null);
    }
    
    if (notificationMenu) {
      setNotificationMenu(null);
    }
  };
  
  // Get unread notification count
  const unreadNotificationCount = notifications.filter(n => !n.read).length;
  
  // Drawer content
  const drawer = (
    <Box 
      sx={{ 
        width: 280,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }} 
      role="presentation"
    >
      <Box 
        sx={{ 
          p: 3, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
        }}
      >
        <TeslaIcon sx={{ mr: 1, color: theme.palette.tesla.red }} />
        <Typography variant="h5" component="div" fontWeight="bold">
          Ride with Vic
        </Typography>
      </Box>
      
      {userData && (
        <Box sx={{ 
          p: 2, 
          display: 'flex', 
          alignItems: 'center', 
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          mb: 1
        }}>
          <Avatar 
            alt={`${userData.firstName} ${userData.lastName}`}
            src={userData.profilePicture} 
            sx={{ width: 40, height: 40, mr: 2 }}
          />
          <Box>
            <Typography variant="subtitle1" fontWeight="medium">
              {userData.firstName} {userData.lastName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {userData.email}
            </Typography>
          </Box>
        </Box>
      )}
      
      <Box sx={{ flexGrow: 1, overflowY: 'auto', px: 1 }}>
        <List component="nav">
          {menuItems.map((item) => (
            <ListItem 
              button 
              key={item.text} 
              onClick={() => handleNavigation(item.path)}
              selected={router.pathname === item.path}
              sx={{
                borderRadius: theme.shape.borderRadius,
                mb: 0.5,
                px: 2,
                '&.Mui-selected': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.15),
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.25),
                  },
                },
                '&:hover': {
                  backgroundColor: alpha(theme.palette.primary.main, 0.08),
                }
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: 40,
                color: router.pathname === item.path ? theme.palette.primary.main : 'inherit'
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{
                  fontWeight: router.pathname === item.path ? 'medium' : 'regular'
                }}
              />
            </ListItem>
          ))}
        </List>
      </Box>
      
      <Divider sx={{ my: 1 }} />
      
      <List component="nav" sx={{ px: 1 }}>
        <ListItem 
          button 
          onClick={() => handleNavigation('/profile')}
          sx={{ borderRadius: theme.shape.borderRadius }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <AccountCircleIcon />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem 
          button 
          onClick={() => handleNavigation('/settings')}
          sx={{ borderRadius: theme.shape.borderRadius }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </ListItem>
        <ListItem 
          button 
          onClick={toggleTheme}
          sx={{ borderRadius: theme.shape.borderRadius }}
        >
          <ListItemIcon sx={{ minWidth: 40 }}>
            {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
          </ListItemIcon>
          <ListItemText primary={darkMode ? 'Light Mode' : 'Dark Mode'} />
        </ListItem>
      </List>
    </Box>
  );
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar 
        position="fixed" 
        color="inherit" 
        elevation={scrolled ? 4 : 0}
        sx={{
          backgroundColor: scrolled ? 
            theme.palette.background.paper : 
            alpha(theme.palette.background.paper, darkMode ? 0.9 : 0.8),
          backdropFilter: 'blur(10px)',
          transition: 'all 0.3s ease'
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          {/* Logo */}
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center',
              cursor: 'pointer'
            }}
            onClick={() => handleNavigation('/')}
          >
            <TeslaIcon sx={{ mr: 1, color: theme.palette.tesla.red }} />
            <Typography 
              variant="h6" 
              component="div"
              sx={{ 
                fontWeight: 'bold',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              Ride with Vic
            </Typography>
          </Box>
          
          {/* Spacer */}
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Desktop Navigation */}
          {!isMobile && (
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {menuItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  startIcon={item.icon}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: theme.shape.borderRadius,
                    mx: 0.5,
                    px: 2,
                    py: 1,
                    position: 'relative',
                    overflow: 'hidden',
                    fontWeight: router.pathname === item.path ? 'medium' : 'normal',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: 3,
                      backgroundColor: theme.palette.primary.main,
                      borderTopLeftRadius: 3,
                      borderTopRightRadius: 3,
                      transform: router.pathname === item.path ? 'scaleX(1)' : 'scaleX(0)',
                      transformOrigin: 'center',
                      transition: 'transform 0.3s ease'
                    },
                    '&:hover::after': {
                      transform: 'scaleX(1)'
                    }
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}
          
          {/* Theme Toggle */}
          <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton 
              color="inherit" 
              onClick={toggleTheme}
              sx={{ ml: 1 }}
            >
              {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
            </IconButton>
          </Tooltip>
          
          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton 
              color="inherit" 
              sx={{ ml: 1 }}
              onClick={handleNotificationMenuOpen}
              aria-controls="notification-menu"
              aria-haspopup="true"
            >
              <Badge badgeContent={unreadNotificationCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Tooltip>
          
          {/* User Profile */}
          <Box sx={{ ml: 2 }}>
            <Tooltip title="Account">
              <IconButton
                onClick={handleProfileMenuOpen}
                size="small"
                sx={{ p: 0 }}
                aria-controls="profile-menu"
                aria-haspopup="true"
              >
                <Avatar 
                  alt={userData ? `${userData.firstName} ${userData.lastName}` : 'User Profile'}
                  src={userData?.profilePicture} 
                  sx={{ 
                    width: 40, 
                    height: 40,
                    border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`
                  }}
                />
              </IconButton>
            </Tooltip>
          </Box>
        </Toolbar>
      </AppBar>
      
      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer}
        variant="temporary"
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Profile Menu */}
      <Menu
        id="profile-menu"
        anchorEl={profileMenu}
        open={Boolean(profileMenu)}
        onClose={handleProfileMenuClose}
        PaperProps={{
          elevation: 4,
          sx: { 
            mt: 1.5, 
            width: 225,
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => handleNavigation('/profile')}>
          <ListItemIcon>
            <AccountCircleIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Profile" />
        </MenuItem>
        <MenuItem onClick={() => handleNavigation('/settings')}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Settings" />
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleNavigation('/logout')}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText primary="Logout" />
        </MenuItem>
      </Menu>
      
      {/* Notification Menu */}
      <Menu
        id="notification-menu"
        anchorEl={notificationMenu}
        open={Boolean(notificationMenu)}
        onClose={handleNotificationMenuClose}
        PaperProps={{
          elevation: 4,
          sx: { 
            mt: 1.5, 
            width: 320,
            maxHeight: 400,
            overflow: 'auto',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
            '&::before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="subtitle1" fontWeight="medium">
            Notifications
          </Typography>
        </Box>
        
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <MenuItem 
              key={notification.id} 
              onClick={handleNotificationMenuClose}
              sx={{ 
                py: 1.5, 
                px: 2,
                backgroundColor: notification.read ? 'inherit' : alpha(theme.palette.primary.main, 0.08),
                '&:hover': {
                  backgroundColor: notification.read ? alpha(theme.palette.action.hover, 0.1) : alpha(theme.palette.primary.main, 0.12)
                }
              }}
            >
              <Box sx={{ width: '100%' }}>
                <Typography variant="body1" component="p" fontWeight={notification.read ? 'regular' : 'medium'}>
                  {notification.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {notification.time}
                </Typography>
              </Box>
            </MenuItem>
          ))
        ) : (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        )}
        
        <Box sx={{ p: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button 
            fullWidth 
            size="small" 
            onClick={() => handleNavigation('/notifications')}
          >
            View All Notifications
          </Button>
        </Box>
      </Menu>
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          pt: { xs: 8, sm: 9 },
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {children}
      </Box>
      
      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: alpha(theme.palette.background.paper, 0.4),
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} Ride with Vic. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: { xs: 2, sm: 0 } }}>
              <Link href="/terms" passHref>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer' }}>
                  Terms of Service
                </Typography>
              </Link>
              <Link href="/privacy" passHref>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer' }}>
                  Privacy Policy
                </Typography>
              </Link>
              <Link href="/contact" passHref>
                <Typography variant="body2" color="text.secondary" sx={{ cursor: 'pointer' }}>
                  Contact Us
                </Typography>
              </Link>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
} 