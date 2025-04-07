/**
 * Customer Selector Component
 * 
 * This component allows users to select a customer for a trip.
 */

import { getCustomers, saveCustomer, createCustomer } from 'models/customer.js';

/**
 * Initialize CustomerSelector component
 * @param {HTMLElement} container The container element
 * 
 * @returns {Object} Component API
 */
export function CustomerSelector(container, ) {
  // Private variables
  let customers = [];
  let selectedCustomerId = null;
  
  // Create component structure
  const componentEl = document.createElement('div');
  componentEl.className = 'customer-selector';
  componentEl.innerHTML = `
    <div class="customer-selector-header">
      <h3>Select Customer</h3>
      <button class="btn btn-sm btn-new-customer">+ New</button>
    </div>
    <div class="customer-search">
      <input type="text" placeholder="Search customers..." class="customer-search-input">
    </div>
    <div class="customer-list"></div>
    <div class="customer-selector-footer">
      <button class="btn btn-select" disabled>Select</button>
      <button class="btn btn-cancel">Cancel</button>
    </div>
  `;
  
  // Create new customer form
  const newCustomerFormEl = document.createElement('div');
  newCustomerFormEl.className = 'new-customer-form';
  newCustomerFormEl.style.display = 'none';
  newCustomerFormEl.innerHTML = `
    <h3>New Customer</h3>
    <form>
      <div class="form-group">
        <label for="customer-name">Name</label>
        <input type="text" id="customer-name" required>
      </div>
      <div class="form-group">
        <label for="customer-email">Email</label>
        <input type="email" id="customer-email">
      </div>
      <div class="form-group">
        <label for="customer-phone">Phone</label>
        <input type="tel" id="customer-phone">
      </div>
      <div class="form-buttons">
        <button type="submit" class="btn btn-save">Save</button>
        <button type="button" class="btn btn-cancel-new">Cancel</button>
      </div>
    </form>
  `;
  
  // Append to container
  container.appendChild(componentEl);
  container.appendChild(newCustomerFormEl);
  
  // Get element references
  const customerListEl = componentEl.querySelector('.customer-list');
  const customerSearchEl = componentEl.querySelector('.customer-search-input');
  const selectButton = componentEl.querySelector('.btn-select');
  const cancelButton = componentEl.querySelector('.btn-cancel');
  const newCustomerButton = componentEl.querySelector('.btn-new-customer');
  const newCustomerForm = newCustomerFormEl.querySelector('form');
  const cancelNewButton = newCustomerFormEl.querySelector('.btn-cancel-new');
  
  // Render customer list
  function renderCustomerList(filteredCustomers = null) {
    const customersToRender = filteredCustomers || customers;
    
    customerListEl.innerHTML = '';
    
    if (customersToRender.length === 0) {
      customerListEl.innerHTML = '<p class="no-customers">No customers found</p>';
      return;
    }
    
    customersToRender.forEach(customer => {
      const customerEl = document.createElement('div');
      customerEl.className = 'customer-item';
      customerEl.dataset.id = customer.id;
      
      if (selectedCustomerId === customer.id) {
        customerEl.classList.add('selected');
      }
      
      customerEl.innerHTML = `
        <div class="customer-info">
          <div class="customer-name">${customer.name}</div>
          <div class="customer-details">
            ${customer.email ? `<span class="customer-email">${customer.email}</span>` : ''}
            ${customer.phone ? `<span class="customer-phone">${customer.phone}</span>` : ''}
          </div>
        </div>
      `;
      
      customerEl.addEventListener('click', () => {
        selectCustomer(customer.id);
      });
      
      customerListEl.appendChild(customerEl);
    });
  }
  
  // Select a customer
  function selectCustomer(customerId) {
    selectedCustomerId = customerId;
    
    // Update UI
    document.querySelectorAll('.customer-item').forEach(el => {
      el.classList.remove('selected');
    });
    
    document.querySelector(`.customer-item[data-id="${customerId}"]`)?.classList.add('selected');
    
    // Enable select button
    selectButton.disabled = !selectedCustomerId;
  }
  
  // Filter customers
  function filterCustomers(searchText) {
    if (!searchText || searchText.trim() === '') {
      return customers;
    }
    
    const query = searchText.toLowerCase().trim();
    
    return customers.filter(customer => {
      // Search by name
      if (customer.name.toLowerCase().includes(query)) return true;
      
      // Search by email
      if (customer.email && customer.email.toLowerCase().includes(query)) return true;
      
      // Search by phone
      if (customer.phone && customer.phone.toLowerCase().includes(query)) return true;
      
      return false;
    });
  }
  
  // Load customers from storage
  function loadCustomers() {
    try {
      customers = getCustomers();
      customers.sort((a, b) => a.name.localeCompare(b.name));
      renderCustomerList();
      return customers;
    } catch (error) {
      console.error('Error loading customers:', error);
      return [];
    }
  }
  
  // Show new customer form
  function showNewCustomerForm() {
    componentEl.style.display = 'none';
    newCustomerFormEl.style.display = 'block';
    
    // Clear form
    newCustomerForm.reset();
    newCustomerForm.querySelector('#customer-name').focus();
  }
  
  // Hide new customer form
  function hideNewCustomerForm() {
    newCustomerFormEl.style.display = 'none';
    componentEl.style.display = 'block';
  }
  
  // Create new customer
  function createNewCustomer(formData) {
    const customer = createCustomer({
      name: formData.name,
      email: formData.email,
      phone: formData.phone
    });
    
    saveCustomer(customer);
    
    // Reload customers and select the new one
    loadCustomers();
    selectCustomer(customer.id);
    
    return customer;
  }
  
  // Attach event listeners
  customerSearchEl.addEventListener('input', (e) => {
    const searchText = e.target.value;
    const filteredCustomers = filterCustomers(searchText);
    renderCustomerList(filteredCustomers);
  });
  
  selectButton.addEventListener('click', () => {
    if (!selectedCustomerId) return;
    
    const selectedCustomer = customers.find(c => c.id === selectedCustomerId);
    
    if (selectedCustomer) {
      // Dispatch custom event with selected customer
      const event = new CustomEvent('customerSelected', {
        detail: { customer: selectedCustomer }
      });
      container.dispatchEvent(event);
    }
  });
  
  cancelButton.addEventListener('click', () => {
    // Dispatch cancel event
    const event = new CustomEvent('customerSelectionCancelled');
    container.dispatchEvent(event);
  });
  
  newCustomerButton.addEventListener('click', showNewCustomerForm);
  
  cancelNewButton.addEventListener('click', hideNewCustomerForm);
  
  newCustomerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
      name: newCustomerForm.querySelector('#customer-name').value,
      email: newCustomerForm.querySelector('#customer-email').value,
      phone: newCustomerForm.querySelector('#customer-phone').value
    };
    
    if (!formData.name) {
      alert('Customer name is required');
      return;
    }
    
    createNewCustomer(formData);
    hideNewCustomerForm();
    
    // Dispatch custom event with created customer
    const customer = customers.find(c => c.id === selectedCustomerId);
    
    if (customer) {
      const event = new CustomEvent('customerCreated', {
        detail: { customer }
      });
      container.dispatchEvent(event);
    }
  });
  
  // Initialize component
  loadCustomers();
  
  // Public API
  return {
    reload: loadCustomers,
    getSelectedCustomer: () => customers.find(c => c.id === selectedCustomerId),
    selectCustomer,
    show: () => {
      componentEl.style.display = 'block';
      newCustomerFormEl.style.display = 'none';
    },
    hide: () => {
      componentEl.style.display = 'none';
      newCustomerFormEl.style.display = 'none';
    },
    
    // Add event listeners
    on: (event, callback) => {
      container.addEventListener(event, callback);
    },
    
    // Clean up resources
    destroy: () => {
      if (componentEl.parentNode) {
        componentEl.parentNode.removeChild(componentEl);
      }
      
      if (newCustomerFormEl.parentNode) {
        newCustomerFormEl.parentNode.removeChild(newCustomerFormEl);
      }
    }
  };
}

export default CustomerSelector; 