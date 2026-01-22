# List Bilty/Invoices Feature Documentation

## Overview
Added a new "List Bilty / Invoices" page that displays all generated freight records with the ability to view and download documents.

## New Features

### 1. Navigation Menu
- Added a navigation menu to both `index.html` and `list-documents.html`
- Two menu items:
  - **Create New**: Navigate to the main form (index.html)
  - **List Bilty / Invoices**: Navigate to the list page (list-documents.html)

### 2. List Documents Page (`list-documents.html`)
A new page that displays all freight records in a table format with the following features:

#### Features:
- **Table View**: Displays all freight records with columns:
  - ID
  - Origin
  - Destination
  - Goods Description
  - Weight (kg)
  - Amount (₹)
  - Date Created
  - Actions

- **Search Functionality**: 
  - Real-time search by origin, destination, goods description, or ID
  - Filters records as you type

- **Refresh Button**: 
  - Reload all records from the database

- **Action Buttons** (per record):
  - **Bilty**: View bilty document in modal
  - **Invoice**: View invoice document in modal
  - **📄**: Download bilty as PDF
  - **📋**: Download invoice as PDF

- **Document Preview Modal**:
  - View documents before downloading
  - Download PDF directly from modal
  - Close button to dismiss modal

- **Empty State**:
  - Shows when no records exist
  - Provides link to create new record

### 3. Enhanced DataStore (`assets/js/datastore.js`)
Added new methods:

#### `recordDocumentGeneration(freightId, documentType)`
Records when a document (bilty or invoice) is generated for tracking purposes.

**Parameters:**
- `freightId`: ID of the freight record
- `documentType`: 'bilty' or 'invoice'

**Returns:** `{ success: boolean, error?: string }`

#### `getDocumentHistory(freightId)`
Retrieves the generation history for a specific freight record.

**Parameters:**
- `freightId`: ID of the freight record

**Returns:** Array of history objects with:
- `id`: History entry ID
- `freightId`: Freight record ID
- `documentType`: Type of document generated
- `generatedAt`: Timestamp of generation

### 4. Updated UI Controller (`assets/js/ui-controller.js`)
- Modified `handleGenerateDocument()` to record document generation in history
- Tracks when bilty and invoice documents are generated

## File Structure

```
project/
├── index.html                      # Main form (updated with navigation)
├── list-documents.html             # New list page
├── assets/
│   └── js/
│       ├── datastore.js           # Updated with history methods
│       └── ui-controller.js       # Updated to track generation
└── test-list-functionality.html   # Test file for new features
```

## Usage

### For Users:

1. **Create Freight Records**:
   - Go to index.html (or click "Create New" in menu)
   - Fill in freight details
   - Save and generate documents

2. **View All Records**:
   - Click "List Bilty / Invoices" in the navigation menu
   - Or navigate directly to list-documents.html

3. **Search Records**:
   - Use the search box to filter by origin, destination, goods, or ID
   - Results update in real-time

4. **View Documents**:
   - Click "Bilty" or "Invoice" buttons to preview in modal
   - Click 📄 or 📋 icons to download PDFs directly

5. **Refresh Data**:
   - Click "Refresh" button to reload all records

### For Developers:

1. **Test the Functionality**:
   ```bash
   # Open in browser
   open test-list-functionality.html
   ```
   - Click "Run Tests" to verify all features work

2. **Database Schema**:
   - `freight_details`: Stores all freight records
   - `document_history`: Tracks document generation
   - Indexed for performance on user_id and created_at

3. **API Methods**:
   ```javascript
   // Get all records for a user
   const records = dataStore.getUserFreightRecords(userId);
   
   // Record document generation
   dataStore.recordDocumentGeneration(freightId, 'bilty');
   
   // Get generation history
   const history = dataStore.getDocumentHistory(freightId);
   ```

## Technical Details

### List Controller Class
The `list-documents.html` page uses a `ListController` class that:
- Manages authentication
- Loads and displays records
- Handles search filtering
- Generates documents on-demand
- Manages modal display
- Handles PDF downloads

### Security
- Authentication required to access list page
- Only shows records for logged-in user
- Session validation on page load

### Performance
- Database indexes on frequently queried columns
- Client-side filtering for instant search results
- Lazy document generation (only when requested)

## Browser Compatibility
- Modern browsers with ES6 module support
- WebAssembly support required (for SQLite)
- LocalStorage for data persistence

## Future Enhancements
Potential improvements:
- Pagination for large datasets
- Sorting by columns
- Bulk operations (delete, export)
- Date range filtering
- Export to Excel/CSV
- Print functionality
- Edit existing records
- Delete records with confirmation
