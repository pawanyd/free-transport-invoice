/**
 * Automated End-to-End Test Script
 * 
 * This script tests the complete user flow:
 * 1. Authentication
 * 2. Form entry and validation
 * 3. Data persistence
 * 4. Document generation
 * 5. Session management
 * 
 * Run with: node e2e-automated-test.js
 */

import { AuthManager } from './assets/js/auth.js';
import { DataStoreManager } from './assets/js/datastore.js';
import { FormValidator } from './assets/js/validator.js';
import { DocumentGenerator } from './assets/js/generator.js';
import { DocumentConfig } from './assets/js/config.js';

// Mock localStorage for Node.js environment
global.localStorage = {
  data: {},
  getItem(key) {
    return this.data[key] || null;
  },
  setItem(key, value) {
    this.data[key] = value;
  },
  removeItem(key) {
    delete this.data[key];
  },
  clear() {
    this.data = {};
  }
};

// Mock crypto for Node.js environment
import crypto from 'crypto';
global.crypto = {
  subtle: {
    digest: async (algorithm, data) => {
      const hash = crypto.createHash('sha256');
      hash.update(new Uint8Array(data));
      return hash.digest();
    }
  },
  getRandomValues: (array) => {
    return crypto.randomFillSync(array);
  }
};

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message = '') {
  results.tests.push({ name, passed, message });
  if (passed) {
    results.passed++;
    console.log(`✓ ${name}`);
  } else {
    results.failed++;
    console.log(`✗ ${name}: ${message}`);
  }
}

