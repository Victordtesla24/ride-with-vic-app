import { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Chip,
  Rating,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptIcon from '@mui/icons-material/Receipt';
import EmptyState from '../layout/EmptyState';

export default function RideList({ rides = [], onDelete }) {
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedRide, setSelectedRide] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [rideToDelete, setRideToDelete] = useState(null);

  const handleShowReceipt = (ride) => {
    setSelectedRide(ride);
    setReceiptDialogOpen(true);
  };

  const handleCloseReceipt = () => {
    setReceiptDialogOpen(false);
  };

  const confirmDelete = (ride) => {
    setRideToDelete(ride);
    setDeleteConfirmOpen(true);
  };

  const handleDelete = () => {
    if (rideToDelete && onDelete) {
      onDelete(rideToDelete.id);
    }
    setDeleteConfirmOpen(false);
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  if (!rides.length) {
    return (
      <EmptyState
        title="No rides saved yet"
        description="Your saved rides will appear here"
        icon="directions_car"
      />
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Your Rides ({rides.length})
      </Typography>

      <Grid container spacing={2}>
        {rides.map((ride) => (
          <Grid item xs={12} md={6} key={ride.id}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">
                  {new Date(ride.date + 'T' + ride.time).toLocaleString()}
                </Typography>
                
                <Box sx={{ my: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Pickup
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {ride.pickup}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary">
                    Drop-off
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {ride.dropoff}
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {formatCurrency(ride.fare)}
                  </Typography>
                  
                  {ride.rating && (
                    <Rating value={Number(ride.rating)} readOnly size="small" />
                  )}
                </Box>
                
                {ride.driver && (
                  <Typography variant="body2" mt={1}>
                    Driver: {ride.driver}
                  </Typography>
                )}
                
                {ride.discount > 0 && (
                  <Chip 
                    size="small" 
                    label={`${ride.discount}% discount`} 
                    color="success" 
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                )}
              </CardContent>
              
              <Divider />
              
              <CardActions>
                <IconButton 
                  size="small" 
                  onClick={() => handleShowReceipt(ride)} 
                  title="View Receipt"
                >
                  <ReceiptIcon />
                </IconButton>
                
                <IconButton 
                  size="small" 
                  onClick={() => confirmDelete(ride)} 
                  color="error"
                  title="Delete Ride"
                >
                  <DeleteIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Receipt Dialog */}
      <Dialog open={receiptDialogOpen} onClose={handleCloseReceipt} maxWidth="sm" fullWidth>
        <DialogTitle>Receipt</DialogTitle>
        <DialogContent>
          {selectedRide && (
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" align="center" gutterBottom>
                RIDE WITH VIC
              </Typography>
              <Typography variant="body2" align="center" color="text.secondary" gutterBottom>
                Your trusted ride partner
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Date/Time
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {new Date(selectedRide.date + 'T' + selectedRide.time).toLocaleString()}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Driver
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRide.driver || 'N/A'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Pickup
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRide.pickup}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Drop-off
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedRide.dropoff}
                  </Typography>
                </Grid>
                
                {selectedRide.discount > 0 && (
                  <>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Original Fare
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatCurrency(selectedRide.originalFare)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Discount ({selectedRide.discount}%)
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatCurrency(selectedRide.discountAmount)}
                      </Typography>
                    </Grid>
                  </>
                )}
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Final Fare
                  </Typography>
                  <Typography variant="h6" color="primary" fontWeight="bold">
                    {formatCurrency(selectedRide.fare)}
                  </Typography>
                </Grid>
                
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Method
                  </Typography>
                  <Typography variant="body1">
                    {selectedRide.payment || 'N/A'}
                  </Typography>
                </Grid>
                
                {selectedRide.notes && (
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Notes
                    </Typography>
                    <Typography variant="body1">
                      {selectedRide.notes}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReceipt}>Close</Button>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => {
              alert('Download functionality will be implemented here');
              handleCloseReceipt();
            }}
          >
            Download PDF
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this ride? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 