/**
 * UI Controller Module
 * Coordinates UI interactions and application flow
 * Requirements: 2.1, 2.5, 4.4, 5.5, 6.3, 10.3, 10.5, 12.3
 */

import AuthManager from './auth.js';
import { FormValidator } from './validator.js';
import DataStoreManager from './datastore.js';
import { DocumentGenerator } from './generator.js';
import { PDFExporter } from './pdf-exporter.js';

/**
 * UIController class
 * Manages all UI interactions and coordinates between modules
 */
export class UIController {
  constructor() {
    this.authManager = new AuthManager();
    this.formValidator = new FormValidator();
    this.dataStore = new DataStoreManager();
    this.documentGenerator = new DocumentGenerator();
    this.pdfExporter = new PDFExporter();
    
    this.currentFreightId = null;
    this.currentFreightDetails = null;
    this.initialized = false;
  }

  /**
   * Initialize application and set up event listeners
   */
  async init() {
    try {
      // Check for expired session and redirect to login
      if (!this.authManager.isAuthenticated()) {
        console.warn('User not authenticated, redirecting to login');
        
        // Optionally preserve form data in LocalStorage to restore after re-login
        const formData = this.collectFormData();
        if (this.hasFormData(formData)) {
          localStorage.setItem('preservedFormData', JSON.stringify(formData));
        }
        
        window.location.href = 'login.html';
        return;
      }

      // Initialize data store
      const initResult = await this.dataStore.initialize();
      
      if (!initResult.success) {
        // Handle database initialization failures with try-catch
        console.error('Database initialization error:', initResult.error);
        this.showError(`Failed to initialize database: ${initResult.error || 'Unknown error'}. Please refresh the page.`);
        return;
      }
      
      this.initialized = true;

      // Restore preserved form data if available
      this.restoreFormData();

      // Set up event listeners
      this.setupEventListeners();
      
      console.log('UIController initialized successfully');
    } catch (error) {
      console.error('Failed to initialize UIController:', error);
      this.showError('Failed to initialize application. Please refresh the page.');
    }
  }

  /**
   * Set up all event listeners for UI elements
   */
  setupEventListeners() {
    // Form submission
    const freightForm = document.getElementById('freightForm');
    if (freightForm) {
      freightForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Document generation buttons
    const generateBilty = document.getElementById('generateBilty');
    if (generateBilty) {
      generateBilty.addEventListener('click', () => this.handleGenerateDocument('bilty'));
    }

    const generateInvoice = document.getElementById('generateInvoice');
    if (generateInvoice) {
      generateInvoice.addEventListener('click', () => this.handleGenerateDocument('invoice'));
    }

    const generateBoth = document.getElementById('generateBoth');
    if (generateBoth) {
      generateBoth.addEventListener('click', () => this.handleGenerateDocument('both'));
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.handleLogout());
    }

    // Real-time validation on blur
    this.setupFieldValidation();
  }

  /**
   * Set up real-time validation for form fields
   */
  setupFieldValidation() {
    const fields = ['origin', 'destination', 'goodsDescription', 'weight', 'amount', 'discount', 'taxes', 'ewayBillNumber'];
    
    fields.forEach(fieldName => {
      const field = document.getElementById(fieldName);
      if (field) {
        // Validate on blur
        field.addEventListener('blur', () => {
          this.validateSingleField(fieldName, field.value);
        });

        // Clear errors on input
        field.addEventListener('input', () => {
          this.clearFieldError(fieldName);
        });
      }
    });
  }

  /**
   * Validate a single field and display error if invalid
   */
  validateSingleField(fieldName, value) {
    const validation = this.formValidator.validateField(fieldName, value);
    
    if (!validation.valid) {
      this.showFieldError(fieldName, validation.error);
    } else {
      this.clearFieldError(fieldName);
    }
  }

  /**
   * Show error for a specific field
   */
  showFieldError(fieldName, errorMessage) {
    const field = document.getElementById(fieldName);
    if (!field) return;

    // Add error class to field
    field.classList.add('field-error');

    // Create or update error message element
    let errorElement = field.parentElement.querySelector('.error-message');
    if (!errorElement) {
      errorElement = document.createElement('div');
      errorElement.className = 'error-message';
      field.parentElement.appendChild(errorElement);
    }
    errorElement.textContent = errorMessage;
  }

