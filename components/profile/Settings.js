import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  Switch,
  FormControlLabel,
  FormGroup,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Card,
  CardContent,
  ListItemIcon} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import VisibilityIcon from '@mui/icons-material/Visibility';
import LanguageIcon from '@mui/icons-material/Language';
import DataUsageIcon from '@mui/icons-material/DataUsage';
import LogoutIcon from '@mui/icons-material/Logout';
import DeleteIcon from '@mui/icons-material/Delete';

export default function Settings({ onSettingsChange }) {
  const [settings, setSettings] = useState({
    notifications: {
      rideUpdates: true,
      promotions: false,
      emailNotifications: true,
      pushNotifications: true,
      smsNotifications: false
    },
    privacy: {
      shareLocation: true,
      shareRideHistory: false,
      dataAnalytics: true
    },
    preferences: {
      language: 'en',
      currency: 'USD',
      theme: 'light',
      defaultMapView: 'standard'
    },
    accessibility: {
      highContrast: false,
      largeText: false,
      screenReader: false
    }
  });
  
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Handle toggle switches
  const handleToggleChange = (category, setting) => (event) => {
    const updatedSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: event.target.checked
      }
    };
    
    setSettings(updatedSettings);
    if (onSettingsChange) {
      onSettingsChange(updatedSettings);
    }
    
    showSnackbar(`Setting updated successfully`, 'success');
  };
  
  // Handle select and text inputs
  const handleInputChange = (category, setting) => (event) => {
    const updatedSettings = {
      ...settings,
      [category]: {
        ...settings[category],
        [setting]: event.target.value
      }
    };
    
    setSettings(updatedSettings);
    if (onSettingsChange) {
      onSettingsChange(updatedSettings);
    }
  };
  
  // Open dialog
  const openDialogAction = (type) => {
    setDialogType(type);
    setOpenDialog(true);
  };
  
  // Close dialog
  const closeDialog = () => {
    setOpenDialog(false);
  };
  
  // Handle dialog confirm actions
  const handleDialogConfirm = () => {
    if (dialogType === 'logout') {
      // Handle logout
      showSnackbar('You have been logged out successfully', 'success');
      // In a real app, this would call a logout function
    } else if (dialogType === 'deleteAccount') {
      // Handle account deletion
      showSnackbar('Account deletion requested', 'info');
      // In a real app, this would call an account deletion function
    }
    
    closeDialog();
  };
  
  // Show snackbar notification
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  
  // Render notification settings
  const renderNotificationSettings = () => (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <ListItemIcon>
            <NotificationsIcon />
          </ListItemIcon>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <FormGroup>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.rideUpdates}
                    onChange={handleToggleChange('notifications', 'rideUpdates')}
                  />
                }
                label="Ride Updates"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Get notified about changes to your ride status
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.promotions}
                    onChange={handleToggleChange('notifications', 'promotions')}
                  />
                }
                label="Promotions and Offers"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Receive special offers and promotions
              </Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
                Notification Channels
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.emailNotifications}
                    onChange={handleToggleChange('notifications', 'emailNotifications')}
                  />
                }
                label="Email"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.pushNotifications}
                    onChange={handleToggleChange('notifications', 'pushNotifications')}
                  />
                }
                label="Push Notifications"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.notifications.smsNotifications}
                    onChange={handleToggleChange('notifications', 'smsNotifications')}
                  />
                }
                label="SMS"
              />
            </Grid>
          </Grid>
        </FormGroup>
      </CardContent>
    </Card>
  );
  
  // Render privacy settings
  const renderPrivacySettings = () => (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <ListItemIcon>
            <VisibilityIcon />
          </ListItemIcon>
          <Typography variant="h6">Privacy</Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <FormGroup>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy.shareLocation}
                    onChange={handleToggleChange('privacy', 'shareLocation')}
                  />
                }
                label="Share Location"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Allow the app to access your location when using the service
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy.shareRideHistory}
                    onChange={handleToggleChange('privacy', 'shareRideHistory')}
                  />
                }
                label="Share Ride History"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Allow the app to use your ride history for personalized suggestions
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.privacy.dataAnalytics}
                    onChange={handleToggleChange('privacy', 'dataAnalytics')}
                  />
                }
                label="Data Analytics"
              />
              <Typography variant="caption" color="text.secondary" display="block">
                Help improve our service by sharing anonymous usage data
              </Typography>
            </Grid>
          </Grid>
        </FormGroup>
      </CardContent>
    </Card>
  );
  
  // Render preferences settings
  const renderPreferencesSettings = () => (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <ListItemIcon>
            <LanguageIcon />
          </ListItemIcon>
          <Typography variant="h6">Preferences</Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="language-select-label">Language</InputLabel>
              <Select
                labelId="language-select-label"
                id="language-select"
                value={settings.preferences.language}
                label="Language"
                onChange={handleInputChange('preferences', 'language')}
              >
                <MenuItem value="en">English</MenuItem>
                <MenuItem value="es">Spanish</MenuItem>
                <MenuItem value="fr">French</MenuItem>
                <MenuItem value="de">German</MenuItem>
                <MenuItem value="zh">Chinese</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="currency-select-label">Currency</InputLabel>
              <Select
                labelId="currency-select-label"
                id="currency-select"
                value={settings.preferences.currency}
                label="Currency"
                onChange={handleInputChange('preferences', 'currency')}
              >
                <MenuItem value="USD">US Dollar ($)</MenuItem>
                <MenuItem value="EUR">Euro (€)</MenuItem>
                <MenuItem value="GBP">British Pound (£)</MenuItem>
                <MenuItem value="JPY">Japanese Yen (¥)</MenuItem>
                <MenuItem value="CAD">Canadian Dollar ($)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="theme-select-label">Theme</InputLabel>
              <Select
                labelId="theme-select-label"
                id="theme-select"
                value={settings.preferences.theme}
                label="Theme"
                onChange={handleInputChange('preferences', 'theme')}
              >
                <MenuItem value="light">Light</MenuItem>
                <MenuItem value="dark">Dark</MenuItem>
                <MenuItem value="system">System Default</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="map-view-select-label">Default Map View</InputLabel>
              <Select
                labelId="map-view-select-label"
                id="map-view-select"
                value={settings.preferences.defaultMapView}
                label="Default Map View"
                onChange={handleInputChange('preferences', 'defaultMapView')}
              >
                <MenuItem value="standard">Standard</MenuItem>
                <MenuItem value="satellite">Satellite</MenuItem>
                <MenuItem value="hybrid">Hybrid</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
  
  // Render accessibility settings
  const renderAccessibilitySettings = () => (
    <Card variant="outlined" sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <ListItemIcon>
            <DataUsageIcon />
          </ListItemIcon>
          <Typography variant="h6">Accessibility</Typography>
        </Box>
        
        <Divider sx={{ mb: 2 }} />
        
        <FormGroup>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.accessibility.highContrast}
                    onChange={handleToggleChange('accessibility', 'highContrast')}
                  />
                }
                label="High Contrast"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.accessibility.largeText}
                    onChange={handleToggleChange('accessibility', 'largeText')}
                  />
                }
                label="Large Text"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.accessibility.screenReader}
                    onChange={handleToggleChange('accessibility', 'screenReader')}
                  />
                }
                label="Screen Reader Support"
              />
            </Grid>
          </Grid>
        </FormGroup>
      </CardContent>
    </Card>
  );
  
  // Render account actions
  const renderAccountActions = () => (
    <Card variant="outlined">
      <CardContent>
        <Typography variant="h6" mb={2}>
          Account Actions
        </Typography>
        
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={() => openDialogAction('logout')}
            >
              Logout
            </Button>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              startIcon={<DeleteIcon />}
              onClick={() => openDialogAction('deleteAccount')}
            >
              Delete Account
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Settings
      </Typography>
      
      {renderNotificationSettings()}
      {renderPrivacySettings()}
      {renderPreferencesSettings()}
      {renderAccessibilitySettings()}
      {renderAccountActions()}
      
      {/* Confirmation Dialogs */}
      <Dialog open={openDialog} onClose={closeDialog}>
        <DialogTitle>
          {dialogType === 'logout' ? 'Logout Confirmation' : 'Delete Account'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogType === 'logout'
              ? 'Are you sure you want to logout?'
              : 'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button 
            onClick={handleDialogConfirm} 
            color={dialogType === 'deleteAccount' ? 'error' : 'primary'}
            variant="contained"
          >
            {dialogType === 'logout' ? 'Logout' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbarSeverity}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
} 