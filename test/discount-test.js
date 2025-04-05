const puppeteer = require('puppeteer');
const assert = require('assert');

(async () => {
  try {
    console.log('Starting discount calculation test...');
    
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
    
    // Reload page after clearing localStorage
    await page.reload({ waitUntil: 'networkidle0' });
    console.log('App loaded successfully with clean localStorage');
    
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
    
    // Save the ride
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
    
    // Wait a moment for ride cards to render completely
    await page.waitForTimeout(1000);
    
    // Extract the actual ride card HTML and values
    const rideCardData = await page.evaluate(() => {
      const rideCard = document.querySelector('#rides-list-container .ride-card');
      
      if (!rideCard) {
        return { error: 'No ride card found' };
      }
      
      // Get the HTML for inspection
      const html = rideCard.outerHTML;
      
      // Extract the values shown in the UI
      const fareMatch = rideCard.innerText.match(/Fare:\s+\$([0-9.]+)/);
      const discountMatch = rideCard.innerText.match(/Discount:\s+(\d+)%\s+\(\$([0-9.]+)\)/);
      
      return {
        html,
        fare: fareMatch ? fareMatch[1] : null,
        discountPercent: discountMatch ? discountMatch[1] : null,
        discountAmount: discountMatch ? discountMatch[2] : null
      };
    });
    
    console.log('Ride card data from UI:');
    console.log(rideCardData);
    
    // Check if values match expected
    if (rideCardData.discountPercent === expectedDiscountPercent.toString()) {
      console.log('✅ Discount percentage is correct: ' + rideCardData.discountPercent + '%');
    } else {
      console.log(`❌ Discount percentage is incorrect. Expected: ${expectedDiscountPercent}%, Actual: ${rideCardData.discountPercent}%`);
    }
    
    if (rideCardData.discountAmount === expectedDiscountAmount.toString()) {
      console.log('✅ Discount amount is correct: $' + rideCardData.discountAmount);
    } else {
      console.log(`❌ Discount amount is incorrect. Expected: $${expectedDiscountAmount}, Actual: $${rideCardData.discountAmount}`);
    }
    
    if (rideCardData.fare === expectedDiscountedFare.toString()) {
      console.log('✅ Discounted fare is correct: $' + rideCardData.fare);
    } else {
      console.log(`❌ Discounted fare is incorrect. Expected: $${expectedDiscountedFare}, Actual: $${rideCardData.fare}`);
    }
    
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
      
      // Get the HTML for inspection
      const html = receiptDetails.outerHTML;
      
      // Extract values from the receipt
      const originalFareMatch = receiptDetails.innerText.match(/Fare:\s+\$([0-9.]+)/);
      const discountMatch = receiptDetails.innerText.match(/Discount\s+\((\d+)%\):\s+-\$([0-9.]+)/);
      const totalFareMatch = receiptDetails.innerText.match(/Total:\s+\$([0-9.]+)/);
      
      return {
        html,
        originalFare: originalFareMatch ? originalFareMatch[1] : null,
        discountPercent: discountMatch ? discountMatch[1] : null,
        discountAmount: discountMatch ? discountMatch[2] : null,
        totalFare: totalFareMatch ? totalFareMatch[1] : null
      };
    });
    
    console.log('Receipt data from UI:');
    console.log(receiptData);
    
    // Check if receipt values match expected
    if (receiptData.discountPercent === expectedDiscountPercent.toString()) {
      console.log('✅ Receipt discount percentage is correct: ' + receiptData.discountPercent + '%');
    } else {
      console.log(`❌ Receipt discount percentage is incorrect. Expected: ${expectedDiscountPercent}%, Actual: ${receiptData.discountPercent}%`);
    }
    
    if (receiptData.discountAmount === expectedDiscountAmount.toString()) {
      console.log('✅ Receipt discount amount is correct: $' + receiptData.discountAmount);
    } else {
      console.log(`❌ Receipt discount amount is incorrect. Expected: $${expectedDiscountAmount}, Actual: $${receiptData.discountAmount}`);
    }
    
    if (receiptData.totalFare === expectedDiscountedFare.toString()) {
      console.log('✅ Receipt total fare is correct: $' + receiptData.totalFare);
    } else {
      console.log(`❌ Receipt total fare is incorrect. Expected: $${expectedDiscountedFare}, Actual: $${receiptData.totalFare}`);
    }
    
    // Close browser
    await browser.close();
    
  } catch (error) {
    console.error('Discount test failed:', error);
    process.exit(1);
  }
})(); 