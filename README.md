# Transport Invoice Management System

A client-side web application for generating professional bilty (consignment notes) and invoices for freight shipments. The system operates entirely in the browser with no backend required, making it perfect for deployment on GitHub Pages.

## Features

- **User Authentication**: Secure login and registration with session management
- **User Registration**: Create new accounts with username/password validation
- **Freight Details Entry**: Intuitive form for capturing shipment information
- **List & Search**: View all freight records with search functionality
- **Document Generation**: Create professional bilty and invoice documents
- **PDF Export**: Download documents as print-ready PDFs
- **eWay Bill Integration**: Include eWay bill information in documents
- **Client-Side Storage**: All data stored locally in your browser using SQLite
- **Offline Capable**: Works without an internet connection after initial load
- **Navigation Menu**: Easy navigation between create and list pages

## Quick Start

### Running Locally

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd transport-invoice-system
   ```

2. **Open the application**
   
   **Option A: Direct file access** (simplest)
   - Open `index.html` in your web browser
   - Note: Some browsers may restrict certain features when opening files directly
   
   **Option B: Local server** (recommended)
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server -p 8000
   
   # Using PHP
   php -S localhost:8000
   ```
   Then open `http://localhost:8000` in your browser

3. **Login or Register**
   - Default credentials: Username `admin`, Password `admin123`
   - Or click "Register here" to create a new account

### Deploying to GitHub Pages

**Option 1: Using gh-pages branch**
1. Create and checkout a new `gh-pages` branch
   ```bash
   git checkout -b gh-pages
   ```
2. Push to GitHub
   ```bash
   git push origin gh-pages
   ```
3. Go to your repository Settings → Pages
4. Select `gh-pages` branch as the source
5. Your site will be available at `https://<username>.github.io/<repository-name>/`

**Option 2: Using docs folder**
1. Create a `docs` folder and copy all files into it
   ```bash
   mkdir docs
   cp -r *.html assets docs/
   ```
2. Commit and push to main branch
   ```bash
   git add docs
   git commit -m "Add docs folder for GitHub Pages"
   git push origin main
   ```
3. Go to your repository Settings → Pages
4. Select `main` branch and `/docs` folder as the source
5. Your site will be available at `https://<username>.github.io/<repository-name>/`

**Option 3: Using main branch root**
1. Push all files to the main branch
2. Go to your repository Settings → Pages
3. Select `main` branch and `/ (root)` as the source
4. Your site will be available at `https://<username>.github.io/<repository-name>/`

## Usage Guide

### 1. Register or Login

**For New Users:**
- Click "Register here" on the login page
- Choose a username (at least 3 characters, letters, numbers, and underscores only)
- Choose a password (at least 6 characters)
- Confirm your password
- Click "Register" to create your account
- You'll be redirected to the login page

**For Existing Users:**
- Enter your username and password
- Click "Login" to access the main application
- Default credentials: admin / admin123

### 2. Enter Freight Details
Fill in the form with shipment information:
- **Origin**: Pickup location
- **Destination**: Delivery location
- **Goods Description**: Description of items being transported
- **Weight**: Weight in kilograms
- **Amount**: Base freight charge
- **Discount**: Discount amount (optional)
- **Taxes**: Tax amount (optional)
- **eWay Bill Number**: Electronic waybill number (optional)
- **eWay Bill Date**: Date of eWay bill (optional)

### 3. Generate Documents
After entering freight details:
- Click **"Generate Bilty"** to create a consignment note
- Click **"Generate Invoice"** to create an invoice
- Click **"Generate Both"** to create both documents simultaneously

### 4. Download PDFs
- Review the generated document preview
- Click the download button to save as PDF
- PDFs are formatted for A4 paper and ready to print

### 5. Logout
- Click the "Logout" button in the top right to end your session

### 6. View All Records
- Click "List Bilty / Invoices" in the navigation menu
- View all your freight records in a table
- Use the search box to filter records by origin, destination, goods, or ID
- Click "Bilty" or "Invoice" to preview documents
- Click 📄 or 📋 icons to download PDFs directly

## Browser Compatibility

The application is tested and compatible with the latest versions of:
- ✅ Google Chrome
- ✅ Mozilla Firefox
- ✅ Apple Safari
- ✅ Microsoft Edge

**Minimum Requirements:**
- Modern browser with ES6+ JavaScript support
- LocalStorage enabled
- WebAssembly support (for SQLite)

## Data Storage

**Important**: All data is stored locally in your browser using:
- **SQLite (via sql.js)**: For structured data (freight details, users)
- **LocalStorage**: For session tokens and database persistence

**What this means:**
- Your data never leaves your computer
- Data persists between sessions
- Clearing browser data will delete all stored information
- Data is not shared between different browsers or devices
- Each browser on each device has its own separate database

