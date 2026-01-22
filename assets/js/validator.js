/**
 * FormValidator - Validates freight form data
 * Ensures all required fields are present and valid before processing
 */
export class FormValidator {
  /**
   * List of required fields that must be present and non-empty
   */
  static REQUIRED_FIELDS = ['origin', 'destination', 'goodsDescription', 'weight', 'amount'];

  /**
   * List of numeric fields that must be positive numbers
   */
  static NUMERIC_FIELDS = ['weight', 'amount', 'discount', 'taxes'];

  /**
   * Validate all freight form fields
   * @param {Object} formData - The freight details to validate
   * @returns {Object} { valid: boolean, errors: Array<{field: string, message: string}> }
   */
  validateFreightForm(formData) {
    const errors = [];

    // Check required fields
    const missingFields = this.checkRequiredFields(formData);
    missingFields.forEach(field => {
      errors.push({
        field,
        message: `${this._formatFieldName(field)} is required`
      });
    });

    // Validate numeric fields
    FormValidator.NUMERIC_FIELDS.forEach(field => {
      if (formData[field] !== undefined && formData[field] !== null && formData[field] !== '') {
        const numericValidation = this.validateNumeric(formData[field], field);
        if (!numericValidation.valid) {
          errors.push({
            field,
            message: numericValidation.error
          });
        }
      }
    });

    // Validate text fields are not just whitespace
    FormValidator.REQUIRED_FIELDS.forEach(field => {
      if (!FormValidator.NUMERIC_FIELDS.includes(field)) {
        const value = formData[field];
        if (value && typeof value === 'string' && value.trim() === '') {
          errors.push({
            field,
            message: `${this._formatFieldName(field)} cannot be only whitespace`
          });
        }
      }
    });

    // Validate eWay bill format if provided (optional field)
    if (formData.ewayBillNumber && formData.ewayBillNumber.trim() !== '') {
      const ewayBillValidation = this._validateEwayBill(formData.ewayBillNumber);
      if (!ewayBillValidation.valid) {
        errors.push({
          field: 'ewayBillNumber',
          message: ewayBillValidation.error
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate a single field
   * @param {string} fieldName - Name of the field to validate
   * @param {*} value - Value to validate
   * @returns {Object} { valid: boolean, error: string }
   */
  validateField(fieldName, value) {
    // Check if required field is empty
    if (FormValidator.REQUIRED_FIELDS.includes(fieldName)) {
      if (value === undefined || value === null || value === '') {
        return {
          valid: false,
          error: `${this._formatFieldName(fieldName)} is required`
        };
      }

      // Check if text field is only whitespace
      if (!FormValidator.NUMERIC_FIELDS.includes(fieldName) && typeof value === 'string' && value.trim() === '') {
        return {
          valid: false,
          error: `${this._formatFieldName(fieldName)} cannot be only whitespace`
        };
      }
    }

    // Validate numeric fields
    if (FormValidator.NUMERIC_FIELDS.includes(fieldName)) {
      if (value !== undefined && value !== null && value !== '') {
        return this.validateNumeric(value, fieldName);
      }
    }

    // Validate eWay bill format
    if (fieldName === 'ewayBillNumber' && value && value.trim() !== '') {
      return this._validateEwayBill(value);
    }

    return { valid: true, error: '' };
  }

  /**
   * Check which required fields are missing
   * @param {Object} formData - The freight details to check
   * @returns {Array<string>} Array of missing field names
   */
  checkRequiredFields(formData) {
    const missingFields = [];

    FormValidator.REQUIRED_FIELDS.forEach(field => {
      const value = formData[field];
      if (value === undefined || value === null || value === '') {
        missingFields.push(field);
      }
    });

    return missingFields;
  }

  /**
   * Validate that a value is a positive number
   * @param {*} value - Value to validate
   * @param {string} fieldName - Name of the field being validated
   * @returns {Object} { valid: boolean, error: string }
   */
  validateNumeric(value, fieldName) {
    // Convert to number if it's a string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;

    // Check if it's a valid number
    if (isNaN(numValue)) {
      return {
        valid: false,
        error: `${this._formatFieldName(fieldName)} must be a valid number`
      };
    }

    // Check if it's positive (> 0)
    if (numValue <= 0) {
      return {
        valid: false,
        error: `${this._formatFieldName(fieldName)} must be a positive number greater than 0`
      };
    }

    return { valid: true, error: '' };
  }

  /**
   * Validate eWay bill number format (alphanumeric)
   * @param {string} ewayBillNumber - eWay bill number to validate
   * @returns {Object} { valid: boolean, error: string }
   * @private
   */
  _validateEwayBill(ewayBillNumber) {
    const trimmed = ewayBillNumber.trim();
    
    if (trimmed === '') {
      return { valid: true, error: '' };
    }

    // eWay bill should be alphanumeric
    const alphanumericRegex = /^[a-zA-Z0-9]+$/;
    if (!alphanumericRegex.test(trimmed)) {
      return {
        valid: false,
        error: 'eWay bill number must be alphanumeric (letters and numbers only)'
      };
    }

    return { valid: true, error: '' };
  }

  /**
   * Format field name for display in error messages
   * @param {string} fieldName - Camel case field name
   * @returns {string} Formatted field name
   * @private
   */
  _formatFieldName(fieldName) {
    const fieldNameMap = {
      origin: 'Origin',
      destination: 'Destination',
      goodsDescription: 'Goods Description',
      weight: 'Weight',
      amount: 'Amount',
      discount: 'Discount',
      taxes: 'Taxes',
      ewayBillNumber: 'eWay Bill Number'
    };

    return fieldNameMap[fieldName] || fieldName;
  }
}
