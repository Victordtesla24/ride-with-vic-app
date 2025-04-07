import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  DialogContentText,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import WorkIcon from '@mui/icons-material/Work';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import EmptyState from '../layout/EmptyState';

export default function SavedAddresses({ addresses = [], onAddressChange }) {
  const [savedAddresses, setSavedAddresses] = useState(addresses);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentAddress, setCurrentAddress] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    address: '',
    type: 'home'
  });
  
  // Handle opening the add address dialog
  const handleAddAddress = () => {
    setFormData({
      id: '',
      name: '',
      address: '',
      type: 'home'
    });
    setIsEdit(false);
    setOpenDialog(true);
  };
  
  // Handle opening the edit address dialog
  const handleEditAddress = (address) => {
    setFormData({
      id: address.id,
      name: address.name,
      address: address.address,
      type: address.type || 'home'
    });
    setIsEdit(true);
    setOpenDialog(true);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!formData.name || !formData.address) {
      return;
    }
    
    if (isEdit) {
      // Update existing address
      const updatedAddresses = savedAddresses.map(addr => 
        addr.id === formData.id ? { ...formData } : addr
      );
      setSavedAddresses(updatedAddresses);
      if (onAddressChange) onAddressChange(updatedAddresses);
    } else {
      // Add new address with unique ID
      const newAddress = {
        ...formData,
        id: Date.now().toString()
      };
      const updatedAddresses = [...savedAddresses, newAddress];
      setSavedAddresses(updatedAddresses);
      if (onAddressChange) onAddressChange(updatedAddresses);
    }
    
    handleCloseDialog();
  };
  
  // Open delete confirmation dialog
  const openDeleteConfirmation = (address) => {
    setCurrentAddress(address);
    setDeleteDialogOpen(true);
  };
  
  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCurrentAddress(null);
  };
  
  // Handle address deletion
  const handleDeleteAddress = () => {
    const updatedAddresses = savedAddresses.filter(
      addr => addr.id !== currentAddress.id
    );
    setSavedAddresses(updatedAddresses);
    if (onAddressChange) onAddressChange(updatedAddresses);
    closeDeleteDialog();
  };
  
  // Get icon based on address type
  const getAddressIcon = (type) => {
    switch (type) {
      case 'home':
        return <HomeIcon />;
      case 'work':
        return <WorkIcon />;
      case 'favorite':
        return <FavoriteIcon />;
      default:
        return <LocationOnIcon />;
    }
  };
  
  // Get label for address type
  const getAddressTypeLabel = (type) => {
    switch (type) {
      case 'home':
        return 'Home';
      case 'work':
        return 'Work';
      case 'favorite':
        return 'Favorite';
      default:
        return 'Other';
    }
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Saved Addresses
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddAddress}
          size="small"
        >
          Add Address
        </Button>
      </Box>
      
      {savedAddresses.length === 0 ? (
        <EmptyState
          title="No saved addresses"
          description="Add addresses to quickly select them for your rides"
          icon="location"
        />
      ) : (
        <Card variant="outlined">
          <CardContent>
            <List>
              {savedAddresses.map((address, index) => (
                <Box key={address.id || index}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem>
                    <ListItemIcon>
                      {getAddressIcon(address.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={address.name}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.primary" sx={{ display: 'block' }}>
                            {address.address}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getAddressTypeLabel(address.type)}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="edit"
                        onClick={() => handleEditAddress(address)}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => openDeleteConfirmation(address)}
                        size="small"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </Box>
              ))}
            </List>
          </CardContent>
        </Card>
      )}
      
      {/* Add/Edit Address Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Address' : 'Add New Address'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <TextField
                name="name"
                label="Name"
                fullWidth
                value={formData.name}
                onChange={handleInputChange}
                placeholder="e.g. My Home, Office, etc."
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="address"
                label="Address"
                fullWidth
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter full address"
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="address-type-label">Address Type</InputLabel>
                <Select
                  labelId="address-type-label"
                  id="address-type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Address Type"
                >
                  <MenuItem value="home">Home</MenuItem>
                  <MenuItem value="work">Work</MenuItem>
                  <MenuItem value="favorite">Favorite</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained" 
            disabled={!formData.name || !formData.address}
          >
            {isEdit ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Delete Address</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{currentAddress?.name}&quot;? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeleteAddress} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 