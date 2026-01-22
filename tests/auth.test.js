/**
 * Unit tests for AuthManager
 * Tests authentication, session management, and password hashing
 */

import AuthManager from '../assets/js/auth.js';

describe('AuthManager', () => {
  let authManager;

  beforeEach(async () => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Create new AuthManager instance
    authManager = new AuthManager();
    await authManager.initialize();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('login', () => {
    test('should successfully login with valid credentials', async () => {
      const result = await authManager.login('admin', 'admin123');
      
      expect(result.success).toBe(true);
      expect(result.sessionToken).toBeDefined();
      expect(typeof result.sessionToken).toBe('string');
      expect(result.sessionToken.length).toBeGreaterThan(0);
    });

    test('should reject login with invalid username', async () => {
      const result = await authManager.login('invaliduser', 'admin123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid username or password');
      expect(result.sessionToken).toBeUndefined();
    });

    test('should reject login with invalid password', async () => {
      const result = await authManager.login('admin', 'wrongpassword');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid username or password');
      expect(result.sessionToken).toBeUndefined();
    });

    test('should reject login with empty username', async () => {
      const result = await authManager.login('', 'admin123');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid username or password');
    });

    test('should reject login with empty password', async () => {
      const result = await authManager.login('admin', '');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid username or password');
    });

    test('should store session data in localStorage', async () => {
      await authManager.login('admin', 'admin123');
      
      const sessionData = localStorage.getItem('sessionToken');
      expect(sessionData).toBeDefined();
      
      const parsed = JSON.parse(sessionData);
      expect(parsed.token).toBeDefined();
      expect(parsed.userId).toBeDefined();
      expect(parsed.expiresAt).toBeDefined();
    });
  });

  describe('logout', () => {
    test('should clear session data from localStorage', async () => {
      await authManager.login('admin', 'admin123');
      expect(localStorage.getItem('sessionToken')).toBeDefined();
      
      authManager.logout();
      expect(localStorage.getItem('sessionToken')).toBeNull();
    });

    test('should not throw error when logging out without active session', () => {
      expect(() => authManager.logout()).not.toThrow();
    });
  });

  describe('isAuthenticated', () => {
    test('should return true for active session', async () => {
      await authManager.login('admin', 'admin123');
      expect(authManager.isAuthenticated()).toBe(true);
    });

    test('should return false when no session exists', () => {
      expect(authManager.isAuthenticated()).toBe(false);
    });

    test('should return false after logout', async () => {
      await authManager.login('admin', 'admin123');
      authManager.logout();
      expect(authManager.isAuthenticated()).toBe(false);
    });

    test('should clear expired session and return false', async () => {
      await authManager.login('admin', 'admin123');
      
      // Manually set session to expired
      const sessionData = JSON.parse(localStorage.getItem('sessionToken'));
      sessionData.expiresAt = new Date(Date.now() - 1000).toISOString(); // 1 second ago
      localStorage.setItem('sessionToken', JSON.stringify(sessionData));
      
      expect(authManager.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('sessionToken')).toBeNull();
    });

    test('should clear invalid session data and return false', () => {
      localStorage.setItem('sessionToken', 'invalid json');
      expect(authManager.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('sessionToken')).toBeNull();
    });

    test('should clear session with missing fields', () => {
      localStorage.setItem('sessionToken', JSON.stringify({ token: 'abc' }));
      expect(authManager.isAuthenticated()).toBe(false);
      expect(localStorage.getItem('sessionToken')).toBeNull();
    });
  });

  describe('getSessionToken', () => {
    test('should return session token for authenticated user', async () => {
      const loginResult = await authManager.login('admin', 'admin123');
      const token = authManager.getSessionToken();
      
      expect(token).toBe(loginResult.sessionToken);
    });

    test('should return null when not authenticated', () => {
      expect(authManager.getSessionToken()).toBeNull();
    });

    test('should return null after logout', async () => {
      await authManager.login('admin', 'admin123');
      authManager.logout();
      expect(authManager.getSessionToken()).toBeNull();
    });
  });

  describe('session expiration', () => {
    test('should set expiration to 24 hours from login', async () => {
      const beforeLogin = Date.now();
      await authManager.login('admin', 'admin123');
      const afterLogin = Date.now();
      
      const sessionData = JSON.parse(localStorage.getItem('sessionToken'));
      const expiresAt = new Date(sessionData.expiresAt).getTime();
      
      const expectedMin = beforeLogin + (24 * 60 * 60 * 1000);
      const expectedMax = afterLogin + (24 * 60 * 60 * 1000);
      
      expect(expiresAt).toBeGreaterThanOrEqual(expectedMin);
      expect(expiresAt).toBeLessThanOrEqual(expectedMax);
    });
  });

  describe('password hashing', () => {
    test('should hash password using SHA-256', async () => {
      const hash = await authManager.hashPassword('testpassword');
      
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA-256 produces 64 hex characters
      expect(hash).toMatch(/^[a-f0-9]{64}$/); // Only hex characters
    });

    test('should produce consistent hashes for same password', async () => {
      const hash1 = await authManager.hashPassword('testpassword');
      const hash2 = await authManager.hashPassword('testpassword');
      
      expect(hash1).toBe(hash2);
    });

    test('should produce different hashes for different passwords', async () => {
      const hash1 = await authManager.hashPassword('password1');
      const hash2 = await authManager.hashPassword('password2');
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('session token generation', () => {
    test('should generate cryptographically secure token', () => {
      const token = authManager.generateSessionToken();
      
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex characters
      expect(token).toMatch(/^[a-f0-9]{64}$/);
    });

    test('should generate unique tokens', () => {
      const token1 = authManager.generateSessionToken();
      const token2 = authManager.generateSessionToken();
      
      expect(token1).not.toBe(token2);
    });
  });
});
