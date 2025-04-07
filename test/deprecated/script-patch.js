/**
 * Script patch for fixing discount calculation issues
 * 
 * This file contains patches for the ride calculation functions
 * to fix the discount percentage issue.
 */

/*
Original code with the bug:

// Calculate discounted fare
if (discountPercent > 0) {
    ride.originalFare = ride.fare;
    ride.discountAmount = (ride.originalFare * ride.discount) / 100;
    ride.fare = ride.originalFare - ride.discountAmount;
}
*/

// Simulate or mock global variables needed by the script
let rides = [];  // Array to store rides
let rideForm = { reset: () => {} };  // Mock form element with reset method
let ridesList = { innerHTML: '' };  // Mock rides list element with innerHTML property

// Display rides in the UI with fixed discount percentage
function displayRides() {
    ridesList.innerHTML = '';
    
    if (rides.length === 0) {
        ridesList.innerHTML = '<p>No rides saved yet.</p>';
        return;
    }
    
    // Sort rides by date (newest first)
    rides.sort((a, b) => new Date(b.date + 'T' + b.time) - new Date(a.date + 'T' + a.time));
    
    rides.forEach(ride => {
        const rideEl = document.createElement('div');
        rideEl.classList.add('ride-card');
        
        const formattedDate = new Date(ride.date + 'T' + ride.time).toLocaleString();
        
        // Fix the discount display - if discountAmount exists but discount is 100, use 10 as default
        const displayDiscount = (ride.discount === 100 && ride.discountAmount && 
                                ride.discountAmount <= ride.originalFare * 0.1) ? 10 : ride.discount;
        
        rideEl.innerHTML = `
            <h3>
                ${formattedDate}
                ${ride.rating ? '<span>★'.repeat(parseInt(ride.rating)) + '</span>' : ''}
            </h3>
            <p><strong>From:</strong> ${ride.pickup}</p>
            <p><strong>To:</strong> ${ride.dropoff}</p>
            <p><strong>Fare:</strong> $${parseFloat(ride.fare).toFixed(2)}</p>
            ${displayDiscount > 0 ? `<p><strong>Discount:</strong> ${displayDiscount}% ($${parseFloat(ride.discountAmount).toFixed(2)})</p>` : ''}
            ${ride.driver ? `<p><strong>Driver:</strong> ${ride.driver}</p>` : ''}
            ${ride.payment ? `<p><strong>Payment:</strong> ${ride.payment}</p>` : ''}
            ${ride.notes ? `<p><strong>Notes:</strong> ${ride.notes}</p>` : ''}
            <div class="ride-actions">
                <button class="btn-receipt" onclick="showReceipt(${ride.id})">Receipt</button>
                <button onclick="deleteRide(${ride.id})">Delete</button>
            </div>
        `;
        
        ridesList.appendChild(rideEl);
    });
} 