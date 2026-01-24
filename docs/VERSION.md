# Version Management

## Current Version: 1

## How to Update Version

When you push a new commit and want to bust the browser cache, follow these steps:

1. Open `assets/js/version.js`
2. Increment the `APP_VERSION` value by 1
3. Commit and push the changes

Example:
```javascript
// Before
export const APP_VERSION = '1';

// After
export const APP_VERSION = '2';
```

## Why This Works

- All JavaScript modules are imported with `?v={version}` query parameter
- When the version changes, browsers treat it as a new file
- Users automatically get the latest code without hard refresh

## Files Using Versioning

- `index.html` - Main application page
- `list-documents.html` - Document listing page
- `login.html` - Login page
- `register.html` - Registration page
- All JavaScript modules in `assets/js/`

## Important Notes

- Always increment by 1 for each deployment
- Never skip version numbers
- The version is a simple counter (1, 2, 3, 4, ...)
- You can also use timestamps if preferred (e.g., '20260124001')
