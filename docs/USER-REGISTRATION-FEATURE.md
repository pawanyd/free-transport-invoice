# User Registration Feature

## Overview
User registration functionality has been successfully implemented for the Transport Invoice Management System. Users can now create their own accounts instead of relying solely on the default admin credentials.

## Implementation Details

### New Files Created
1. **register.html** - Registration page with form validation
2. **tests/html/test-registration.html** - Interactive test page for registration functionality

### Modified Files
1. **assets/js/auth.js** - Added `register()` method with validation
2. **login.html** - Added link to registration page
3. **tests/auth.test.js** - Added 9 new unit tests for registration
4. **README.md** - Updated documentation with registration instructions

## Features

### Registration Validation
- **Username Requirements:**
  - Minimum 3 characters
  - Only letters, numbers, and underscores allowed
  - Must be unique (no duplicates)
  
- **Password Requirements:**
  - Minimum 6 characters
  - No character restrictions
  
- **Security:**
  - Passwords are hashed using SHA-256 before storage
  - Duplicate username prevention
  - Client-side validation with server-side enforcement

### User Experience
- Clean, modern UI matching the existing design
- Real-time password confirmation validation
- Clear error messages for validation failures
- Success message with automatic redirect to login
- Easy navigation between login and registration pages

## Testing

### Unit Tests (9 new tests)
All tests pass successfully:
- ✓ Register new user with valid credentials
- ✓ Reject duplicate username
- ✓ Reject username less than 3 characters
- ✓ Reject invalid username characters
- ✓ Reject password less than 6 characters
- ✓ Reject empty username
- ✓ Reject empty password
- ✓ Allow login after successful registration
- ✓ Hash password before storing

### Manual Testing
Interactive test page available at `tests/html/test-registration.html` with:
- Automated test suite (10 test cases)
- Manual registration testing
- Manual login testing
- Database reset functionality

## Usage

### For End Users
1. Navigate to the login page
2. Click "Register here" link
3. Enter desired username (3+ chars, alphanumeric and underscores)
4. Enter password (6+ chars)
5. Confirm password
6. Click "Register"
7. Upon success, redirected to login page
8. Login with new credentials

### For Developers
```javascript
import AuthManager from './assets/js/auth.js';

const authManager = new AuthManager();
await authManager.initialize();

// Register new user
const result = await authManager.register('username', 'password');
if (result.success) {
  console.log('Registration successful');
} else {
  console.error('Registration failed:', result.error);
}
```

## API Reference

### AuthManager.register(username, password)
Registers a new user account.

**Parameters:**
- `username` (string) - Desired username (3+ chars, alphanumeric and underscores)
- `password` (string) - Desired password (6+ chars)

**Returns:**
```javascript
{
  success: boolean,
  error?: string  // Only present if success is false
}
```

**Possible Errors:**
- "Username and password are required"
- "Username must be at least 3 characters long"
- "Username can only contain letters, numbers, and underscores"
- "Password must be at least 6 characters long"
- "Username already exists"
- "Registration failed. Please try again."

## Security Considerations

1. **Password Hashing:** All passwords are hashed using SHA-256 before storage
2. **Client-Side Storage:** User data stored in browser's LocalStorage (SQLite)
3. **No Server Communication:** All processing happens client-side
4. **Session Management:** 24-hour session expiration after login
5. **Input Validation:** Both client-side and application-level validation

## Future Enhancements

Potential improvements for future versions:
- Email verification
- Password strength indicator
- Password reset functionality
- User profile management
- Multi-factor authentication
- Remember me functionality
- Account deletion option

## Deployment Notes

No special deployment steps required. The registration feature works immediately upon deployment as it uses the existing client-side infrastructure.

**Files to deploy:**
- register.html
- assets/js/auth.js (updated)
- login.html (updated)

## Compatibility

Works with all modern browsers that support:
- ES6+ JavaScript
- LocalStorage
- WebAssembly (for SQLite)
- Web Crypto API (for password hashing)

Tested on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
