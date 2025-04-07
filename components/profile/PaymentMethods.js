import { useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  FormControlLabel,
  Card,
  CardContent,
  Chip
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentIcon from '@mui/icons-material/Payment';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmptyState from '../layout/EmptyState';

export default function PaymentMethods({ paymentMethods = [], onPaymentMethodChange }) {
  const [methods, setMethods] = useState(paymentMethods);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentMethod, setCurrentMethod] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    type: 'credit',
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    isDefault: false
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Handle opening the add payment method dialog
  const handleAddPaymentMethod = () => {
    setFormData({
      id: '',
      type: 'credit',
      number: '',
      name: '',
      expiry: '',
      cvv: '',
      isDefault: methods.length === 0
    });
    setFormErrors({});
    setIsEdit(false);
    setOpenDialog(true);
  };
  
  // Handle opening the edit payment method dialog
  const handleEditPaymentMethod = (method) => {
    setFormData({
      id: method.id,
      type: method.type || 'credit',
      number: method.number,
      name: method.name,
      expiry: method.expiry || '',
      cvv: method.cvv || '',
      isDefault: method.isDefault || false
    });
    setFormErrors({});
    setIsEdit(true);
    setOpenDialog(true);
  };
  
  // Handle dialog close
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  // Validate credit card number format
  const validateCardNumber = (number) => {
    // Remove spaces and non-digits
    const digitsOnly = number.replace(/\D/g, '');
    return /^\d{13,19}$/.test(digitsOnly);
  };
  
  // Validate expiry date format (MM/YY)
  const validateExpiry = (expiry) => {
    return /^\d{2}\/\d{2}$/.test(expiry);
  };
  
  // Validate CVV format (3 or 4 digits)
  const validateCVV = (cvv) => {
    return /^\d{3,4}$/.test(cvv);
  };
  
  // Format credit card number with spaces
  const formatCardNumber = (number) => {
    // Remove non-digits
    const digitsOnly = number.replace(/\D/g, '');
    // Add space after every 4 digits
    const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, '$1 ');
    return formatted;
  };
  
  // Mask credit card number except last 4 digits
  const maskCardNumber = (number) => {
    if (!number) return '';
    
    // Remove spaces
    const digitsOnly = number.replace(/\s/g, '');
    // Keep only last 4 digits visible
    return '•••• •••• •••• ' + digitsOnly.slice(-4);
  };
  
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    let processedValue = value;
    
    // Format credit card number with spaces while typing
    if (name === 'number') {
      processedValue = formatCardNumber(value);
    }
    
    // Format expiry date with slash
    if (name === 'expiry' && value.length === 2 && formData.expiry.length === 1) {
      processedValue = value + '/';
    }
    
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : processedValue
    });
    
    // Clear error for this field if it exists
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: null
      });
    }
  };
  
  // Validate form before submission
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Cardholder name is required';
    }
    
    if (!formData.number.trim()) {
      errors.number = 'Card number is required';
    } else if (!validateCardNumber(formData.number)) {
      errors.number = 'Invalid card number';
    }
    
    if (formData.type !== 'cash') {
      if (!formData.expiry) {
        errors.expiry = 'Expiry date is required';
      } else if (!validateExpiry(formData.expiry)) {
        errors.expiry = 'Invalid format (MM/YY)';
      }
      
      if (!formData.cvv) {
        errors.cvv = 'CVV is required';
      } else if (!validateCVV(formData.cvv)) {
        errors.cvv = 'Invalid CVV';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }
    
    // If this is set as default, update other methods
    let updatedMethods = [...methods];
    if (formData.isDefault) {
      updatedMethods = updatedMethods.map(method => ({
        ...method,
        isDefault: false
      }));
    }
    
    if (isEdit) {
      // Update existing method
      updatedMethods = updatedMethods.map(method => 
        method.id === formData.id ? { ...formData } : method
      );
    } else {
      // Add new method with unique ID
      const newMethod = {
        ...formData,
        id: Date.now().toString()
      };
      updatedMethods = [...updatedMethods, newMethod];
    }
    
    // Ensure there's always a default payment method
    if (!updatedMethods.some(method => method.isDefault)) {
      updatedMethods[0].isDefault = true;
    }
    
    setMethods(updatedMethods);
    if (onPaymentMethodChange) onPaymentMethodChange(updatedMethods);
    handleCloseDialog();
  };
  
  // Open delete confirmation dialog
  const openDeleteConfirmation = (method) => {
    setCurrentMethod(method);
    setDeleteDialogOpen(true);
  };
  
  // Close delete confirmation dialog
  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setCurrentMethod(null);
  };
  
  // Handle payment method deletion
  const handleDeletePaymentMethod = () => {
    const isDefault = currentMethod.isDefault;
    let updatedMethods = methods.filter(
      method => method.id !== currentMethod.id
    );
    
    // If the deleted method was default and there are other methods,
    // set the first remaining method as default
    if (isDefault && updatedMethods.length > 0) {
      updatedMethods[0].isDefault = true;
    }
    
    setMethods(updatedMethods);
    if (onPaymentMethodChange) onPaymentMethodChange(updatedMethods);
    closeDeleteDialog();
  };
  
  // Set a payment method as default
  const setDefaultPaymentMethod = (id) => {
    const updatedMethods = methods.map(method => ({
      ...method,
      isDefault: method.id === id
    }));
    
    setMethods(updatedMethods);
    if (onPaymentMethodChange) onPaymentMethodChange(updatedMethods);
  };
  
  // Get icon based on payment method type
  const getPaymentIcon = (type) => {
    switch (type) {
      case 'credit':
        return <CreditCardIcon />;
      case 'debit':
        return <PaymentIcon />;
      case 'bank':
        return <AccountBalanceIcon />;
      case 'cash':
        return <AttachMoneyIcon />;
      default:
        return <CreditCardIcon />;
    }
  };
  
  // Get label for payment method type
  const getPaymentTypeLabel = (type) => {
    switch (type) {
      case 'credit':
        return 'Credit Card';
      case 'debit':
        return 'Debit Card';
      case 'bank':
        return 'Bank Account';
      case 'cash':
        return 'Cash';
      default:
        return 'Credit Card';
    }
  };
  
  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6">
          Payment Methods
        </Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />}
          onClick={handleAddPaymentMethod}
          size="small"
        >
          Add Payment
        </Button>
      </Box>
      
      {methods.length === 0 ? (
        <EmptyState
          title="No payment methods"
          description="Add payment methods to complete your rides"
          icon="receipt"
        />
      ) : (
        <Card variant="outlined">
          <CardContent>
            <List>
              {methods.map((method, index) => (
                <Box key={method.id || index}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem>
                    <ListItemIcon>
                      {getPaymentIcon(method.type)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center">
                          <Typography variant="body1">
                            {maskCardNumber(method.number)}
                          </Typography>
                          {method.isDefault && (
                            <Chip
                              size="small"
                              label="Default"
                              color="primary"
                              variant="outlined"
                              icon={<CheckCircleIcon fontSize="small" />}
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.primary">
                            {method.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {getPaymentTypeLabel(method.type)}
                            {method.expiry && ` · Expires ${method.expiry}`}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      {!method.isDefault && (
                        <Button
                          size="small"
                          onClick={() => setDefaultPaymentMethod(method.id)}
                          sx={{ mr: 1 }}
                        >
                          Set Default
                        </Button>
                      )}
                      <IconButton 
                        edge="end" 
                        aria-label="edit"
                        onClick={() => handleEditPaymentMethod(method)}
                        size="small"
                        sx={{ mr: 1 }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={() => openDeleteConfirmation(method)}
                        size="small"
                        disabled={methods.length === 1} // Prevent deleting the last method
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
      
      {/* Add/Edit Payment Method Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{isEdit ? 'Edit Payment Method' : 'Add Payment Method'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="payment-type-label">Payment Type</InputLabel>
                <Select
                  labelId="payment-type-label"
                  id="payment-type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  label="Payment Type"
                >
                  <MenuItem value="credit">Credit Card</MenuItem>
                  <MenuItem value="debit">Debit Card</MenuItem>
                  <MenuItem value="bank">Bank Account</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            {formData.type !== 'cash' && (
              <>
                <Grid item xs={12}>
                  <TextField
                    name="number"
                    label="Card Number"
                    fullWidth
                    value={formData.number}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    error={!!formErrors.number}
                    helperText={formErrors.number}
                    inputProps={{ maxLength: 19 }}
                  />
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    name="name"
                    label="Cardholder Name"
                    fullWidth
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    error={!!formErrors.name}
                    helperText={formErrors.name}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    name="expiry"
                    label="Expiry Date"
                    fullWidth
                    value={formData.expiry}
                    onChange={handleInputChange}
                    placeholder="MM/YY"
                    error={!!formErrors.expiry}
                    helperText={formErrors.expiry}
                    inputProps={{ maxLength: 5 }}
                  />
                </Grid>
                
                <Grid item xs={6}>
                  <TextField
                    name="cvv"
                    label="CVV"
                    fullWidth
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="123"
                    error={!!formErrors.cvv}
                    helperText={formErrors.cvv}
                    inputProps={{ maxLength: 4 }}
                  />
                </Grid>
              </>
            )}
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Radio
                    checked={formData.isDefault}
                    onChange={handleInputChange}
                    name="isDefault"
                    color="primary"
                  />
                }
                label="Set as default payment method"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button 
            onClick={handleSubmit} 
            variant="contained"
            disabled={formData.type !== 'cash' && (!formData.number || !formData.name)}
          >
            {isEdit ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={closeDeleteDialog}>
        <DialogTitle>Delete Payment Method</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this payment method? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancel</Button>
          <Button onClick={handleDeletePaymentMethod} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 