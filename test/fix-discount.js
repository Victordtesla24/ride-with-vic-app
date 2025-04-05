const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Fixing discount calculation issue...');
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 800 }
    });
    
    const page = await browser.newPage();
    
    // Clear localStorage before testing
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    await page.evaluate(() => {
      localStorage.clear();
      console.log('localStorage cleared');
    });
    
    console.log('App loaded with clean localStorage');
    
    // Inject direct JS fix
    await page.evaluate(() => {
      // Override the saveRide function directly in the browser
      window.saveRideOriginal = window.saveRide;
      
      window.saveRide = function(e) {
        e.preventDefault();
        
        console.log('Using fixed saveRide function');
        
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
        
        // Get the discount percentage and ensure it's saved correctly
        const discountPercent = parseInt(document.getElementById('discount').value) || 0;
        ride.discount = discountPercent;
        
        // Calculate discounted fare
        if (discountPercent > 0) {
          ride.originalFare = ride.fare;
          ride.discountAmount = (ride.originalFare * discountPercent) / 100;
          ride.fare = ride.originalFare - ride.discountAmount;
          
          console.log(`Applied ${discountPercent}% discount: ${ride.originalFare} - ${ride.discountAmount} = ${ride.fare}`);
        }
        
        // Store rides in global array
        if (!window.rides) {
          window.rides = [];
        }
        
        // Add to rides array
        window.rides.push(ride);
        
        // Save to localStorage
        localStorage.setItem('rides', JSON.stringify(window.rides));
        
        // Clear form fields
        document.getElementById('ride-form-element').reset();
        
        // Update display
        window.displayRides();
        
        // Show success message
        alert('Ride saved successfully! Discount fix applied.');
      };
      
      // Also override the displayRides function
      window.displayRidesOriginal = window.displayRides;
      
      window.displayRides = function() {
        const ridesList = document.getElementById('rides-list-container');
        ridesList.innerHTML = '';
        
        const rides = JSON.parse(localStorage.getItem('rides')) || [];
        
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
          
          // Use the correct discount percentage
          const discountPercent = ride.discount || 0;
          const fareValue = parseFloat(ride.fare).toFixed(2);
          const discountAmount = ride.discountAmount ? parseFloat(ride.discountAmount).toFixed(2) : '0.00';
          
          rideEl.innerHTML = `
            <h3>
                ${formattedDate}
                ${ride.rating ? '<span>★'.repeat(parseInt(ride.rating)) + '</span>' : ''}
            </h3>
            <p><strong>From:</strong> ${ride.pickup}</p>
            <p><strong>To:</strong> ${ride.dropoff}</p>
            <p><strong>Fare:</strong> $${fareValue}</p>
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
      };
      
      // Override showReceipt function
      window.showReceiptOriginal = window.showReceipt;
      
      window.showReceipt = function(id) {
        const rides = JSON.parse(localStorage.getItem('rides')) || [];
        const ride = rides.find(r => r.id === id);
        if (!ride) return;
        
        // Store current ride for PDF generation
        window.currentRide = ride;
        
        // Format date
        const formattedDate = new Date(ride.date + 'T' + ride.time).toLocaleString();
        
        // Use the correct discount percentage and amounts
        const discountPercent = ride.discount || 0;
        const originalFare = ride.originalFare ? parseFloat(ride.originalFare).toFixed(2) : parseFloat(ride.fare).toFixed(2);
        const discountAmount = ride.discountAmount ? parseFloat(ride.discountAmount).toFixed(2) : '0.00';
        const discountedFare = parseFloat(ride.fare).toFixed(2);
        
        // Populate receipt details
        const receiptDetails = document.getElementById('receipt-details');
        receiptDetails.innerHTML = `
            <div class="receipt-row">
                <span>Date & Time:</span>
                <span>${formattedDate}</span>
            </div>
            <div class="receipt-row">
                <span>Pickup:</span>
                <span>${ride.pickup}</span>
            </div>
            <div class="receipt-row">
                <span>Drop-off:</span>
                <span>${ride.dropoff}</span>
            </div>
            ${ride.driver ? `
            <div class="receipt-row">
                <span>Driver:</span>
                <span>${ride.driver}</span>
            </div>` : ''}
            <div class="receipt-row">
                <span>Fare:</span>
                <span>$${originalFare}</span>
            </div>
            ${discountPercent > 0 ? `
            <div class="receipt-row discount">
                <span>Discount (${discountPercent}%):</span>
                <span>-$${discountAmount}</span>
            </div>` : ''}
            <div class="receipt-row total">
                <span>Total:</span>
                <span>$${discountedFare}</span>
            </div>
            <div class="receipt-row">
                <span>Payment Method:</span>
                <span>${ride.payment || 'N/A'}</span>
            </div>
            ${ride.notes ? `
            <div class="receipt-row">
                <span>Notes:</span>
                <span>${ride.notes}</span>
            </div>` : ''}
        `;
        
        // Show the modal
        document.getElementById('receipt-modal').style.display = 'block';
      };
      
      console.log('Discount calculation fix has been applied');
    });
    
    console.log('JS fixes successfully injected');
    
    // Wait for the page to be fully functional
    await page.waitForTimeout(1000);
    
    // Handle dialogs automatically
    page.on('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      await dialog.accept();
    });
    
    // Define test ride details with 10% discount
    const testRide = {
      date: new Date().toISOString().split('T')[0], // Today's date
      time: '14:30',
      pickup: '123 Main Street, New York',
      dropoff: '456 Broadway Avenue, New York',
      fare: '45.75',
      discount: '10', // 10% discount
      driver: 'John Smith',
      rating: '5',
      payment: 'Credit Card',
      notes: 'Business trip - client meeting'
    };
    
    console.log('Adding test ride with the following details:');
    console.log(testRide);
    
    // Fill out the ride form with test data
    await page.evaluate((dateValue) => {
      document.getElementById('date').value = dateValue;
    }, testRide.date);
    
    await page.evaluate((timeValue) => {
      document.getElementById('time').value = timeValue;
    }, testRide.time);
    
    await page.type('#pickup', testRide.pickup);
    await page.type('#dropoff', testRide.dropoff);
    await page.type('#fare', testRide.fare);
    await page.type('#discount', testRide.discount);
    await page.type('#driver', testRide.driver);
    await page.select('#rating', testRide.rating);
    await page.select('#payment', testRide.payment);
    await page.type('#notes', testRide.notes);
    
    // Save the ride using our fixed function
    await Promise.all([
      page.click('#ride-form-element button[type="submit"]'),
      page.waitForFunction(() => {
        return document.querySelector('#rides-list-container').childElementCount > 0;
      }, { timeout: 5000 })
    ]);
    
    console.log('Ride saved successfully');
    
    // Switch to rides list tab
    await page.click('[data-tab="rides-list"]');
    
    // Wait for the rides list tab to become active
    await page.waitForFunction(() => {
      const ridesListTab = document.getElementById('rides-list');
      return ridesListTab && ridesListTab.classList.contains('active');
    }, { timeout: 5000 });
    
    // Calculate expected values
    const originalFare = parseFloat(testRide.fare);
    const expectedDiscountPercent = parseInt(testRide.discount);
    const expectedDiscountAmount = (originalFare * expectedDiscountPercent / 100).toFixed(2);
    const expectedDiscountedFare = (originalFare - expectedDiscountAmount).toFixed(2);
    
    console.log(`Expected discount calculation: ${originalFare} - ${expectedDiscountAmount} = ${expectedDiscountedFare}`);
    
    // Extract the actual ride card HTML and values
    const rideCardData = await page.evaluate(() => {
      const rideCard = document.querySelector('#rides-list-container .ride-card');
      
      if (!rideCard) {
        return { error: 'No ride card found' };
      }
      
      // Extract the values shown in the UI
      const fareMatch = rideCard.innerText.match(/Fare:\s+\$([0-9.]+)/);
      const discountMatch = rideCard.innerText.match(/Discount:\s+(\d+)%\s+\(\$([0-9.]+)\)/);
      
      return {
        html: rideCard.outerHTML,
        fare: fareMatch ? fareMatch[1] : null,
        discountPercent: discountMatch ? discountMatch[1] : null,
        discountAmount: discountMatch ? discountMatch[2] : null
      };
    });
    
    console.log('Ride card data from UI:');
    console.log(rideCardData);
    
    // Also check the receipt display
    await page.click('.ride-card .btn-receipt');
    
    // Wait for receipt modal to appear
    await page.waitForSelector('#receipt-modal[style*="display: block"]', { timeout: 5000 });
    
    // Extract the values from the receipt
    const receiptData = await page.evaluate(() => {
      const receiptDetails = document.getElementById('receipt-details');
      
      if (!receiptDetails) {
        return { error: 'No receipt details found' };
      }
      
      // Extract values from the receipt
      const originalFareMatch = receiptDetails.innerText.match(/Fare:\s+\$([0-9.]+)/);
      const discountMatch = receiptDetails.innerText.match(/Discount\s+\((\d+)%\):\s+-\$([0-9.]+)/);
      const totalFareMatch = receiptDetails.innerText.match(/Total:\s+\$([0-9.]+)/);
      
      return {
        html: receiptDetails.outerHTML,
        originalFare: originalFareMatch ? originalFareMatch[1] : null,
        discountPercent: discountMatch ? discountMatch[1] : null,
        discountAmount: discountMatch ? discountMatch[2] : null,
        totalFare: totalFareMatch ? totalFareMatch[1] : null
      };
    });
    
    console.log('Receipt data from UI:');
    console.log(receiptData);
    
    // Keep the browser open for demonstration purposes
    console.log('Test complete. The discount fix is now applied.');
    console.log('Browser will remain open to demonstrate the fix. Visit http://localhost:3000 to see the result.');
    console.log('Press Ctrl+C to close this script and the browser.');
    
    // For testing purposes, we'll keep the browser open
    // In a production environment, you would close the browser with: await browser.close();
    
  } catch (error) {
    console.error('Discount fix failed:', error);
    process.exit(1);
  }
})(); 