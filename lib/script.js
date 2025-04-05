/**
 * RIDE WITH VIC - Main Application Script
 */

// Register service worker for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful with scope: ', registration.scope);
            }).catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}

// Import PDF.js library
const { jsPDF } = window.jspdf;

// Global variables
let rides = [];
let currentRide = null;

// Setup Tesla integration if available
function initTeslaIntegration() {
    console.log('Tesla integration would be initialized here');
    // This would be implemented in a real app
}

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const rideForm = document.getElementById('ride-form-element');
    const ridesList = document.getElementById('rides-list-container');
    const exportBtn = document.getElementById('btn-export');
    const estimateForm = document.getElementById('estimate-form');
    const estimateResults = document.getElementById('estimate-results');
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    const receiptModal = document.getElementById('receipt-modal');
    const closeModal = document.querySelector('.close');
    const downloadPdfBtn = document.getElementById('download-pdf');
    
    // Uber API credentials (in a real app, these would be secured on a server)
    const UBER_CLIENT_ID = 'YOUR_UBER_CLIENT_ID';
    const UBER_SERVER_TOKEN = 'YOUR_UBER_SERVER_TOKEN';
    
    // Load saved rides from localStorage
    rides = JSON.parse(localStorage.getItem('rides')) || [];
    
    // Fix any existing rides with incorrect discount calculations
    rides = rides.map(ride => {
        if (ride.discount === 100 && ride.originalFare && ride.discountAmount) {
            // The discount was likely meant to be a smaller percentage
            // Calculate what the actual percentage was likely intended to be
            const calculatedPercent = Math.round((ride.discountAmount / ride.originalFare) * 100);
            if (calculatedPercent <= 20) { // Only fix reasonable discounts (under 20%)
                console.log(`Fixing ride with ID ${ride.id}: changing discount from 100% to ${calculatedPercent}%`);
                ride.discount = calculatedPercent;
                ride.fare = ride.originalFare - ride.discountAmount;
            }
        }
        return ride;
    });
    
    // Save the fixed rides back to localStorage
    localStorage.setItem('rides', JSON.stringify(rides));
    
    // Display saved rides
    displayRides();
    
    // Tab Navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tab = button.dataset.tab;
            
            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Show active tab content
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(tab).classList.add('active');
        });
    });
    
    // Event Listeners
    rideForm.addEventListener('submit', saveRide);
    exportBtn.addEventListener('click', exportRides);
    estimateForm.addEventListener('submit', getFareEstimate);
    closeModal.addEventListener('click', () => receiptModal.style.display = 'none');
    downloadPdfBtn.addEventListener('click', generatePDF);
    
    // When user clicks outside the modal, close it
    window.addEventListener('click', function(event) {
        if (event.target === receiptModal) {
            receiptModal.style.display = 'none';
        }
    });
    
    // Initialize Tesla API integration
    try {
        initTeslaIntegration();
        console.log('Tesla API integration initialized');
    } catch (error) {
        console.error('Failed to initialize Tesla integration:', error);
    }
    
    // Make showReceipt function globally available for Tesla integration
    window.showReceiptModal = function(trip) {
        // Convert Tesla trip format to app trip format if needed
        if (trip.startTime && trip.endTime) {
            // This is a Tesla API trip, convert to our format
            const teslaTrip = {
                id: trip.id,
                date: new Date(trip.startTime).toISOString().split('T')[0],
                time: new Date(trip.startTime).toTimeString().split(' ')[0],
                pickup: trip.startLocation?.address || 'Unknown',
                dropoff: trip.endLocation?.address || 'Unknown',
                fare: trip.actualFare || trip.estimatedFare || 0,
                driver: 'Tesla Autopilot',
                payment: trip.paymentMethod || 'Credit Card',
                notes: trip.notes || ''
            };
            
            showReceipt(teslaTrip);
        } else {
            // Regular trip format
            showReceipt(trip.id);
        }
    };
    
    // Save a new ride
    function saveRide(e) {
        e.preventDefault();
        
        // Get form values
        const ride = {
            id: Date.now(),
            date: document.getElementById('date').value,
            time: document.getElementById('time').value,
            pickup: document.getElementById('pickup').value,
            dropoff: document.getElementById('dropoff').value,
            fare: parseFloat(document.getElementById('fare').value),
            driver: document.getElementById('driver').value,
            rating: document.getElementById('rating').value,
            payment: document.getElementById('payment').value,
            notes: document.getElementById('notes').value
        };
        
        // Get the discount percentage as input by the user
        const discountPercent = parseInt(document.getElementById('discount').value) || 0;
        
        // Store the correct discount percentage
        ride.discount = discountPercent;
        
        // Calculate discounted fare
        if (discountPercent > 0) {
            ride.originalFare = ride.fare;
            ride.discountAmount = (ride.originalFare * discountPercent) / 100;
            ride.fare = ride.originalFare - ride.discountAmount;
            
            console.log(`Applied ${discountPercent}% discount: ${ride.originalFare} - ${ride.discountAmount} = ${ride.fare}`);
        }
        
        // Add to rides array
        rides.push(ride);
        
        // Save to localStorage
        localStorage.setItem('rides', JSON.stringify(rides));
        
        // Clear form fields
        rideForm.reset();
        
        // Update display
        displayRides();
        
        // Show success message
        alert('Ride saved successfully!');
    }
    
    // Display rides in the UI
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
            
            // Format fare and discount values
            const fareDisplay = parseFloat(ride.fare).toFixed(2);
            const discountPercent = ride.discount || 0;
            const discountAmount = ride.discountAmount ? parseFloat(ride.discountAmount).toFixed(2) : '0.00';
            
            rideEl.innerHTML = `
                <h3>
                    ${formattedDate}
                    ${ride.rating ? '<span>★'.repeat(parseInt(ride.rating)) + '</span>' : ''}
                </h3>
                <p><strong>From:</strong> ${ride.pickup}</p>
                <p><strong>To:</strong> ${ride.dropoff}</p>
                <p><strong>Fare:</strong> $${fareDisplay}</p>
                ${discountPercent > 0 ? `<p><strong>Discount:</strong> ${discountPercent}% ($${discountAmount})</p>` : ''}
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
    
    // Export rides to CSV
    function exportRides() {
        if (rides.length === 0) {
            alert('No rides to export.');
            return;
        }
        
        // CSV Headers
        const headers = ['Date', 'Time', 'Pickup Location', 'Drop-off Location', 'Fare', 'Discount', 'Driver', 'Rating', 'Payment Method', 'Notes'];
        
        // Create CSV content
        let csvContent = headers.join(',') + '\n';
        
        rides.forEach(ride => {
            const row = [
                ride.date,
                ride.time,
                `"${ride.pickup.replace(/"/g, '""')}"`,
                `"${ride.dropoff.replace(/"/g, '""')}"`,
                ride.fare,
                ride.discount || 0,
                `"${ride.driver.replace(/"/g, '""')}"`,
                ride.rating,
                ride.payment,
                `"${ride.notes.replace(/"/g, '""')}"`
            ];
            csvContent += row.join(',') + '\n';
        });
        
        // Create a download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'ride-history.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Generate PDF receipt
    function generatePDF() {
        if (!currentRide) return;
        
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        // Set up the document
        doc.setFontSize(20);
        doc.text('RIDE WITH VIC RECEIPT', 105, 20, { align: 'center' });
        
        doc.setFontSize(12);
        doc.text('Your trusted ride partner', 105, 30, { align: 'center' });
        
        const ride = currentRide;
        const formattedDate = new Date(ride.date + 'T' + ride.time).toLocaleString();
        
        // Create receipt content
        const receiptData = [
            ['Date/Time', formattedDate],
            ['Pickup', ride.pickup],
            ['Drop-off', ride.dropoff],
            ['Fare', `$${parseFloat(ride.fare).toFixed(2)}`]
        ];
        
        if (ride.discount > 0) {
            receiptData.push(['Original Fare', `$${parseFloat(ride.originalFare).toFixed(2)}`]);
            receiptData.push([`Discount (${ride.discount}%)`, `$${parseFloat(ride.discountAmount).toFixed(2)}`]);
        }
        
        if (ride.driver) {
            receiptData.push(['Driver', ride.driver]);
        }
        
        if (ride.payment) {
            receiptData.push(['Payment Method', ride.payment]);
        }
        
        if (ride.notes) {
            receiptData.push(['Notes', ride.notes]);
        }
        
        // Add receipt data to PDF
        doc.autoTable({
            startY: 40,
            head: [['Item', 'Details']],
            body: receiptData,
            theme: 'grid',
            styles: { halign: 'left' },
            headStyles: { fillColor: [52, 152, 219] },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 90 }
            }
        });
        
        // Add footer
        const pageCount = doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.text('Thank you for riding with us!', 105, doc.internal.pageSize.height - 10, { align: 'center' });
        }
        
        // Save PDF
        doc.save(`receipt-${ride.id}.pdf`);
    }
    
    // Get fare estimate from Uber or Lyft APIs
    function getFareEstimate(e) {
        e.preventDefault();
        
        const pickup = document.getElementById('estimate-pickup').value;
        const dropoff = document.getElementById('estimate-dropoff').value;
        
        if (!pickup || !dropoff) {
            alert('Please enter both pickup and drop-off locations');
            return;
        }
        
        // In a real app, we would call the Uber/Lyft APIs here
        // For demo purposes, let's just generate mock estimates
        const distance = Math.floor(Math.random() * 20) + 2; // 2-22 miles
        const duration = distance * 3; // 3 minutes per mile
        
        const estimates = [
            {
                service: 'Economy',
                price: (distance * 1.5 + 2.5).toFixed(2),
                time: Math.round(duration * 1.1)
            },
            {
                service: 'Comfort',
                price: (distance * 2 + 3.5).toFixed(2),
                time: Math.round(duration)
            },
            {
                service: 'Premium',
                price: (distance * 3 + 5).toFixed(2),
                time: Math.round(duration * 0.9)
            }
        ];
        
        // Show estimates
        const resultsHTML = `
            <h3>Fare Estimates</h3>
            <p>Distance: Approximately ${distance} miles</p>
            <p>From: ${pickup}</p>
            <p>To: ${dropoff}</p>
            <div class="service-options">
                ${estimates.map(est => `
                    <div class="service-option">
                        <h4>${est.service}</h4>
                        <p class="price">$${est.price}</p>
                        <p class="time">${est.time} min</p>
                        <button class="btn btn-book">Book Now</button>
                    </div>
                `).join('')}
            </div>
        `;
        
        estimateResults.innerHTML = resultsHTML;
        
        // Add event listeners to booking buttons
        document.querySelectorAll('.btn-book').forEach((btn, index) => {
            btn.addEventListener('click', () => {
                const selectedService = estimates[index];
                alert(`
                    Booking ${selectedService.service} ride 
                    from ${pickup} to ${dropoff}
                    Price: $${selectedService.price}
                    Est. Time: ${selectedService.time} min
                `);
            });
        });
    }
}); 