  /**
   * Clear error for a specific field
   */
  clearFieldError(fieldName) {
    const field = document.getElementById(fieldName);
    if (!field) return;

    // Remove error class
    field.classList.remove('field-error');

    // Remove error message element
    const errorElement = field.parentElement.querySelector('.error-message');
    if (errorElement) {
      errorElement.remove();
    }
  }

  /**
   * Handle form submission
   */
  async handleFormSubmit(event) {
    event.preventDefault();

    // Clear previous messages
    this.clearValidationErrors();
    this.hideSuccessMessage();
    this.hideErrorMessage();

    // Collect form data
    const formData = this.collectFormData();

    // Validate form data
    const validation = this.formValidator.validateFreightForm(formData);

    if (!validation.valid) {
      // Show validation errors
      this.showValidationErrors(validation.errors);
      this.showError('Please correct the errors before submitting.');
      return;
    }

    // Add user ID to form data
    const userId = this.authManager.getUserId();
    if (!userId) {
      this.showError('Session expired. Please log in again.');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 2000);
      return;
    }

    formData.userId = userId;

    // Save to data store
    const result = this.dataStore.saveFreightDetails(formData);

    if (result.success) {
      this.currentFreightId = result.id;
      this.currentFreightDetails = formData;
      
      this.showSuccessMessage('Freight details saved successfully!');
      this.enableDocumentGeneration();
      
      // Optionally clear form - for now, keep data for reference
      // this.clearForm();
    } else {
      // Display error message for save failures
      console.error('Data storage error:', result.error);
      this.showError(`Failed to save freight details: ${result.error || 'Unknown error'}`);
      
      // Preserve form data on errors (don't clear form)
      // Form data is already in the fields, so no action needed
    }
  }

  /**
   * Collect form data into FreightDetails object
   */
  collectFormData() {
    return {
      origin: document.getElementById('origin')?.value || '',
      destination: document.getElementById('destination')?.value || '',
      goodsDescription: document.getElementById('goodsDescription')?.value || '',
      weight: parseFloat(document.getElementById('weight')?.value) || 0,
      amount: parseFloat(document.getElementById('amount')?.value) || 0,
      discount: parseFloat(document.getElementById('discount')?.value) || 0,
      taxes: parseFloat(document.getElementById('taxes')?.value) || 0,
      ewayBillNumber: document.getElementById('ewayBillNumber')?.value || null,
      ewayBillDate: document.getElementById('ewayBillDate')?.value || null
    };
  }

  /**
   * Show validation errors with field highlighting
   */
  showValidationErrors(errors) {
    errors.forEach(error => {
      this.showFieldError(error.field, error.message);
    });
  }

  /**
   * Clear all validation errors
   */
  clearValidationErrors() {
    const fields = ['origin', 'destination', 'goodsDescription', 'weight', 'amount', 'discount', 'taxes', 'ewayBillNumber'];
    
    fields.forEach(fieldName => {
      this.clearFieldError(fieldName);
    });
  }

  /**
   * Show success message
   */
  showSuccessMessage(message) {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
      successDiv.textContent = message;
      successDiv.classList.remove('hidden');
      
      // Auto-hide after 5 seconds
      setTimeout(() => {
        this.hideSuccessMessage();
      }, 5000);
    }
  }

  /**
   * Hide success message
   */
  hideSuccessMessage() {
    const successDiv = document.getElementById('successMessage');
    if (successDiv) {
      successDiv.classList.add('hidden');
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorDiv = document.getElementById('errorMessages');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.classList.remove('hidden');
    }
  }

  /**
   * Hide error message
   */
  hideErrorMessage() {
    const errorDiv = document.getElementById('errorMessages');
    if (errorDiv) {
      errorDiv.classList.add('hidden');
    }
  }

  /**
   * Enable document generation buttons
   */
  enableDocumentGeneration() {
    const documentActions = document.getElementById('documentActions');
    if (documentActions) {
      documentActions.classList.remove('hidden');
    }
  }

  /**
   * Handle document generation
   */
  async handleGenerateDocument(type) {
    if (!this.currentFreightDetails) {
      this.showError('No freight details found. Please fill in the form first.');
      return;
    }

    // Show loading indicator
    this.showLoadingIndicator(type);

    try {
      let documents = {};

      switch (type) {
        case 'bilty':
          const bilty = this.documentGenerator.generateBilty(this.currentFreightDetails);
          // Check for null documents and show error
          if (!bilty) {
            this.showError('Failed to generate document. Please check that all required fields are filled.');
            this.hideLoadingIndicator();
            return;
          }
          documents.bilty = bilty;
          break;

        case 'invoice':
          const invoice = this.documentGenerator.generateInvoice(this.currentFreightDetails);
          // Check for null documents and show error
          if (!invoice) {
            this.showError('Failed to generate document. Please check that all required fields are filled.');
            this.hideLoadingIndicator();
            return;
          }
          documents.invoice = invoice;
          break;

        case 'both':
          const both = this.documentGenerator.generateBoth(this.currentFreightDetails);
          // Check for null documents and show error
          if (!both.bilty || !both.invoice) {
            this.showError('Failed to generate document. Please check that all required fields are filled.');
            this.hideLoadingIndicator();
            return;
          }
          documents.bilty = both.bilty;
          documents.invoice = both.invoice;
          break;

        default:
          this.showError('Invalid document type');
          this.hideLoadingIndicator();
          return;
      }

      // Check if documents were generated
      if (Object.keys(documents).length === 0) {
        this.showError('Failed to generate document');
        this.hideLoadingIndicator();
        return;
      }

      // Display document preview
      this.showDocumentPreview(documents);
      
      // Hide loading indicator
      this.hideLoadingIndicator();

    } catch (error) {
      console.error('Document generation error:', error);
      this.showError('Failed to generate document. Please try again.');
      this.hideLoadingIndicator();
    }
  }

  /**
   * Show document preview
   */
  showDocumentPreview(documents) {
    const previewContent = document.getElementById('previewContent');
    const documentPreview = document.getElementById('documentPreview');

    if (!previewContent || !documentPreview) return;

    // Clear previous content
    previewContent.innerHTML = '';

    // Add each document to preview
    Object.keys(documents).forEach(type => {
      const documentWrapper = document.createElement('div');
      documentWrapper.className = 'document-preview-wrapper mb-6';

      // Create header with download button
      const header = document.createElement('div');
      header.className = 'flex justify-between items-center mb-4';
      
      const title = document.createElement('h4');
      title.className = 'text-lg font-semibold capitalize';
      title.textContent = `${type} Document`;
      
      const downloadBtn = document.createElement('button');
      downloadBtn.className = 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2';
      downloadBtn.innerHTML = `
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
        </svg>
        Download ${type.toUpperCase()} PDF
      `;
      
      // Add click handler for PDF download
      downloadBtn.addEventListener('click', () => this.handlePDFDownload(documents[type], type));
      
      header.appendChild(title);
      header.appendChild(downloadBtn);
      
      // Add document content
      const documentContent = document.createElement('div');
      documentContent.className = 'border border-gray-300 rounded p-4 bg-white';
      documentContent.appendChild(documents[type].cloneNode(true));
      
      documentWrapper.appendChild(header);
      documentWrapper.appendChild(documentContent);
      previewContent.appendChild(documentWrapper);
    });

    // Show preview section
    documentPreview.classList.remove('hidden');
  }

  /**
   * Handle PDF download
   */
  async handlePDFDownload(documentElement, type) {
    try {
      // Show loading indicator
      this.showLoadingIndicator('pdf');

      // Generate filename
      const filename = this.pdfExporter.generateFilename(type, this.currentFreightId || Date.now());

      // Export to PDF
      await this.pdfExporter.exportToPDF(documentElement, filename);

      // Hide loading indicator
      this.hideLoadingIndicator();

      this.showSuccessMessage(`${type.toUpperCase()} PDF downloaded successfully!`);

    } catch (error) {
      console.error('PDF export error:', error);
      this.hideLoadingIndicator();
      
      // On PDF error, show message and offer HTML preview as fallback
      this.showError('Failed to generate PDF. Please try again. You can still view the HTML preview below.');
      
      // Optionally, offer to open HTML in new window as fallback
      const openHtmlFallback = confirm('PDF generation failed. Would you like to open the document in a new window instead?');
      if (openHtmlFallback) {
        this.openDocumentInNewWindow(documentElement, type);
      }
    }
  }

  /**
   * Open document in new window as fallback when PDF fails
   */
  openDocumentInNewWindow(documentElement, type) {
    try {
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${type.toUpperCase()} Document</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <link rel="stylesheet" href="assets/css/styles.css">
          </head>
          <body class="p-8">
            ${documentElement.outerHTML}
          </body>
          </html>
        `);
        newWindow.document.close();
      } else {
        this.showError('Failed to open document in new window. Please check your popup blocker settings.');
      }
    } catch (error) {
      console.error('Failed to open document in new window:', error);
      this.showError('Failed to open document in new window.');
    }
  }

  /**
   * Show loading indicator
   */
  showLoadingIndicator(context) {
    // Create loading overlay if it doesn't exist
    let loadingOverlay = document.getElementById('loadingOverlay');
    
    if (!loadingOverlay) {
      loadingOverlay = document.createElement('div');
      loadingOverlay.id = 'loadingOverlay';
      loadingOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
      loadingOverlay.innerHTML = `
        <div class="bg-white rounded-lg p-6 flex flex-col items-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
          <p class="text-gray-700 font-semibold">Generating document...</p>
        </div>
      `;
      document.body.appendChild(loadingOverlay);
    } else {
      loadingOverlay.classList.remove('hidden');
    }
  }

  /**
   * Hide loading indicator
   */
  hideLoadingIndicator() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  }

  /**
   * Handle logout
   */
  handleLogout() {
    this.authManager.logout();
    window.location.href = 'login.html';
  }

  /**
   * Clear form fields
   */
  clearForm() {
    const form = document.getElementById('freightForm');
    if (form) {
      form.reset();
    }
    this.clearValidationErrors();
  }

  /**
   * Check if form data has any values
   */
  hasFormData(formData) {
    return formData.origin || formData.destination || formData.goodsDescription || 
           formData.weight > 0 || formData.amount > 0;
  }

  /**
   * Restore preserved form data after re-login
   */
  restoreFormData() {
    try {
      const preservedData = localStorage.getItem('preservedFormData');
      if (preservedData) {
        const formData = JSON.parse(preservedData);
        
        // Restore form fields
        if (formData.origin) document.getElementById('origin').value = formData.origin;
        if (formData.destination) document.getElementById('destination').value = formData.destination;
        if (formData.goodsDescription) document.getElementById('goodsDescription').value = formData.goodsDescription;
        if (formData.weight) document.getElementById('weight').value = formData.weight;
        if (formData.amount) document.getElementById('amount').value = formData.amount;
        if (formData.discount) document.getElementById('discount').value = formData.discount;
        if (formData.taxes) document.getElementById('taxes').value = formData.taxes;
        if (formData.ewayBillNumber) document.getElementById('ewayBillNumber').value = formData.ewayBillNumber;
        if (formData.ewayBillDate) document.getElementById('ewayBillDate').value = formData.ewayBillDate;
        
        // Clear preserved data
        localStorage.removeItem('preservedFormData');
        
        // Show message to user
        this.showSuccessMessage('Your form data has been restored after session expiration.');
      }
    } catch (error) {
      console.error('Failed to restore form data:', error);
      localStorage.removeItem('preservedFormData');
    }
  }

  /**
   * Show login screen (not used in current implementation)
   */
  showLoginScreen() {
    window.location.href = 'login.html';
  }

  /**
   * Show main form (not used in current implementation)
   */
  showMainForm() {
    // Main form is already visible in index.html
    console.log('Main form displayed');
  }
}

// Initialize and export
export default UIController;
