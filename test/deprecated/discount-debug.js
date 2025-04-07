const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Starting discount debugging...');
    
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
    
    // Get data from localStorage
    const localStorageData = await page.evaluate(() => {
      const ridesData = localStorage.getItem('rides');
      const rides = JSON.parse(ridesData);
      return rides;
    });
    
    console.log('Rides data from localStorage:');
    console.log(JSON.stringify(localStorageData, null, 2));
    
    // Inspect the saveRide function code
    const saveRideFunction = await page.evaluate(() => {
      // We need to expose the function definition as a string
      const allScripts = Array.from(document.scripts)
        .map(script => script.textContent)
        .join('\n');
      
      const saveRideFnMatch = allScripts.match(/function\s+saveRide\s*\([^)]*\)\s*\{[\s\S]*?\}/);
      return saveRideFnMatch ? saveRideFnMatch[0] : 'saveRide function not found';
    });
    
    console.log('saveRide function code:');
    console.log(saveRideFunction);
    
    // Close browser
    await browser.close();
    
  } catch (error) {
    console.error('Debugging failed:', error);
    process.exit(1);
  }
})(); 