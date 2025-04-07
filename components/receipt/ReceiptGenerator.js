/**
 * Receipt Generator Component
 * Handles generating PDF receipts for trips
 */

class ReceiptGenerator {
  constructor() {
    this.defaultTemplate = 'standard';
    this.templates = {
      standard: this.standardTemplate,
      detailed: this.detailedTemplate,
      simple: this.simpleTemplate
    };
  }

  /**
   * Generate PDF receipt for trip
   * @param {Object} trip Trip data
   * @param {string} template Template name (optional)
   * @returns {Promise<Blob>} PDF receipt as blob
   */
  async generateReceipt(trip, template = 'standard') {
    if (!trip) {
      throw new Error('Trip data is required');
    }

    // Select template function
    const templateFn = this.templates[template] || this.templates.standard;
    
    // Generate HTML content from template
    const html = templateFn.call(this, trip);
    
    // Convert HTML to PDF blob
    return await this.generatePDFFromHTML(html);
  }

  /**
   * Convert HTML content to PDF blob
   * For demo purposes, we'll just return the HTML as a blob
   * In a real implementation, this would use a PDF generation library
   * @param {string} html HTML content
   * @returns {Promise<Blob>} PDF blob
   */
  async generatePDFFromHTML(html) {
    // In a real implementation, this would use a PDF generation library
    // For demo purposes, we'll just return the HTML as a blob
    return new Blob([html], { type: 'text/html' });
  }

  /**
   * Generate download link for receipt
   * @param {Blob} blob Receipt blob
   * @returns {string} Download URL
   */
  createDownloadLink(blob) {
    return URL.createObjectURL(blob);
  }

  /**
   * Standard receipt template
   * @param {Object} trip Trip data
   * @returns {string} HTML content
   */
  standardTemplate(trip) {
    const date = new Date(trip.startTime).toLocaleDateString();
    const startTime = new Date(trip.startTime).toLocaleTimeString();
    const endTime = new Date(trip.endTime).toLocaleTimeString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Trip Receipt - ${date}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
          }
          .receipt {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
          }
          .header {
            text-align: center;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
          }
          .receipt-title {
            font-size: 24px;
            margin: 0;
          }
          .receipt-date {
            color: #666;
            margin-top: 5px;
          }
          .trip-details {
            margin-top: 20px;
            padding: 20px 0;
            border-bottom: 1px solid #eee;
          }
          .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
          }
          .detail-label {
            font-weight: bold;
            flex: 1;
          }
          .detail-value {
            flex: 2;
            text-align: right;
          }
          .fare-details {
            margin-top: 20px;
          }
          .total-row {
            margin-top: 15px;
            padding-top: 15px;
            border-top: 2px solid #eee;
            font-size: 18px;
            font-weight: bold;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1 class="receipt-title">Trip Receipt</h1>
            <p class="receipt-date">Date: ${date}</p>
          </div>
          
          <div class="trip-details">
            <div class="detail-row">
              <span class="detail-label">Trip ID:</span>
              <span class="detail-value">${trip.id}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Start Time:</span>
              <span class="detail-value">${startTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">End Time:</span>
              <span class="detail-value">${endTime}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Start Location:</span>
              <span class="detail-value">${trip.startLocation.address || 'N/A'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">End Location:</span>
              <span class="detail-value">${trip.endLocation.address || 'N/A'}</span>
            </div>
          </div>
          
          <div class="fare-details">
            <div class="detail-row">
              <span class="detail-label">Estimated Fare:</span>
              <span class="detail-value">$${trip.estimatedFare?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Actual Fare:</span>
              <span class="detail-value">$${trip.actualFare?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Discount (${trip.discountPercent || 0}%):</span>
              <span class="detail-value">$${trip.discountAmount?.toFixed(2) || '0.00'}</span>
            </div>
            <div class="detail-row total-row">
              <span class="detail-label">Final Fare:</span>
              <span class="detail-value">$${trip.finalFare?.toFixed(2) || '0.00'}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for riding with Vic!</p>
            <p>Receipt ID: ${trip.receipt?.id || trip.id}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Detailed receipt template with map and more information
   * @param {Object} trip Trip data
   * @returns {string} HTML content
   */
  detailedTemplate(trip) {
    // Start with standard template
    const standard = this.standardTemplate(trip);
    
    // For demo purposes, we'll just return the standard template
    // In a real implementation, this would add more details and a map
    return standard;
  }

  /**
   * Simple receipt template
   * @param {Object} trip Trip data
   * @returns {string} HTML content
   */
  simpleTemplate(trip) {
    const date = new Date(trip.startTime).toLocaleDateString();
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Simple Receipt - ${date}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
          }
          .receipt {
            max-width: 400px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #ddd;
          }
          .header {
            text-align: center;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
          }
          .receipt-title {
            font-size: 18px;
            margin: 0;
          }
          .trip-info {
            margin-top: 10px;
            font-size: 14px;
          }
          .total {
            margin-top: 15px;
            font-size: 16px;
            font-weight: bold;
            text-align: center;
          }
          .footer {
            margin-top: 20px;
            text-align: center;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="receipt">
          <div class="header">
            <h1 class="receipt-title">Ride Receipt</h1>
            <p>${date}</p>
          </div>
          
          <div class="trip-info">
            <p>From: ${trip.startLocation.address || 'N/A'}</p>
            <p>To: ${trip.endLocation.address || 'N/A'}</p>
          </div>
          
          <div class="total">
            <p>Total: $${trip.finalFare?.toFixed(2) || '0.00'}</p>
          </div>
          
          <div class="footer">
            <p>Thank you for riding with Vic!</p>
            <p>Receipt #${trip.receipt?.id || trip.id}</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}

export default ReceiptGenerator; 