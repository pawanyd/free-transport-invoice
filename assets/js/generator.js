/**
 * Document Generator Module
 * Generates bilty (consignment notes) and invoice documents from freight details
 * Requirements: 4.1, 4.2, 5.1, 5.2, 5.3, 6.1, 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { DocumentConfig } from './config.js';

/**
 * DocumentGenerator class
 * Handles generation of bilty and invoice documents with company branding
 */
export class DocumentGenerator {
  constructor() {
    this.config = DocumentConfig;
  }

  /**
   * Generate a unique document number using timestamp and random suffix
   * @returns {string} Unique document number
   */
  generateDocumentNumber() {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${timestamp}${random}`;
  }

  /**
   * Format date as YYYY-MM-DD
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Calculate invoice totals
   * @param {number} amount - Base freight charge
   * @param {number} discount - Discount amount
   * @param {number} taxes - Tax amount
   * @returns {object} Object containing subtotal, discount, taxes, and total
   */
  calculateTotals(amount, discount, taxes) {
    const subtotal = Number(amount) || 0;
    const discountAmount = Number(discount) || 0;
    const taxAmount = Number(taxes) || 0;
    const total = (subtotal - discountAmount) + taxAmount;

    return {
      subtotal: subtotal,
      discount: discountAmount,
      taxes: taxAmount,
      total: total
    };
  }

  /**
   * Create document header with company branding
   * @returns {HTMLElement} Header element
   */
  createDocumentHeader() {
    const header = document.createElement('div');
    header.className = 'document-header';
    
    header.innerHTML = `
      <div class="flex justify-between items-start">
        <div>
          <img src="${this.config.logoUrl}" alt="Company Logo" class="company-logo mb-2" />
          <h1 class="text-2xl font-bold">${this.config.companyName}</h1>
          <p class="text-sm text-gray-600">${this.config.companyAddress}</p>
        </div>
      </div>
    `;
    
    return header;
  }

  /**
   * Create document footer with signature and seal
   * @returns {HTMLElement} Footer element
   */
  createDocumentFooter() {
    const footer = document.createElement('div');
    footer.className = 'document-footer';
    
    footer.innerHTML = `
      <div class="flex justify-between items-end mt-4">
        <div class="text-center">
          <img src="${this.config.signatureUrl}" alt="Authorized Signature" class="company-signature mb-2" />
          <p class="text-sm font-semibold">Authorized Signature</p>
        </div>
        <div class="text-center">
          <img src="${this.config.sealUrl}" alt="Company Seal" class="company-seal mb-2" />
          <p class="text-sm font-semibold">Company Seal</p>
        </div>
      </div>
    `;
    
    return footer;
  }

  /**
   * Create eWay bill section if eWay bill information is provided
   * @param {object} freightDetails - Freight details containing eWay bill info
   * @returns {string} HTML string for eWay bill section or empty string
   */
  createEwayBillSection(freightDetails) {
    if (!freightDetails.ewayBillNumber) {
      return '';
    }

    return `
      <div class="mt-4 p-3 bg-gray-50 border border-gray-300 rounded">
        <h3 class="font-bold text-lg mb-2">eWay Bill Information</h3>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <span class="font-semibold">eWay Bill Number:</span>
            <span class="ml-2">${freightDetails.ewayBillNumber}</span>
          </div>
          ${freightDetails.ewayBillDate ? `
          <div>
            <span class="font-semibold">eWay Bill Date:</span>
            <span class="ml-2">${freightDetails.ewayBillDate}</span>
          </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Generate bilty (consignment note) document
   * @param {object} freightDetails - Freight shipment details
   * @returns {HTMLElement} Bilty document as HTML element
   */
  generateBilty(freightDetails) {
    // Validate freight details are not null/undefined
    if (!freightDetails) {
      console.error('Cannot generate bilty: freight details are missing');
      return null;
    }

    // Validate required fields
    if (!freightDetails.origin || !freightDetails.destination || !freightDetails.goodsDescription) {
      console.error('Cannot generate bilty: required fields are missing', freightDetails);
      return null;
    }

    const container = document.createElement('div');
    container.className = 'document-container';
    
    const documentNumber = this.generateDocumentNumber();
    const currentDate = this.formatDate();
    
    // Create header
    const header = this.createDocumentHeader();
    container.appendChild(header);
    
    // Create bilty content
    const content = document.createElement('div');
    content.className = 'document-content';
    
    content.innerHTML = `
      <div class="text-center mb-4">
        <h2 class="text-3xl font-bold">CONSIGNMENT NOTE (BILTY)</h2>
        <p class="text-sm text-gray-600">Document No: ${documentNumber}</p>
        <p class="text-sm text-gray-600">Date: ${currentDate}</p>
      </div>
      
      <div class="mb-4">
        <h3 class="font-bold text-lg mb-2 bg-gray-100 p-2">Consignment Details</h3>
        <table class="document-table">
          <tr>
            <td class="font-semibold" style="width: 30%;">Origin:</td>
            <td>${freightDetails.origin || 'N/A'}</td>
          </tr>
          <tr>
            <td class="font-semibold">Destination:</td>
            <td>${freightDetails.destination || 'N/A'}</td>
          </tr>
          <tr>
            <td class="font-semibold">Goods Description:</td>
            <td>${freightDetails.goodsDescription || 'N/A'}</td>
          </tr>
          <tr>
            <td class="font-semibold">Weight (kg):</td>
            <td>${freightDetails.weight || 'N/A'}</td>
          </tr>
        </table>
      </div>
      
      <div class="mb-4">
        <h3 class="font-bold text-lg mb-2 bg-gray-100 p-2">Freight Information</h3>
        <table class="document-table">
          <tr>
            <td class="font-semibold" style="width: 30%;">Freight Amount:</td>
            <td>₹ ${Number(freightDetails.amount || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td class="font-semibold">Discount:</td>
            <td>₹ ${Number(freightDetails.discount || 0).toFixed(2)}</td>
          </tr>
          <tr>
            <td class="font-semibold">Taxes:</td>
            <td>₹ ${Number(freightDetails.taxes || 0).toFixed(2)}</td>
          </tr>
        </table>
      </div>
      
      ${this.createEwayBillSection(freightDetails)}
      
      <div class="mt-6 p-3 border border-gray-300 rounded">
        <h3 class="font-bold text-lg mb-2">Driver/Vehicle Information</h3>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-gray-600">Driver Name: _______________________</p>
          </div>
          <div>
            <p class="text-sm text-gray-600">Vehicle Number: _______________________</p>
          </div>
        </div>
      </div>
      
      <div class="mt-6 p-3 border border-gray-300 rounded">
        <h3 class="font-bold text-lg mb-2">Delivery Confirmation</h3>
        <div class="mt-4">
          <p class="text-sm text-gray-600">Received By: _______________________</p>
          <p class="text-sm text-gray-600 mt-2">Date: _______________________</p>
          <p class="text-sm text-gray-600 mt-2">Signature: _______________________</p>
        </div>
      </div>
    `;
    
    container.appendChild(content);
    
    // Create footer
    const footer = this.createDocumentFooter();
    container.appendChild(footer);
    
    return container;
  }

  /**
   * Generate invoice document
   * @param {object} freightDetails - Freight shipment details
   * @returns {HTMLElement} Invoice document as HTML element
   */
  generateInvoice(freightDetails) {
    // Validate freight details are not null/undefined
    if (!freightDetails) {
      console.error('Cannot generate invoice: freight details are missing');
      return null;
    }

    // Validate required fields
    if (!freightDetails.origin || !freightDetails.destination || !freightDetails.goodsDescription) {
      console.error('Cannot generate invoice: required fields are missing', freightDetails);
      return null;
    }

    const container = document.createElement('div');
    container.className = 'document-container';
    
    const documentNumber = this.generateDocumentNumber();
    const currentDate = this.formatDate();
    const totals = this.calculateTotals(
      freightDetails.amount,
      freightDetails.discount,
      freightDetails.taxes
    );
    
    // Create header
    const header = this.createDocumentHeader();
    container.appendChild(header);
    
    // Create invoice content
    const content = document.createElement('div');
    content.className = 'document-content';
    
    content.innerHTML = `
      <div class="text-center mb-4">
        <h2 class="text-3xl font-bold">FREIGHT INVOICE</h2>
        <p class="text-sm text-gray-600">Invoice No: ${documentNumber}</p>
        <p class="text-sm text-gray-600">Date: ${currentDate}</p>
      </div>
      
      <div class="mb-4">
        <h3 class="font-bold text-lg mb-2 bg-gray-100 p-2">Shipment Details</h3>
        <table class="document-table">
          <tr>
            <td class="font-semibold" style="width: 30%;">Origin:</td>
            <td>${freightDetails.origin || 'N/A'}</td>
          </tr>
          <tr>
            <td class="font-semibold">Destination:</td>
            <td>${freightDetails.destination || 'N/A'}</td>
          </tr>
          <tr>
            <td class="font-semibold">Goods Description:</td>
            <td>${freightDetails.goodsDescription || 'N/A'}</td>
          </tr>
          <tr>
            <td class="font-semibold">Weight (kg):</td>
            <td>${freightDetails.weight || 'N/A'}</td>
          </tr>
        </table>
      </div>
      
      <div class="mb-4">
        <h3 class="font-bold text-lg mb-2 bg-gray-100 p-2">Itemized Charges</h3>
        <table class="document-table">
          <thead>
            <tr>
              <th>Description</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Freight Charges</td>
              <td class="text-right">₹ ${totals.subtotal.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Discount</td>
              <td class="text-right">- ₹ ${totals.discount.toFixed(2)}</td>
            </tr>
            <tr>
              <td>Taxes (GST/Other)</td>
              <td class="text-right">₹ ${totals.taxes.toFixed(2)}</td>
            </tr>
            <tr class="font-bold bg-gray-100">
              <td>Total Amount Due</td>
              <td class="text-right">₹ ${totals.total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>
      
      ${this.createEwayBillSection(freightDetails)}
      
      <div class="mt-6 p-3 bg-blue-50 border border-blue-300 rounded">
        <h3 class="font-bold text-lg mb-2">Payment Terms</h3>
        <p class="text-sm">Payment due within 30 days of invoice date.</p>
        <p class="text-sm mt-1">Please make payment to: ${this.config.companyName}</p>
      </div>
    `;
    
    container.appendChild(content);
    
    // Create footer
    const footer = this.createDocumentFooter();
    container.appendChild(footer);
    
    return container;
  }

  /**
   * Generate both bilty and invoice documents
   * @param {object} freightDetails - Freight shipment details
   * @returns {object} Object containing both bilty and invoice HTML elements
   */
  generateBoth(freightDetails) {
    // Validate freight details are not null/undefined
    if (!freightDetails) {
      console.error('Cannot generate documents: freight details are missing');
      return { bilty: null, invoice: null };
    }

    // Validate required fields
    if (!freightDetails.origin || !freightDetails.destination || !freightDetails.goodsDescription) {
      console.error('Cannot generate documents: required fields are missing', freightDetails);
      return { bilty: null, invoice: null };
    }

    const bilty = this.generateBilty(freightDetails);
    const invoice = this.generateInvoice(freightDetails);
    
    return {
      bilty: bilty,
      invoice: invoice
    };
  }
}

// Default export for convenience
export default DocumentGenerator;
