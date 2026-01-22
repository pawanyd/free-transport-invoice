import { describe, test, expect, beforeEach } from '@jest/globals';
import { FormValidator } from '../assets/js/validator.js';

describe('FormValidator', () => {
  let validator;

  beforeEach(() => {
    validator = new FormValidator();
  });

  describe('validateFreightForm', () => {
    test('validates complete valid form data', () => {
      const formData = {
        origin: 'Mumbai',
        destination: 'Delhi',
        goodsDescription: 'Electronics',
        weight: 100,
        amount: 5000,
        discount: 500,
        taxes: 900
      };

      const result = validator.validateFreightForm(formData);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects missing required fields', () => {
      const formData = {
        origin: 'Mumbai',
        // destination missing
        goodsDescription: 'Electronics',
        // weight missing
        amount: 5000
      };

      const result = validator.validateFreightForm(formData);
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors.some(e => e.field === 'destination')).toBe(true);
      expect(result.errors.some(e => e.field === 'weight')).toBe(true);
    });

    test('detects whitespace-only text fields', () => {
      const formData = {
        origin: '   ',
        destination: 'Delhi',
        goodsDescription: 'Electronics',
        weight: 100,
        amount: 5000
      };

      const result = validator.validateFreightForm(formData);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'origin' && e.message.includes('whitespace'))).toBe(true);
    });

    test('detects negative numeric values', () => {
      const formData = {
        origin: 'Mumbai',
        destination: 'Delhi',
        goodsDescription: 'Electronics',
        weight: -10,
        amount: 5000
      };

      const result = validator.validateFreightForm(formData);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'weight')).toBe(true);
    });

    test('detects zero numeric values', () => {
      const formData = {
        origin: 'Mumbai',
        destination: 'Delhi',
        goodsDescription: 'Electronics',
        weight: 100,
        amount: 0
      };

      const result = validator.validateFreightForm(formData);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'amount')).toBe(true);
    });

    test('validates eWay bill format when provided', () => {
      const formData = {
        origin: 'Mumbai',
        destination: 'Delhi',
        goodsDescription: 'Electronics',
        weight: 100,
        amount: 5000,
        ewayBillNumber: 'EWB123456789'
      };

      const result = validator.validateFreightForm(formData);
      expect(result.valid).toBe(true);
    });

    test('rejects invalid eWay bill format', () => {
      const formData = {
        origin: 'Mumbai',
        destination: 'Delhi',
        goodsDescription: 'Electronics',
        weight: 100,
        amount: 5000,
        ewayBillNumber: 'EWB-123-456'
      };

      const result = validator.validateFreightForm(formData);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.field === 'ewayBillNumber')).toBe(true);
    });
  });

  describe('validateField', () => {
    test('validates required field with valid value', () => {
      const result = validator.validateField('origin', 'Mumbai');
      expect(result.valid).toBe(true);
      expect(result.error).toBe('');
    });

    test('detects empty required field', () => {
      const result = validator.validateField('origin', '');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    test('validates numeric field with positive value', () => {
      const result = validator.validateField('weight', 100);
      expect(result.valid).toBe(true);
    });

    test('detects negative numeric value', () => {
      const result = validator.validateField('amount', -500);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('positive');
    });
  });

  describe('checkRequiredFields', () => {
    test('returns empty array for complete data', () => {
      const formData = {
        origin: 'Mumbai',
        destination: 'Delhi',
        goodsDescription: 'Electronics',
        weight: 100,
        amount: 5000
      };

      const missing = validator.checkRequiredFields(formData);
      expect(missing).toHaveLength(0);
    });

    test('returns array of missing field names', () => {
      const formData = {
        origin: 'Mumbai',
        goodsDescription: 'Electronics'
      };

      const missing = validator.checkRequiredFields(formData);
      expect(missing).toContain('destination');
      expect(missing).toContain('weight');
      expect(missing).toContain('amount');
    });
  });

  describe('validateNumeric', () => {
    test('accepts positive numbers', () => {
      const result = validator.validateNumeric(100, 'weight');
      expect(result.valid).toBe(true);
    });

    test('accepts positive decimal numbers', () => {
      const result = validator.validateNumeric(99.99, 'amount');
      expect(result.valid).toBe(true);
    });

    test('accepts numeric strings', () => {
      const result = validator.validateNumeric('150.50', 'amount');
      expect(result.valid).toBe(true);
    });

    test('rejects zero', () => {
      const result = validator.validateNumeric(0, 'weight');
      expect(result.valid).toBe(false);
    });

    test('rejects negative numbers', () => {
      const result = validator.validateNumeric(-10, 'weight');
      expect(result.valid).toBe(false);
    });

    test('rejects non-numeric strings', () => {
      const result = validator.validateNumeric('abc', 'weight');
      expect(result.valid).toBe(false);
    });
  });
});
