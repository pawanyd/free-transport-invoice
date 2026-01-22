/**
 * End-to-End Verification Script
 * 
 * This script verifies that all components are properly integrated
 * and the application is ready for manual testing.
 */

import fs from 'fs';
import path from 'path';

const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: []
};

function logTest(name, status, message = '') {
  results.tests.push({ name, status, message });
  
  if (status === 'pass') {
    results.passed++;
    console.log(`✓ ${name}`);
  } else if (status === 'fail') {
    results.failed++;
    console.log(`✗ ${name}: ${message}`);
  } else if (status === 'warn') {
    results.warnings++;
    console.log(`⚠ ${name}: ${message}`);
  }
}

function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf8');
  } catch {
    return null;
  }
}

console.log('\n=== End-to-End Verification ===\n');

console.log('--- Checking File Structure ---');

// Check HTML files
logTest(
  'index.html exists',
  fileExists('index.html') ? 'pass' : 'fail',
  'Main application file missing'
);

logTest(
  'login.html exists',
  fileExists('login.html') ? 'pass' : 'fail',
  'Login page missing'
);

// Check JavaScript modules
const jsModules = [
  'assets/js/auth.js',
  'assets/js/datastore.js',
  'assets/js/validator.js',
  'assets/js/generator.js',
  'assets/js/pdf-exporter.js',
  'assets/js/ui-controller.js',
  'assets/js/config.js'
];

jsModules.forEach(module => {
  logTest(
    `${module} exists`,
    fileExists(module) ? 'pass' : 'fail',
    'Module file missing'
  );
});

// Check CSS
logTest(
  'assets/css/styles.css exists',
  fileExists('assets/css/styles.css') ? 'pass' : 'fail',
  'Styles file missing'
);

// Check assets
const assets = [
  'assets/images/logo.svg',
  'assets/images/signature.svg',
  'assets/images/seal.svg',
  'assets/lib/sql-wasm.js',
  'assets/lib/sql-wasm.wasm',
  'assets/lib/jspdf.umd.min.js'
];

assets.forEach(asset => {
  logTest(
    `${asset} exists`,
    fileExists(asset) ? 'pass' : 'fail',
    'Asset file missing'
  );
});

console.log('\n--- Checking Test Files ---');

const testFiles = [
  'tests/auth.test.js',
  'tests/datastore.test.js',
  'tests/validator.test.js',
  'tests/generator.test.js',
  'tests/setup.test.js'
];

testFiles.forEach(test => {
  logTest(
    `${test} exists`,
    fileExists(test) ? 'pass' : 'fail',
    'Test file missing'
  );
});

console.log('\n--- Checking Module Exports ---');

// Check that modules have proper exports
jsModules.forEach(module => {
  const content = readFile(module);
  if (content) {
    const hasExport = content.includes('export default') || content.includes('export {') || content.includes('export class');
    logTest(
      `${module} has export statement`,
      hasExport ? 'pass' : 'fail',
      'Module missing export statement'
    );
  }
});

console.log('\n--- Checking HTML Integration ---');

// Check index.html for proper script imports
const indexContent = readFile('index.html');
if (indexContent) {
  logTest(
    'index.html imports ui-controller.js',
    indexContent.includes('ui-controller.js') ? 'pass' : 'warn',
    'UI controller may not be imported'
  );
  
  logTest(
    'index.html has authentication check',
    indexContent.includes('isAuthenticated') || indexContent.includes('auth') ? 'pass' : 'warn',
    'Authentication check may be missing'
  );
  
  logTest(
    'index.html has form element',
    indexContent.includes('freightForm') || indexContent.includes('<form') ? 'pass' : 'fail',
    'Form element missing'
  );
}

// Check login.html
const loginContent = readFile('login.html');
if (loginContent) {
  logTest(
    'login.html has login form',
    loginContent.includes('username') && loginContent.includes('password') ? 'pass' : 'fail',
    'Login form incomplete'
  );
  
  logTest(
    'login.html imports auth.js',
    loginContent.includes('auth.js') ? 'pass' : 'warn',
    'Auth module may not be imported'
  );
}

console.log('\n--- Checking Configuration ---');

const configContent = readFile('assets/js/config.js');
if (configContent) {
  logTest(
    'config.js has company name',
    configContent.includes('companyName') ? 'pass' : 'fail',
    'Company name not configured'
  );
  
  logTest(
    'config.js has logo path',
    configContent.includes('logoUrl') || configContent.includes('logo') ? 'pass' : 'fail',
    'Logo path not configured'
  );
}

console.log('\n--- Checking Package Configuration ---');

const packageContent = readFile('package.json');
if (packageContent) {
  const pkg = JSON.parse(packageContent);
  
  logTest(
    'Jest is configured',
    pkg.devDependencies && pkg.devDependencies.jest ? 'pass' : 'fail',
    'Jest not in devDependencies'
  );
  
  logTest(
    'fast-check is configured',
    pkg.devDependencies && pkg.devDependencies['fast-check'] ? 'pass' : 'fail',
    'fast-check not in devDependencies'
  );
  
  logTest(
    'Test script is configured',
    pkg.scripts && pkg.scripts.test ? 'pass' : 'fail',
    'Test script not configured'
  );
}

console.log('\n--- Checking Jest Configuration ---');

logTest(
  'jest.config.js exists',
  fileExists('jest.config.js') ? 'pass' : 'fail',
  'Jest configuration missing'
);

console.log('\n=== Verification Summary ===');
console.log(`Total Checks: ${results.passed + results.failed + results.warnings}`);
console.log(`Passed: ${results.passed}`);
console.log(`Failed: ${results.failed}`);
console.log(`Warnings: ${results.warnings}`);

if (results.failed === 0) {
  console.log('\n✓ All critical checks passed!');
  console.log('\nThe application is ready for end-to-end testing.');
  console.log('\nNext steps:');
  console.log('1. Open e2e-test-checklist.html in a browser');
  console.log('2. Follow the manual test checklist');
  console.log('3. Open index.html to test the application');
  console.log('4. Verify all functionality works as expected');
} else {
  console.log('\n✗ Some critical checks failed.');
  console.log('\nFailed checks:');
  results.tests.filter(t => t.status === 'fail').forEach(t => {
    console.log(`  - ${t.name}: ${t.message}`);
  });
}

if (results.warnings > 0) {
  console.log('\nWarnings:');
  results.tests.filter(t => t.status === 'warn').forEach(t => {
    console.log(`  - ${t.name}: ${t.message}`);
  });
}

console.log('\n=== Verification Complete ===\n');

process.exit(results.failed > 0 ? 1 : 0);
