/**
 * Unit tests for DocumentGenerator
 * Tests document generation functionality
 */

import { DocumentGenerator } from '../assets/js/generator.js';
import { DocumentConfig } from '../assets/js/config.js';

describe('DocumentGenerator', () => {
  let generator;
  let sampleFreightDetails;

  beforeEach(() => {
    generator = new DocumentGenerator();
    
    // Sample freight details for testing
    sampleFreightDetails = {
      origin: 'Mumbai, Maharashtra',
      destination: 'Delhi, NCR',
      goodsDescription: 'Electronic goods - Laptops and accessories',
      weight: 150.5,
      amount: 15000,
      discount: 500,
      taxes: 2700,
      ewayBillNumber: 'EWB123456789012',
      ewayBillDate: '2024-01-15'
    };
  });

  describe('calculateTotals', () => {
    test('calculates invoice total correctly with discount and taxes', () => {
      const result = generator.calculateTotals(1000, 100, 180);
      
      expect(result.subtotal).toBe(1000);
      expect(result.discount).toBe(100);
      expect(result.taxes).toBe(180);
      expect(result.total).toBe(1080); // (1000 - 100) + 180
    });

    test('handles zero discount and zero taxes', () => {
      const result = generator.calculateTotals(1000, 0, 0);
      
      expect(result.subtotal).toBe(1000);
      expect(result.discount).toBe(0);
      expect(result.taxes).toBe(0);
      expect(result.total).toBe(1000);
    });

    test('handles string inputs by converting to numbers', () => {
      const result = generator.calculateTotals('1000', '100', '180');
      
      expect(result.total).toBe(1080);
    });

    test('handles undefined values as zero', () => {
      const result = generator.calculateTotals(1000, undefined, undefined);
      
      expect(result.subtotal).toBe(1000);
      expect(result.discount).toBe(0);
      expect(result.taxes).toBe(0);
      expect(result.total).toBe(1000);
    });
  });

  describe('generateDocumentNumber', () => {
    test('generates unique document numbers', () => {
      const num1 = generator.generateDocumentNumber();
      const num2 = generator.generateDocumentNumber();
      
      expect(num1).not.toBe(num2);
      expect(typeof num1).toBe('string');
      expect(typeof num2).toBe('string');
    });

    test('generates document numbers with correct format', () => {
      const num = generator.generateDocumentNumber();
      
      // Should be timestamp (13 digits) + random (3 digits) = 16 characters
      expect(num.length).toBeGreaterThanOrEqual(16);
    });
  });

  describe('formatDate', () => {
    test('formats date as YYYY-MM-DD', () => {
      const date = new Date('2024-01-15');
      const formatted = generator.formatDate(date);
      
      expect(formatted).toBe('2024-01-15');
    });

    test('uses current date when no date provided', () => {
      const formatted = generator.formatDate();
      
      // Should match YYYY-MM-DD pattern
      expect(formatted).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('generateBilty', () => {
    test('generates bilty document with all freight details', () => {
      const bilty = generator.generateBilty(sampleFreightDetails);
      
      expect(bilty).not.toBeNull();
      expect(bilty.className).toBe('document-container');
      
      const html = bilty.innerHTML;
      expect(html).toContain('CONSIGNMENT NOTE (BILTY)');
      expect(html).toContain(sampleFreightDetails.origin);
      expect(html).toContain(sampleFreightDetails.destination);
      expect(html).toContain(sampleFreightDetails.goodsDescription);
      expect(html).toContain(String(sampleFreightDetails.weight));
      expect(html).toContain(String(sampleFreightDetails.amount));
    });

    test('includes company branding elements', () => {
      const bilty = generator.generateBilty(sampleFreightDetails);
      const html = bilty.innerHTML;
      
      expect(html).toContain(DocumentConfig.companyName);
      expect(html).toContain(DocumentConfig.companyAddress);
      expect(html).toContain(DocumentConfig.logoUrl);
      expect(html).toContain(DocumentConfig.signatureUrl);
      expect(html).toContain(DocumentConfig.sealUrl);
    });

    test('includes eWay bill information when provided', () => {
      const bilty = generator.generateBilty(sampleFreightDetails);
      const html = bilty.innerHTML;
      
      expect(html).toContain('eWay Bill Information');
      expect(html).toContain(sampleFreightDetails.ewayBillNumber);
      expect(html).toContain(sampleFreightDetails.ewayBillDate);
    });

    test('handles missing eWay bill gracefully', () => {
      const detailsWithoutEway = { ...sampleFreightDetails };
      delete detailsWithoutEway.ewayBillNumber;
      delete detailsWithoutEway.ewayBillDate;
      
      const bilty = generator.generateBilty(detailsWithoutEway);
      const html = bilty.innerHTML;
      
      expect(html).not.toContain('eWay Bill Information');
    });

    test('returns null for missing freight details', () => {
      const bilty = generator.generateBilty(null);
      
      expect(bilty).toBeNull();
    });

    test('includes driver/vehicle information section', () => {
      const bilty = generator.generateBilty(sampleFreightDetails);
      const html = bilty.innerHTML;
      
      expect(html).toContain('Driver/Vehicle Information');
      expect(html).toContain('Driver Name:');
      expect(html).toContain('Vehicle Number:');
    });

    test('includes delivery confirmation section', () => {
      const bilty = generator.generateBilty(sampleFreightDetails);
      const html = bilty.innerHTML;
      
      expect(html).toContain('Delivery Confirmation');
      expect(html).toContain('Received By:');
    });
  });

  describe('generateInvoice', () => {
    test('generates invoice document with all freight details', () => {
      const invoice = generator.generateInvoice(sampleFreightDetails);
      
      expect(invoice).not.toBeNull();
      expect(invoice.className).toBe('document-container');
      
      const html = invoice.innerHTML;
      expect(html).toContain('FREIGHT INVOICE');
      expect(html).toContain(sampleFreightDetails.origin);
      expect(html).toContain(sampleFreightDetails.destination);
      expect(html).toContain(sampleFreightDetails.goodsDescription);
      expect(html).toContain(String(sampleFreightDetails.weight));
    });

    test('includes company branding elements', () => {
      const invoice = generator.generateInvoice(sampleFreightDetails);
      const html = invoice.innerHTML;
      
      expect(html).toContain(DocumentConfig.companyName);
      expect(html).toContain(DocumentConfig.companyAddress);
      expect(html).toContain(DocumentConfig.logoUrl);
      expect(html).toContain(DocumentConfig.signatureUrl);
      expect(html).toContain(DocumentConfig.sealUrl);
    });

    test('calculates and displays correct totals', () => {
      const invoice = generator.generateInvoice(sampleFreightDetails);
      const html = invoice.innerHTML;
      
      const expectedTotal = (15000 - 500) + 2700; // 17200
      expect(html).toContain('15000.00'); // Subtotal
      expect(html).toContain('500.00'); // Discount
      expect(html).toContain('2700.00'); // Taxes
      expect(html).toContain('17200.00'); // Total
    });

    test('includes eWay bill information when provided', () => {
      const invoice = generator.generateInvoice(sampleFreightDetails);
      const html = invoice.innerHTML;
      
      expect(html).toContain('eWay Bill Information');
      expect(html).toContain(sampleFreightDetails.ewayBillNumber);
      expect(html).toContain(sampleFreightDetails.ewayBillDate);
    });

    test('handles missing eWay bill gracefully', () => {
      const detailsWithoutEway = { ...sampleFreightDetails };
      delete detailsWithoutEway.ewayBillNumber;
      delete detailsWithoutEway.ewayBillDate;
      
      const invoice = generator.generateInvoice(detailsWithoutEway);
      const html = invoice.innerHTML;
      
      expect(html).not.toContain('eWay Bill Information');
    });

    test('returns null for missing freight details', () => {
      const invoice = generator.generateInvoice(null);
      
      expect(invoice).toBeNull();
    });

    test('includes payment terms section', () => {
      const invoice = generator.generateInvoice(sampleFreightDetails);
      const html = invoice.innerHTML;
      
      expect(html).toContain('Payment Terms');
      expect(html).toContain('Payment due within 30 days');
    });

    test('includes itemized charges breakdown', () => {
      const invoice = generator.generateInvoice(sampleFreightDetails);
      const html = invoice.innerHTML;
      
      expect(html).toContain('Itemized Charges');
      expect(html).toContain('Freight Charges');
      expect(html).toContain('Discount');
      expect(html).toContain('Taxes');
      expect(html).toContain('Total Amount Due');
    });
  });

  describe('generateBoth', () => {
    test('generates both bilty and invoice documents', () => {
      const result = generator.generateBoth(sampleFreightDetails);
      
      expect(result).toHaveProperty('bilty');
      expect(result).toHaveProperty('invoice');
      expect(result.bilty).not.toBeNull();
      expect(result.invoice).not.toBeNull();
    });

    test('both documents contain consistent freight information', () => {
      const result = generator.generateBoth(sampleFreightDetails);
      
      const biltyHtml = result.bilty.innerHTML;
      const invoiceHtml = result.invoice.innerHTML;
      
      // Check that both contain the same freight details
      expect(biltyHtml).toContain(sampleFreightDetails.origin);
      expect(invoiceHtml).toContain(sampleFreightDetails.origin);
      
      expect(biltyHtml).toContain(sampleFreightDetails.destination);
      expect(invoiceHtml).toContain(sampleFreightDetails.destination);
      
      expect(biltyHtml).toContain(sampleFreightDetails.goodsDescription);
      expect(invoiceHtml).toContain(sampleFreightDetails.goodsDescription);
    });

    test('returns null documents for missing freight details', () => {
      const result = generator.generateBoth(null);
      
      expect(result.bilty).toBeNull();
      expect(result.invoice).toBeNull();
    });
  });

  describe('edge cases', () => {
    test('handles very long goods description', () => {
      const longDescription = 'A'.repeat(500);
      const details = {
        ...sampleFreightDetails,
        goodsDescription: longDescription
      };
      
      const bilty = generator.generateBilty(details);
      const invoice = generator.generateInvoice(details);
      
      expect(bilty.innerHTML).toContain(longDescription);
      expect(invoice.innerHTML).toContain(longDescription);
    });

    test('handles special characters in text fields', () => {
      const details = {
        ...sampleFreightDetails,
        origin: 'Mumbai & Pune',
        destination: 'Delhi <NCR>',
        goodsDescription: 'Goods "with" special \'characters\''
      };
      
      const bilty = generator.generateBilty(details);
      
      expect(bilty).not.toBeNull();
      expect(bilty.innerHTML).toContain('Mumbai &amp; Pune');
    });

    test('handles zero values in numeric fields', () => {
      const details = {
        ...sampleFreightDetails,
        discount: 0,
        taxes: 0
      };
      
      const invoice = generator.generateInvoice(details);
      const html = invoice.innerHTML;
      
      expect(html).toContain('0.00');
    });
  });
});
