/**
 * ValidComponent for Trip Management
 * Provides validation functionality for trip data
 */

import React, { useState, useEffect, useCallback } from 'react';

const ValidComponent = ({ tripData, onValidation }) => {
  const [isValid, setIsValid] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const validateTripData = useCallback(() => {
    const errors = [];
    
    // Validate required fields
    if (!tripData) {
      errors.push('Trip data is missing');
      setIsValid(false);
      setValidationErrors(errors);
      return;
    }
    
    if (!tripData.pickup) {
      errors.push('Pickup location is required');
    }
    
    if (!tripData.dropoff) {
      errors.push('Drop-off location is required');
    }
    
    if (!tripData.date) {
      errors.push('Date is required');
    }
    
    if (!tripData.time) {
      errors.push('Time is required');
    }
    
    // Additional validations
    if (tripData.fare && (isNaN(tripData.fare) || tripData.fare <= 0)) {
      errors.push('Fare must be a positive number');
    }
    
    // Validate distance and duration if present
    if (tripData.distance && (isNaN(tripData.distance) || tripData.distance <= 0)) {
      errors.push('Distance must be a positive number');
    }

    if (tripData.duration && (isNaN(tripData.duration) || tripData.duration <= 0)) {
      errors.push('Duration must be a positive number');
    }
    
    // Update validation state
    setIsValid(errors.length === 0);
    setValidationErrors(errors);
    
    // Notify parent component
    if (onValidation) {
      onValidation(errors.length === 0, errors);
    }
  }, [tripData, onValidation]);

  useEffect(() => {
    validateTripData();
  }, [validateTripData]);

  return (
    <div className="validation-component">
      {validationErrors.length > 0 && (
        <div className="validation-errors">
          <h4>Please fix the following issues:</h4>
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      {isValid && tripData && (
        <div className="validation-success">
          <p>All trip information is valid.</p>
        </div>
      )}
    </div>
  );
};

export default ValidComponent;