## Troubleshooting

### Issue: Login page doesn't redirect after successful login
**Solution**: Check browser console for errors. Ensure JavaScript is enabled and LocalStorage is not disabled.

### Issue: "Failed to initialize database" error
**Solution**: 
- Ensure your browser supports WebAssembly
- Check that the `assets/lib/sql-wasm.js` and `assets/lib/sql-wasm.wasm` files are present
- Try clearing browser cache and reloading

### Issue: PDF download doesn't work
**Solution**:
- Check if your browser is blocking downloads
- Allow downloads from the site in browser settings
- Ensure `assets/lib/jspdf.umd.min.js` is loaded correctly

### Issue: Session expires immediately
**Solution**: Check that your system clock is set correctly. Session expiration is based on timestamps.

### Issue: Validation errors don't clear
**Solution**: Ensure you're entering valid data (positive numbers for weight/amount, non-empty text fields).

### Issue: Documents don't display company logo/signature/seal
**Solution**: Verify that image files exist in `assets/images/` directory:
- `logo.svg`
- `signature.svg`
- `seal.svg`

### Issue: Application doesn't work when deployed to GitHub Pages
**Solution**:
- Verify all file paths are relative (no leading slashes)
- Check browser console for 404 errors on assets
- Ensure all files are committed and pushed to the repository
- Wait a few minutes after deployment for GitHub Pages to update

### Issue: "Module not found" errors
**Solution**: Ensure all JavaScript files are using correct relative paths and are loaded with `type="module"` attribute.

## Development

### Running Tests
```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Project Structure
```
transport-invoice-system/
├── index.html              # Main application (create new freight)
├── list-documents.html     # List all bilty/invoices
├── login.html              # Login page
├── register.html           # User registration page
├── README.md               # This file
├── package.json            # NPM dependencies
├── jest.config.js          # Jest test configuration
├── assets/
│   ├── css/
│   │   └── styles.css     # Custom styles
│   ├── js/
│   │   ├── auth.js        # Authentication module
│   │   ├── config.js      # Configuration
│   │   ├── datastore.js   # Database management
│   │   ├── generator.js   # Document generation
│   │   ├── pdf-exporter.js # PDF export
│   │   ├── ui-controller.js # UI coordination
│   │   └── validator.js   # Form validation
│   ├── images/            # Company branding assets
│   │   ├── logo.svg
│   │   ├── seal.svg
│   │   └── signature.svg
│   └── lib/               # Third-party libraries
│       ├── jspdf.umd.min.js
│       ├── sql-wasm.js
│       └── sql-wasm.wasm
├── docs/                  # Documentation files
│   ├── BROWSER-COMPATIBILITY-TEST.md
│   ├── CHECKPOINT-10-SUMMARY.md
│   ├── DEPLOYMENT-CHECKLIST.md
│   ├── DEPLOYMENT-READY.md
│   ├── E2E-TEST-SUMMARY.md
│   ├── LIST-FEATURE-DOCUMENTATION.md
│   ├── MANUAL-TESTING-CHECKLIST.md
│   ├── OPTIMIZATION-NOTES.md
│   ├── TASK-11-COMPLETION-SUMMARY.md
│   ├── TASK-11-VERIFICATION.md
│   └── TASK-15-COMPLETION-SUMMARY.md
└── tests/                 # All test files
    ├── README.md          # Test documentation
    ├── html/              # HTML-based tests
    │   ├── e2e-test-checklist.html
    │   ├── manual-test.html
    │   ├── test-complete-flow.html
    │   ├── test-generator.html
    │   ├── test-list-functionality.html
    │   ├── test-pdf-exporter.html
    │   ├── test-static-functionality.html
    │   ├── test-subdirectory-paths.html
    │   └── test-ui-controller.html
    ├── scripts/           # Verification scripts
    │   ├── e2e-automated-test.js
    │   ├── verify-checkpoint.js
    │   ├── verify-e2e.js
    │   └── verify-static-deployment.js
    ├── auth.test.js       # Jest unit tests
    ├── datastore.test.js
    ├── generator.test.js
    ├── setup.test.js
    ├── test-setup.js
    └── validator.test.js
```

## Security Notes

- Passwords are hashed using SHA-256 before storage
- Username validation: minimum 3 characters, alphanumeric and underscores only
- Password validation: minimum 6 characters
- Duplicate usernames are prevented
- Sessions expire after 24 hours of inactivity
- All data processing happens client-side
- No data is transmitted to external servers
- Default admin credentials should be changed in production use

## License

[Add your license information here]

## Support

For issues, questions, or contributions, please [open an issue](link-to-issues) on GitHub.
