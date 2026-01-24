import { describe, test, expect, beforeEach } from '@jest/globals';
import { FormValidator } from '../assets/js/validator.js';
import fc from 'fast-check';

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

  // Property-Based Tests
  describe('Property-Based Tests', () => {
    // Feature: transport-invoice-system, Property 5: Required field validation
    // Validates: Requirements 2.2
    test('Property 5: Required field validation - any form with missing required fields should fail validation', () => {
      fc.assert(
        fc.property(
          // Generate a subset of required fields (at least one missing)
          fc.record({
            origin: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
            destination: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
            goodsDescription: fc.option(fc.string({ minLength: 1, maxLength: 200 }), { nil: undefined }),
            weight: fc.option(fc.float({ min: Math.fround(0.1), max: Math.fround(10000), noNaN: true }), { nil: undefined }),
            amount: fc.option(fc.float({ min: Math.fround(0.1), max: Math.fround(1000000), noNaN: true }), { nil: undefined })
          }).filter(formData => {
            // Ensure at least one required field is missing
            const requiredFields = ['origin', 'destination', 'goodsDescription', 'weight', 'amount'];
            return requiredFields.some(field => 
              formData[field] === undefined || 
              formData[field] === null || 
              formData[field] === ''
            );
          }),
          (formData) => {
            const result = validator.validateFreightForm(formData);
            
            // Validation should fail
            expect(result.valid).toBe(false);
            
            // Should have at least one error
            expect(result.errors.length).toBeGreaterThan(0);
            
            // Check that all missing required fields are identified
            const requiredFields = ['origin', 'destination', 'goodsDescription', 'weight', 'amount'];
            const missingFields = requiredFields.filter(field => 
              formData[field] === undefined || 
              formData[field] === null || 
              formData[field] === ''
            );
            
            // Each missing field should have an error
            missingFields.forEach(missingField => {
              const hasError = result.errors.some(error => error.field === missingField);
              expect(hasError).toBe(true);
            });
            
            // Error messages should indicate the field is required
            result.errors.forEach(error => {
              if (missingFields.includes(error.field)) {
                expect(error.message).toContain('required');
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
