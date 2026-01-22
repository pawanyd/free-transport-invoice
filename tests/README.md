# Tests Directory

This directory contains all test files for the Transport Invoice Management System.

## Structure

```
tests/
├── README.md                    # This file
├── html/                        # HTML-based test files
│   ├── e2e-test-checklist.html
│   ├── manual-test.html
│   ├── test-complete-flow.html
│   ├── test-generator.html
│   ├── test-list-functionality.html
│   ├── test-pdf-exporter.html
│   ├── test-static-functionality.html
│   ├── test-subdirectory-paths.html
│   └── test-ui-controller.html
├── scripts/                     # Test and verification scripts
│   ├── e2e-automated-test.js
│   ├── verify-checkpoint.js
│   ├── verify-e2e.js
│   └── verify-static-deployment.js
├── auth.test.js                 # Jest unit tests
├── datastore.test.js
├── generator.test.js
├── setup.test.js
├── test-setup.js
└── validator.test.js
```

## Test Categories

### 1. Unit Tests (Jest)
Located in the root of `tests/` directory:
- `auth.test.js` - Authentication module tests
- `datastore.test.js` - Database operations tests
- `generator.test.js` - Document generation tests
- `validator.test.js` - Form validation tests
- `setup.test.js` - Test environment setup verification

**Run with:**
```bash
npm test
```

### 2. HTML Test Files (`tests/html/`)
Interactive browser-based tests for manual verification:

- **test-complete-flow.html** - Full application workflow test
- **test-generator.html** - Document generator functionality
- **test-list-functionality.html** - List/search functionality for bilty/invoices
- **test-pdf-exporter.html** - PDF export functionality
- **test-static-functionality.html** - Static deployment verification
- **test-subdirectory-paths.html** - Path resolution tests
- **test-ui-controller.html** - UI controller tests
- **e2e-test-checklist.html** - End-to-end test checklist
- **manual-test.html** - Manual testing guide

**Run by opening in browser:**
```bash
# From project root
open tests/html/test-complete-flow.html
```

### 3. Verification Scripts (`tests/scripts/`)
Node.js scripts for automated verification:

- **e2e-automated-test.js** - Automated end-to-end tests
- **verify-checkpoint.js** - Checkpoint verification
- **verify-e2e.js** - E2E test verification
- **verify-static-deployment.js** - Static deployment verification

**Run with:**
```bash
node tests/scripts/verify-static-deployment.js
node tests/scripts/e2e-automated-test.js
```

## Running Tests

### All Unit Tests
```bash
npm test
```

### Specific Test File
```bash
npm test -- auth.test.js
```

### Watch Mode
```bash
npm test -- --watch
```

### HTML Tests
Open any HTML file in `tests/html/` directory in a browser:
```bash
# Example
open tests/html/test-list-functionality.html
```

### Verification Scripts
```bash
node tests/scripts/verify-static-deployment.js
node tests/scripts/verify-e2e.js
```

## Test Coverage

The test suite covers:
- ✅ Authentication and session management
- ✅ Database operations (SQLite/WebAssembly)
- ✅ Form validation
- ✅ Document generation (Bilty & Invoice)
- ✅ PDF export functionality
- ✅ UI interactions and state management
- ✅ List and search functionality
- ✅ End-to-end workflows
- ✅ Static deployment compatibility

## Adding New Tests

### Unit Tests
1. Create a new `.test.js` file in `tests/` directory
2. Follow the existing test structure
3. Import required modules
4. Write test cases using Jest syntax

### HTML Tests
1. Create a new `test-*.html` file in `tests/html/` directory
2. Include necessary scripts and styles
3. Add test UI and logic
4. Document the test purpose

### Verification Scripts
1. Create a new `verify-*.js` file in `tests/scripts/` directory
2. Use Node.js for automation
3. Add clear console output
4. Return appropriate exit codes

## Notes

- All paths in HTML tests are relative to the project root
- Scripts should be run from the project root directory
- Unit tests use Jest with JSDOM for DOM simulation
- HTML tests require a modern browser with ES6 module support
