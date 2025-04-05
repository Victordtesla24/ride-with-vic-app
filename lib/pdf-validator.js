/**
 * PDF Validator utility script
 * This script adds enhanced logging to jsPDF to help validate PDF content during testing
 */

// Function to inject into the page to validate PDF content
function injectPdfValidator() {
  // Check if jsPDF is loaded
  if (!window.jspdf || !window.jspdf.jsPDF) {
    console.error('jsPDF not found on page!');
    return false;
  }
  
  console.log('PDF Validator: Enhancing jsPDF with validation capabilities');
  
  // Store original save method
  const originalSave = window.jspdf.jsPDF.prototype.save;
  
  // Override save method to capture and validate PDF content
  window.jspdf.jsPDF.prototype.save = function(filename) {
    console.log('PDF Validator: PDF generation detected');
    console.log('PDF Validator: Filename:', filename);
    
    // Get document properties
    const props = this.getProperties();
    console.log('PDF Validator: Document properties:', JSON.stringify(props));
    
    try {
      // Extract text content from the PDF
      let textContent = [];
      let tableData = [];
      
      // Process all pages (typically just one for a receipt)
      Object.keys(this.internal.pages).forEach(pageNum => {
        if (pageNum !== 'xref') { // Skip non-page entries
          const pageItems = this.internal.pages[pageNum];
          if (Array.isArray(pageItems)) {
            pageItems.forEach(item => {
              if (item && item.type === 'text') {
                textContent.push({
                  text: item.text,
                  x: item.x,
                  y: item.y,
                  fontSize: item.fontSize,
                  color: item.color
                });
              }
            });
          }
        }
      });
      
      // Try to extract table data if available
      if (this.autoTable && this.autoTable.previous) {
        const tableConfig = this.autoTable.previous;
        
        // Extract table headers
        const headers = tableConfig.head[0].map(cell => cell.content);
        console.log('PDF Validator: Table headers:', headers);
        
        // Extract table body
        const bodyRows = tableConfig.body.map(row => {
          return row.map(cell => cell.content);
        });
        
        tableData = {
          headers: headers,
          body: bodyRows
        };
        
        console.log('PDF Validator: Table data:', JSON.stringify(tableData));
      }
      
      // Sort text content by y position to help with reading order
      textContent.sort((a, b) => a.y - b.y);
      
      // Log text content items
      console.log('PDF Validator: Text content items:', JSON.stringify(textContent));
      
      // Create a validation summary
      const validationSummary = {
        title: textContent.find(t => t.text === 'RIDE WITH VIC')?.text || 'Title not found',
        receipt: textContent.find(t => t.text === 'RECEIPT')?.text || 'Receipt label not found',
        itemsFound: {
          date: textContent.some(t => t.text.includes('Date & Time')),
          pickup: textContent.some(t => t.text.includes('Pickup')),
          dropoff: textContent.some(t => t.text.includes('Drop-off')),
          fare: textContent.some(t => t.text.includes('Fare')),
          discount: textContent.some(t => t.text.includes('Discount')),
          total: textContent.some(t => t.text.includes('Total')),
          paymentMethod: textContent.some(t => t.text.includes('Payment Method')),
          notes: textContent.some(t => t.text.includes('Notes'))
        },
        tableRowCount: tableData.body ? tableData.body.length : 0,
        footerText: textContent.some(t => t.text.includes('Thank you for riding with us'))
      };
      
      console.log('PDF Validator: Validation summary:', JSON.stringify(validationSummary));
      
      // Store validation results on window for testing frameworks to access
      window.pdfValidationResults = {
        textContent,
        tableData,
        validationSummary,
        properties: props
      };
      
      // See if we can find the critical receipt information
      const findValueByLabel = (label) => {
        if (!tableData.body) return null;
        const row = tableData.body.find(r => r[0] === label);
        return row ? row[1] : null;
      };
      
      // Extract key financial values 
      const fareValue = findValueByLabel('Fare');
      const discountValue = findValueByLabel('Discount (15%)');
      const totalValue = findValueByLabel('Total');
      
      // Validate financial calculations
      if (fareValue && totalValue) {
        console.log(`PDF Validator: Fare value: ${fareValue}, Total value: ${totalValue}`);
        
        if (discountValue) {
          console.log(`PDF Validator: Discount applied: ${discountValue}`);
        }
      }
      
    } catch (error) {
      console.error('PDF Validator: Error during validation:', error);
    }
    
    // Call the original save method
    return originalSave.call(this, filename);
  };
  
  return true;
}

// Export for Node.js environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { injectPdfValidator };
}

// For browser usage
if (typeof window !== 'undefined') {
  window.PdfValidator = { inject: injectPdfValidator };
} 