async function runTests() {
  console.log('\n=== Starting End-to-End Automated Tests ===\n');

  // Clear localStorage before tests
  localStorage.clear();

  // Initialize components
  const dataStore = new DataStoreManager();
  await dataStore.initialize();
  
  const authManager = new AuthManager(dataStore);
  const validator = new FormValidator();
  const generator = new DocumentGenerator();

  console.log('\n--- Test Suite 1: Authentication Flow ---');
  
  // Test 1: Invalid login
  const invalidLogin = await authManager.login('invalid', 'wrong');
  logTest(
    'Invalid credentials should be rejected',
    !invalidLogin.success && invalidLogin.error === 'Invalid username or password'
  );

  // Test 2: Valid login
  const validLogin = await authManager.login('admin', 'admin123');
  logTest(
    'Valid credentials should create session',
    validLogin.success && validLogin.sessionToken
  );

  // Test 3: Session persistence
  const isAuth = authManager.isAuthenticated();
  logTest(
    'Session should persist after login',
    isAuth === true
  );

  // Test 4: Session token retrieval
  const token = authManager.getSessionToken();
  logTest(
    'Session token should be retrievable',
    token !== null && token.length > 0
  );

  console.log('\n--- Test Suite 2: Form Validation ---');

  // Test 5: Empty form validation
  const emptyForm = validator.validateFreightForm({});
  logTest(
    'Empty form should fail validation',
    !emptyForm.valid && emptyForm.errors.length > 0
  );

  // Test 6: Invalid numeric values
  const invalidNumeric = validator.validateFreightForm({
    origin: 'Mumbai',
    destination: 'Delhi',
    goodsDescription: 'Electronics',
    weight: -10,
    amount: 1000
  });
  logTest(
    'Negative weight should fail validation',
    !invalidNumeric.valid
  );

  // Test 7: Valid form data
  const validForm = validator.validateFreightForm({
    origin: 'Mumbai, Maharashtra',
    destination: 'Delhi, NCR',
    goodsDescription: 'Electronic goods',
    weight: 150.5,
    amount: 15000,
    discount: 500,
    taxes: 2700
  });
  logTest(
    'Valid form data should pass validation',
    validForm.valid && validForm.errors.length === 0
  );

  console.log('\n--- Test Suite 3: Data Persistence ---');

  // Test 8: Save freight details
  const freightData = {
    origin: 'Mumbai, Maharashtra',
    destination: 'Delhi, NCR',
    goodsDescription: 'Electronic goods - Laptops',
    weight: 150.5,
    amount: 15000,
    discount: 500,
    taxes: 2700,
    ewayBillNumber: 'EWB123456789012',
    ewayBillDate: '2024-01-15'
  };

  const saveResult = dataStore.saveFreightDetails(freightData);
  logTest(
    'Freight details should be saved successfully',
    saveResult.success && saveResult.id > 0
  );

  // Test 9: Retrieve freight details
  const retrievedData = dataStore.getFreightDetails(saveResult.id);
  logTest(
    'Freight details should be retrievable',
    retrievedData !== null && retrievedData.origin === freightData.origin
  );

  // Test 10: Data round-trip integrity
  const dataIntact = 
    retrievedData.destination === freightData.destination &&
    retrievedData.goodsDescription === freightData.goodsDescription &&
    Math.abs(retrievedData.weight - freightData.weight) < 0.01 &&
    Math.abs(retrievedData.amount - freightData.amount) < 0.01;
  logTest(
    'Retrieved data should match saved data',
    dataIntact
  );

  console.log('\n--- Test Suite 4: Document Generation ---');

  // Test 11: Generate bilty
  const bilty = generator.generateBilty(retrievedData);
  logTest(
    'Bilty document should be generated',
    bilty !== null && bilty instanceof HTMLElement
  );

  // Test 12: Bilty contains freight details
  const biltyHTML = bilty ? bilty.innerHTML : '';
  const biltyHasData = 
    biltyHTML.includes(freightData.origin) &&
    biltyHTML.includes(freightData.destination) &&
    biltyHTML.includes(freightData.goodsDescription);
  logTest(
    'Bilty should contain all freight details',
    biltyHasData
  );

  // Test 13: Bilty contains branding
  const biltyHasBranding = 
    biltyHTML.includes(DocumentConfig.companyName) &&
    biltyHTML.includes('logo.svg');
  logTest(
    'Bilty should contain company branding',
    biltyHasBranding
  );

  // Test 14: Bilty contains eWay bill
  const biltyHasEway = biltyHTML.includes(freightData.ewayBillNumber);
  logTest(
    'Bilty should contain eWay bill information',
    biltyHasEway
  );

  // Test 15: Generate invoice
  const invoice = generator.generateInvoice(retrievedData);
  logTest(
    'Invoice document should be generated',
    invoice !== null && invoice instanceof HTMLElement
  );

  // Test 16: Invoice contains freight details
  const invoiceHTML = invoice ? invoice.innerHTML : '';
  const invoiceHasData = 
    invoiceHTML.includes(freightData.origin) &&
    invoiceHTML.includes(freightData.destination) &&
    invoiceHTML.includes(freightData.goodsDescription);
  logTest(
    'Invoice should contain all freight details',
    invoiceHasData
  );

  // Test 17: Invoice calculations
  const expectedTotal = (freightData.amount - freightData.discount) + freightData.taxes;
  const invoiceHasTotal = invoiceHTML.includes(expectedTotal.toString());
  logTest(
    'Invoice should have correct total calculation',
    invoiceHasTotal
  );

  // Test 18: Generate both documents
  const both = generator.generateBoth(retrievedData);
  logTest(
    'Combined generation should create both documents',
    both.bilty !== null && both.invoice !== null
  );

  // Test 19: Both documents have consistent data
  const biltyBothHTML = both.bilty ? both.bilty.innerHTML : '';
  const invoiceBothHTML = both.invoice ? both.invoice.innerHTML : '';
  const consistentData = 
    biltyBothHTML.includes(freightData.origin) &&
    invoiceBothHTML.includes(freightData.origin) &&
    biltyBothHTML.includes(freightData.destination) &&
    invoiceBothHTML.includes(freightData.destination);
  logTest(
    'Both documents should contain consistent data',
    consistentData
  );

  console.log('\n--- Test Suite 5: Session Management ---');

  // Test 20: Logout
  authManager.logout();
  const isAuthAfterLogout = authManager.isAuthenticated();
  logTest(
    'Session should be terminated after logout',
    !isAuthAfterLogout
  );

  // Test 21: Session token cleared
  const tokenAfterLogout = authManager.getSessionToken();
  logTest(
    'Session token should be null after logout',
    tokenAfterLogout === null
  );

  // Test 22: Re-login
  const reLogin = await authManager.login('admin', 'admin123');
  logTest(
    'Should be able to login again after logout',
    reLogin.success
  );

  console.log('\n--- Test Suite 6: Error Handling ---');

  // Test 23: Null freight details
  const nullBilty = generator.generateBilty(null);
  logTest(
    'Should handle null freight details gracefully',
    nullBilty === null
  );

  // Test 24: Missing required fields
  const incompleteData = validator.validateFreightForm({
    origin: 'Mumbai',
    destination: 'Delhi'
    // Missing required fields
  });
  logTest(
    'Should detect missing required fields',
    !incompleteData.valid && incompleteData.errors.length > 0
  );

  // Test 25: Zero numeric values
  const zeroWeight = validator.validateNumeric(0, 'weight');
  logTest(
    'Should reject zero numeric values',
    !zeroWeight.valid
  );

  console.log('\n--- Test Suite 7: User Data Isolation ---');

  // Test 26: Create second user
  const user2Hash = await authManager.hashPassword('password123');
  const user2Save = dataStore.saveUser('testuser', user2Hash);
  logTest(
    'Should be able to create second user',
    user2Save.success
  );

  // Test 27: Login as second user
  authManager.logout();
  const user2Login = await authManager.login('testuser', 'password123');
  logTest(
    'Should be able to login as second user',
    user2Login.success
  );

  // Test 28: Second user's freight records
  const user2Records = dataStore.getUserFreightRecords(2); // Assuming user ID 2
  logTest(
    'Second user should have no freight records initially',
    Array.isArray(user2Records) && user2Records.length === 0
  );

  // Print summary
  console.log('\n=== Test Summary ===');
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`Passed: ${results.passed}`);
  console.log(`Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(2)}%`);

  if (results.failed > 0) {
    console.log('\n=== Failed Tests ===');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`- ${t.name}: ${t.message}`);
    });
  }

  console.log('\n=== End-to-End Tests Complete ===\n');

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});
