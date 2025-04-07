import { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  Grid, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  Select, 
  Typography,
  Alert,
  Snackbar
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { v4 as uuidv4 } from 'uuid';

const RATINGS = [1, 2, 3, 4, 5];
const PAYMENT_METHODS = ['Credit Card', 'Debit Card', 'Cash', 'PayPal', 'Other'];

export default function RideForm({ onSave }) {
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState(new Date());
  const [pickup, setPickup] = useState('');
  const [dropoff, setDropoff] = useState('');
  const [fare, setFare] = useState('');
  const [discount, setDiscount] = useState(0);
  const [driver, setDriver] = useState('');
  const [rating, setRating] = useState('');
  const [payment, setPayment] = useState('');
  const [notes, setNotes] = useState('');
  const [alert, setAlert] = useState({ open: false, message: '', severity: 'success' });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Calculate discount amount and final fare
    const fareAmount = parseFloat(fare);
    const discountPercent = parseInt(discount) || 0;
    const discountAmount = (fareAmount * discountPercent) / 100;
    const finalFare = fareAmount - discountAmount;
    
    // Create new ride object
    const newRide = {
      id: uuidv4(),
      date: date.toISOString().split('T')[0],
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      pickup,
      dropoff,
      fare: finalFare.toFixed(2),
      originalFare: fareAmount.toFixed(2),
      discount: discountPercent,
      discountAmount: discountAmount.toFixed(2),
      driver,
      rating,
      payment,
      notes,
      timestamp: new Date().toISOString(),
    };
    
    // Save the ride
    onSave(newRide);
    
    // Show success alert
    setAlert({
      open: true,
      message: 'Ride saved successfully!',
      severity: 'success'
    });
    
    // Reset form fields
    setPickup('');
    setDropoff('');
    setFare('');
    setDiscount(0);
    setDriver('');
    setRating('');
    setPayment('');
    setNotes('');
  };

  const handleAlertClose = () => {
    setAlert({...alert, open: false});
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Add New Ride</Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <DatePicker
              label="Date"
              value={date}
              onChange={(newDate) => setDate(newDate)}
              renderInput={(params) => <TextField {...params} fullWidth required />}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TimePicker
              label="Time"
              value={time}
              onChange={(newTime) => setTime(newTime)}
              renderInput={(params) => <TextField {...params} fullWidth required />}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Pickup Location"
              fullWidth
              required
              value={pickup}
              onChange={(e) => setPickup(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Drop-off Location"
              fullWidth
              required
              value={dropoff}
              onChange={(e) => setDropoff(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Fare"
              type="number"
              InputProps={{ startAdornment: '$' }}
              fullWidth
              required
              value={fare}
              onChange={(e) => setFare(e.target.value)}
              inputProps={{ step: "0.01", min: "0" }}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <TextField
              label="Discount (%)"
              type="number"
              fullWidth
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
              inputProps={{ step: "1", min: "0", max: "100" }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Driver"
              fullWidth
              value={driver}
              onChange={(e) => setDriver(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Rating</InputLabel>
              <Select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                label="Rating"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {RATINGS.map((r) => (
                  <MenuItem key={r} value={r}>{r} {'★'.repeat(r)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                label="Payment Method"
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {PAYMENT_METHODS.map((method) => (
                  <MenuItem key={method} value={method}>{method}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </Grid>
          
          <Grid item xs={12} display="flex" justifyContent="space-between">
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              sx={{ mt: 2 }}
            >
              Save Ride
            </Button>
            
            <Button 
              variant="outlined" 
              color="primary"
              sx={{ mt: 2 }}
              onClick={() => {
                // Export data functionality would go here
                alert('Export data functionality will be implemented here');
              }}
            >
              Export Data
            </Button>
          </Grid>
        </Grid>
      </Box>
      
      <Snackbar 
        open={alert.open} 
        autoHideDuration={4000} 
        onClose={handleAlertClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleAlertClose} severity={alert.severity}>
          {alert.message}
        </Alert>
      </Snackbar>
    </LocalizationProvider>
  );
} 