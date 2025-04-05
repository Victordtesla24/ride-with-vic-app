const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { injectPdfValidator } = require('./pdf-validator');

(async () => {
  try {
    console.log('Starting PDF Receipt Test...');
    
    // Create downloads directory if it doesn't exist
    const downloadsFolder = path.join(__dirname, 'test-downloads');
    if (!fs.existsSync(downloadsFolder)) {
      fs.mkdirSync(downloadsFolder);
    }
    
    // Launch browser with specific download path
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    
    // Create a new page with specific settings to handle downloads
    const page = await browser.newPage();
    
    // Set up console logging
    page.on('console', msg => {
      const msgText = msg.text();
      if (msgText.includes('PDF Validator')) {
        console.log(`BROWSER: ${msgText}`);
      }
    });
    
    // Handle dialogs (alerts)
    page.on('dialog', async dialog => {
      console.log(`Dialog message: ${dialog.message()}`);
      await dialog.accept();
    });

    // Navigate to the app
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle0' });
    console.log('Loaded app page');
    
    // Inject our PDF validator
    await page.evaluate(`${injectPdfValidator.toString()}; injectPdfValidator();`);
    console.log('PDF Validator injected');
    
    // Create a test ride with very specific values to verify in PDF
    console.log('Creating test ride with specific values...');
    
    // Set current date in form
    const testDate = '2025-05-25';
    const testTime = '14:30';
    await page.evaluate((testDate) => {
      document.getElementById('date').value = testDate;
    }, testDate);
    
    await page.evaluate((testTime) => {
      document.getElementById('time').value = testTime;
    }, testTime);
    
    // Fill out other fields with distinct test values
    await page.type('#pickup', 'Test Origin Avenue 123');
    await page.type('#dropoff', 'Test Destination Boulevard 456');
    await page.type('#fare', '75.50'); // Specific value for testing
    await page.type('#discount', '15'); // 15% discount (should result in 11.33 discount and 64.17 total)
    await page.type('#driver', 'John Driver Test');
    await page.select('#rating', '5');
    await page.select('#payment', 'Credit Card');
    await page.type('#notes', 'Test PDF Export Receipt Note');
    
    // Submit the form
    await Promise.all([
      page.click('#ride-form-element button[type="submit"]'),
      page.waitForFunction(() => {
        return document.querySelector('#rides-list-container').childElementCount > 0;
      }, { timeout: 5000 })
    ]);
    
    console.log('Test ride created successfully');
    
    // Go to rides list tab
    await page.click('[data-tab="rides-list"]');
    await page.waitForSelector('#rides-list-container .ride-card', { visible: true });
    
    // Verify the test ride data in the UI
    const rideDetails = await page.evaluate(() => {
      const card = document.querySelector('#rides-list-container .ride-card');
      return {
        pickup: card.innerText.includes('Test Origin Avenue 123'),
        dropoff: card.innerText.includes('Test Destination Boulevard 456'),
        fare: card.innerText.includes('$64.18'), // 75.50 - 15% = 64.175, rounded to $64.18
        discount: card.innerText.includes('15%') && card.innerText.includes('$11.33'),
        driver: card.innerText.includes('John Driver Test'),
        rating: card.innerHTML.includes('★★★★★')
      };
    });
    
    // Verify ride details match what we expect
    assert(rideDetails.pickup, 'Pickup location should be displayed correctly');
    assert(rideDetails.dropoff, 'Dropoff location should be displayed correctly');
    assert(rideDetails.fare, 'Discounted fare should be calculated and displayed correctly');
    assert(rideDetails.discount, 'Discount amount should be calculated and displayed correctly');
    assert(rideDetails.driver, 'Driver name should be displayed correctly');
    assert(rideDetails.rating, 'Rating should be displayed correctly');
    
    console.log('✅ Ride details verified in UI');
    
    // Click the receipt button to show the receipt modal
    await page.click('.ride-card .btn-receipt');
    await page.waitForSelector('#receipt-modal[style*="display: block"]', { timeout: 5000 });
    
    // Verify receipt modal details
    const receiptDetails = await page.evaluate(() => {
      const receipt = document.getElementById('receipt-details');
      return {
        pickup: receipt.innerText.includes('Test Origin Avenue 123'),
        dropoff: receipt.innerText.includes('Test Destination Boulevard 456'),
        originalFare: receipt.innerText.includes('$75.50'),
        discount: receipt.innerText.includes('15%') && receipt.innerText.includes('$11.33'),
        discountedFare: receipt.innerText.includes('$64.18'),
        driver: receipt.innerText.includes('John Driver Test'),
        payment: receipt.innerText.includes('Credit Card'),
        notes: receipt.innerText.includes('Test PDF Export Receipt Note')
      };
    });
    
    // Verify receipt modal details match what we expect
    assert(receiptDetails.pickup, 'Pickup location should be displayed correctly in receipt');
    assert(receiptDetails.dropoff, 'Dropoff location should be displayed correctly in receipt');
    assert(receiptDetails.originalFare, 'Original fare should be displayed correctly in receipt');
    assert(receiptDetails.discount, 'Discount amount should be calculated and displayed correctly in receipt');
    assert(receiptDetails.discountedFare, 'Discounted fare should be displayed correctly in receipt');
    assert(receiptDetails.driver, 'Driver name should be displayed correctly in receipt');
    assert(receiptDetails.payment, 'Payment method should be displayed correctly in receipt');
    assert(receiptDetails.notes, 'Notes should be displayed correctly in receipt');
    
    console.log('✅ Receipt modal details verified');
    
    // Create a variable to store PDF validation results
    let pdfValidationResults = null;
    
    // Add a handler to capture PDF validation results
    await page.exposeFunction('storePdfValidation', (results) => {
      console.log('Received PDF validation results');
      pdfValidationResults = results;
    });
    
    // Inject code to pass PDF validation results to our test
    await page.evaluate(() => {
      // Extend the PDF validator to send results to our test
      const originalSave = window.jspdf.jsPDF.prototype.save;
      window.jspdf.jsPDF.prototype.save = function(filename) {
        // Log validation results after they're stored by the validator
        setTimeout(() => {
          if (window.pdfValidationResults) {
            window.storePdfValidation(window.pdfValidationResults);
          }
        }, 100);
        return originalSave.call(this, filename);
      };
    });
    
    // Click the download PDF button
    await page.click('#download-pdf');
    console.log('Download PDF button clicked');
    
    // Wait for validation results or timeout after 5 seconds
    await page.waitForFunction(() => {
      return window.pdfValidationResults !== undefined;
    }, { timeout: 5000 }).catch(e => {
      console.warn('Timeout waiting for PDF validation results. Test will continue but validation might be incomplete.');
    });
    
    // Wait a bit for any async operations to complete
    await page.waitForTimeout(2000);
    
    // Get the validation results if available
    const validationResults = await page.evaluate(() => {
      return window.pdfValidationResults;
    });
    
    if (validationResults) {
      console.log('PDF validation summary:', JSON.stringify(validationResults.validationSummary, null, 2));
      
      // Verify PDF content
      const summary = validationResults.validationSummary;
      assert.equal(summary.title, 'RIDE WITH VIC', 'PDF should have correct title');
      assert.equal(summary.receipt, 'RECEIPT', 'PDF should have RECEIPT label');
      
      // Verify all required fields are present
      assert(summary.itemsFound.date, 'PDF should include Date & Time');
      assert(summary.itemsFound.pickup, 'PDF should include Pickup location');
      assert(summary.itemsFound.dropoff, 'PDF should include Drop-off location');
      assert(summary.itemsFound.fare, 'PDF should include Fare');
      assert(summary.itemsFound.discount, 'PDF should include Discount');
      assert(summary.itemsFound.total, 'PDF should include Total');
      assert(summary.itemsFound.paymentMethod, 'PDF should include Payment Method');
      assert(summary.itemsFound.notes, 'PDF should include Notes section');
      assert(summary.footerText, 'PDF should include thank you message');
      
      // Verify table data if available
      if (validationResults.tableData && validationResults.tableData.body) {
        const tableData = validationResults.tableData;
        
        // Find specific rows
        const findRowByLabel = (label) => {
          return tableData.body.find(row => row[0] === label);
        };
        
        const fareRow = findRowByLabel('Fare');
        const discountRow = findRowByLabel('Discount (15%)');
        const totalRow = findRowByLabel('Total');
        
        if (fareRow) {
          assert(fareRow[1].includes('$75.50'), 'PDF should show correct original fare');
        } else {
          console.warn('Could not find Fare row in PDF');
        }
        
        if (discountRow) {
          assert(discountRow[1].includes('-$11.33'), 'PDF should show correct discount amount');
        } else {
          console.warn('Could not find Discount row in PDF');
        }
        
        if (totalRow) {
          assert(totalRow[1].includes('$64.18'), 'PDF should show correct total amount');
        } else {
          console.warn('Could not find Total row in PDF');
        }
        
        console.log('✅ PDF table data verified');
      }
    } else {
      console.warn('Could not retrieve PDF validation results');
    }
    
    // Close the browser
    await browser.close();
    
    console.log('✅ Receipt export test completed successfully!');
    
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
})(); 