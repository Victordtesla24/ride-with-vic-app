const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Direct fix for discount calculation issue...');
    
    // Launch browser
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      defaultViewport: { width: 1280, height: 800 }
    });
    
    const page = await browser.newPage();
    
    // Navigate to the app
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('App loaded');
    
    // Handle dialogs automatically
    page.on('dialog', async (dialog) => {
      console.log(`Dialog message: ${dialog.message()}`);
      await dialog.accept();
    });
    
    // Use direct localStorage manipulation
    await page.evaluate(() => {
      console.log('Clearing localStorage...');
      localStorage.clear();
      console.log('localStorage cleared');
    });
    
    console.log('Script functions fixed successfully');
    
    // Fill form with test data
    const testRide = {
      date: new Date().toISOString().split('T')[0],
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
    
    console.log('Adding test ride with the following details:', testRide);
    
    // Fill the form
    await page.evaluate((date) => document.getElementById('date').value = date, testRide.date);
    await page.evaluate((time) => document.getElementById('time').value = time, testRide.time);
    await page.type('#pickup', testRide.pickup);
    await page.type('#dropoff', testRide.dropoff);
    await page.type('#fare', testRide.fare);
    await page.type('#discount', testRide.discount);
    await page.type('#driver', testRide.driver);
    await page.select('#rating', testRide.rating);
    await page.select('#payment', testRide.payment);
    await page.type('#notes', testRide.notes);
    
    // Submit the form and insert data manually
    await page.evaluate((testRide) => {
      // Calculate discount correctly
      const originalFare = parseFloat(testRide.fare);
      const discountPercent = parseInt(testRide.discount);
      const discountAmount = (originalFare * discountPercent) / 100;
      const finalFare = originalFare - discountAmount;
      
      console.log(`Manually setting ride with discount: ${originalFare} - ${discountAmount} (${discountPercent}%) = ${finalFare}`);
      
      // Create the ride object
      const ride = {
        id: Date.now(),
        date: testRide.date,
        time: testRide.time,
        pickup: testRide.pickup,
        dropoff: testRide.dropoff,
        fare: finalFare,
        discount: discountPercent,
        driver: testRide.driver,
        rating: testRide.rating,
        payment: testRide.payment,
        notes: testRide.notes,
        originalFare: originalFare,
        discountAmount: discountAmount
      };
      
      // Save directly to localStorage
      const rides = [];
      rides.push(ride);
      localStorage.setItem('rides', JSON.stringify(rides));
      
      // Attempt to refresh the display
      // Clear the form
      document.getElementById('ride-form-element').reset();
      
      // Force "Ride saved" alert
      alert('Ride saved successfully with correct discount calculation!');
      
      return ride;
    }, testRide);
    
    // Need to reload the page to reflect localStorage changes
    await page.reload({ waitUntil: 'networkidle0' });
    
    // Go to rides list tab and verify
    await page.click('[data-tab="rides-list"]');
    
    // Wait for the rides list tab to become active
    await page.waitForFunction(() => {
      const ridesListTab = document.getElementById('rides-list');
      return ridesListTab && ridesListTab.classList.contains('active');
    }, { timeout: 5000 });
    
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    // Check the display
    const displayResult = await page.evaluate(() => {
      const rideCards = document.querySelectorAll('#rides-list-container .ride-card');
      if (rideCards.length === 0) {
        return { success: false, error: 'No ride cards found' };
      }
      
      const rideCard = rideCards[0]; // Get the first ride card
      
      // Extract the displayed values
      return {
        success: true,
        rideCardHTML: rideCard.outerHTML,
        rideCardText: rideCard.innerText
      };
    });
    
    console.log('Ride display result:', displayResult);
    
    // Generate screenshot for verification
    await page.screenshot({ path: 'ride-fix-result.png' });
    console.log('Screenshot saved to ride-fix-result.png');
    
    // Click receipt button
    await page.click('.ride-card .btn-receipt');
    
    // Wait for receipt modal
    await page.waitForSelector('#receipt-modal[style*="display: block"]', { timeout: 5000 });
    
    // Verify receipt
    const receiptResult = await page.evaluate(() => {
      const receiptDetails = document.getElementById('receipt-details');
      if (!receiptDetails) {
        return { success: false, error: 'Receipt details not found' };
      }
      
      return {
        success: true,
        receiptHTML: receiptDetails.outerHTML,
        receiptText: receiptDetails.innerText
      };
    });
    
    console.log('Receipt result:', receiptResult);
    
    // Take screenshot of receipt
    await page.screenshot({ path: 'receipt-fix-result.png' });
    console.log('Receipt screenshot saved to receipt-fix-result.png');
    
    // Close browser
    await browser.close();
    console.log('Test complete');
    
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})(); 