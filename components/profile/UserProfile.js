import { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Avatar,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Snackbar,
  Alert,
  Badge,
  Stack
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import EditIcon from '@mui/icons-material/Edit';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import PersonIcon from '@mui/icons-material/Person';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import DriveEtaIcon from '@mui/icons-material/DriveEta';

export default function UserProfile({ user, onUserUpdate }) {
  const [profileData, setProfileData] = useState(user || {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    birthdate: '',
    profilePicture: '',
    bio: '',
    joinDate: new Date().toISOString().split('T')[0],
    ridesCompleted: 0,
    rating: 0
  });
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Handle edit mode toggle
  const toggleEditMode = () => {
    setEditMode(!editMode);
  };
  
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  // Handle profile picture dialog open
  const handleOpenProfilePictureDialog = () => {
    setOpenDialog(true);
  };
  
  // Handle profile picture dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Handle mock profile picture upload (in a real app, this would upload to a server)
  const handleProfilePictureUpdate = () => {
    // In a real application, you would handle file upload here
    // For this demo, we'll just use a placeholder
    const newProfilePic = `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${Math.floor(Math.random() * 99)}.jpg`;
    
    setProfileData({
      ...profileData,
      profilePicture: newProfilePic
    });
    
    handleCloseDialog();
    showSnackbar('Profile picture updated successfully', 'success');
  };
  
  // Handle save profile changes
  const handleSaveProfile = () => {
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (profileData.email && !emailRegex.test(profileData.email)) {
      showSnackbar('Please enter a valid email address', 'error');
      return;
    }
    
    // Validate phone (simple validation for demo)
    const phoneRegex = /^\+?[0-9\s-()]{10,15}$/;
    if (profileData.phone && !phoneRegex.test(profileData.phone)) {
      showSnackbar('Please enter a valid phone number', 'error');
      return;
    }
    
    // Save profile data
    if (onUserUpdate) {
      onUserUpdate(profileData);
    }
    
    setEditMode(false);
    showSnackbar('Profile updated successfully', 'success');
  };
  
  // Show snackbar notification
  const showSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setOpenSnackbar(false);
  };
  
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Profile
      </Typography>
      
      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={3}>
            {/* Profile Header with Picture and Basic Info */}
            <Grid item xs={12}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <IconButton 
                        size="small" 
                        sx={{ 
                          bgcolor: 'primary.main', 
                          color: 'white',
                          '&:hover': { bgcolor: 'primary.dark' }
                        }}
                        onClick={handleOpenProfilePictureDialog}
                      >
                        <PhotoCameraIcon fontSize="small" />
                      </IconButton>
                    }
                  >
                    <Avatar 
                      sx={{ 
                        width: 80, 
                        height: 80,
                        border: '3px solid',
                        borderColor: 'primary.light'
                      }}
                      src={profileData.profilePicture}
                      alt={`${profileData.firstName} ${profileData.lastName}`}
                    >
                      {!profileData.profilePicture && 
                        (profileData.firstName?.charAt(0) || '') + 
                        (profileData.lastName?.charAt(0) || '')}
                    </Avatar>
                  </Badge>
                  
                  <Box ml={2}>
                    {editMode ? (
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <TextField
                            name="firstName"
                            label="First Name"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={profileData.firstName || ''}
                            onChange={handleInputChange}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            name="lastName"
                            label="Last Name"
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={profileData.lastName || ''}
                            onChange={handleInputChange}
                          />
                        </Grid>
                      </Grid>
                    ) : (
                      <Typography variant="h5" component="h2">
                        {profileData.firstName} {profileData.lastName}
                      </Typography>
                    )}
                    
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <DriveEtaIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        {profileData.ridesCompleted || 0} rides completed
                      </Typography>
                      
                      {profileData.rating > 0 && (
                        <Box display="flex" alignItems="center" ml={2}>
                          <Typography variant="body2" color="text.secondary">
                            {profileData.rating.toFixed(1)} ★
                          </Typography>
                        </Box>
                      )}
                    </Box>
                    
                    <Box display="flex" alignItems="center" mt={0.5}>
                      <CalendarTodayIcon fontSize="small" color="action" sx={{ mr: 0.5 }} />
                      <Typography variant="body2" color="text.secondary">
                        Member since {formatDate(profileData.joinDate)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                
                <Button
                  variant={editMode ? "contained" : "outlined"}
                  color={editMode ? "primary" : "primary"}
                  startIcon={editMode ? <SaveIcon /> : <EditIcon />}
                  onClick={editMode ? handleSaveProfile : toggleEditMode}
                >
                  {editMode ? "Save" : "Edit Profile"}
                </Button>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Divider />
            </Grid>
            
            {/* Contact Information */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                Contact Information
              </Typography>
              
              <Stack spacing={2}>
                <Box display="flex" alignItems="center">
                  <EmailIcon color="action" sx={{ mr: 2 }} />
                  {editMode ? (
                    <TextField
                      name="email"
                      label="Email"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={profileData.email || ''}
                      onChange={handleInputChange}
                      placeholder="your.email@example.com"
                    />
                  ) : (
                    <Typography>
                      {profileData.email || 'No email added'}
                    </Typography>
                  )}
                </Box>
                
                <Box display="flex" alignItems="center">
                  <PhoneIcon color="action" sx={{ mr: 2 }} />
                  {editMode ? (
                    <TextField
                      name="phone"
                      label="Phone"
                      variant="outlined"
                      size="small"
                      fullWidth
                      value={profileData.phone || ''}
                      onChange={handleInputChange}
                      placeholder="+1 123 456 7890"
                    />
                  ) : (
                    <Typography>
                      {profileData.phone || 'No phone number added'}
                    </Typography>
                  )}
                </Box>
                
                <Box display="flex" alignItems="center">
                  <CalendarTodayIcon color="action" sx={{ mr: 2 }} />
                  {editMode ? (
                    <TextField
                      name="birthdate"
                      label="Birthdate"
                      variant="outlined"
                      size="small"
                      type="date"
                      fullWidth
                      value={profileData.birthdate || ''}
                      onChange={handleInputChange}
                      InputLabelProps={{ shrink: true }}
                    />
                  ) : (
                    <Typography>
                      {profileData.birthdate ? formatDate(profileData.birthdate) : 'No birthdate added'}
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Grid>
            
            {/* Bio/About */}
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" gutterBottom fontWeight="medium">
                About Me
              </Typography>
              
              {editMode ? (
                <TextField
                  name="bio"
                  label="Bio"
                  variant="outlined"
                  multiline
                  rows={5}
                  fullWidth
                  value={profileData.bio || ''}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <Typography variant="body1">
                  {profileData.bio || 'No bio added yet.'}
                </Typography>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      
      {/* Profile Picture Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Update Profile Picture</DialogTitle>
        <DialogContent>
          <Box p={2} textAlign="center">
            <Avatar 
              sx={{ 
                width: 150, 
                height: 150,
                mb: 2,
                mx: 'auto'
              }}
              src={profileData.profilePicture}
              alt={`${profileData.firstName} ${profileData.lastName}`}
            >
              {!profileData.profilePicture && 
                (profileData.firstName?.charAt(0) || '') + 
                (profileData.lastName?.charAt(0) || '')}
            </Avatar>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Upload a new profile picture
            </Typography>
            
            <Button
              variant="contained"
              component="label"
              startIcon={<PhotoCameraIcon />}
              sx={{ mt: 1 }}
            >
              Choose File
              {/* In a real app, this would be connected to file input */}
              <input
                type="file"
                hidden
                accept="image/*"
              />
            </Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleProfilePictureUpdate}
            variant="contained"
          >
            Update Picture
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={openSnackbar}
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