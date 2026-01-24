/**
 * AuthManager - Manages user authentication and session state
 * Handles login, logout, session validation, and password hashing
 */

import DataStoreManager from './datastore.js';

class AuthManager {
  constructor() {
    this.dataStore = new DataStoreManager();
    this.SESSION_KEY = 'sessionToken';
    this.SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  }

  /**
   * Initialize the data store
   * Must be called before using authentication methods
   */
  async initialize() {
    return await this.dataStore.initialize();
  }

  /**
   * Hash password using SHA-256
   * @param {string} password - Plain text password
   * @returns {Promise<string>} - Hex string of hashed password
   */
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  /**
   * Generate a cryptographically secure session token
   * @returns {string} - Random session token
   */
  generateSessionToken() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Authenticate user with credentials
   * @param {string} username - Username
   * @param {string} password - Plain text password
   * @returns {Promise<{success: boolean, sessionToken?: string, error?: string}>}
   */
  async login(username, password) {
    try {
      // Validate inputs
      if (!username || !password) {
        console.warn('Login attempt failed: Empty username or password');
        return { success: false, error: 'Invalid username or password' };
      }

      // Hash the password
      const passwordHash = await this.hashPassword(password);

      // Verify credentials
      const verification = await this.dataStore.verifyUser(username, passwordHash);

      if (!verification.valid) {
        // Log failed attempt for debugging (don't reveal which field is incorrect)
        console.warn(`Login attempt failed for username: ${username}`);
        return { success: false, error: 'Invalid username or password' };
      }

      // Generate session token
      const sessionToken = this.generateSessionToken();
      const expiresAt = new Date(Date.now() + this.SESSION_DURATION).toISOString();

      // Store session data
      const sessionData = {
        token: sessionToken,
        userId: verification.userId,
        expiresAt: expiresAt
      };

      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));

      return { success: true, sessionToken };
    } catch (error) {
      console.error('Login failed:', error);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  }

  /**
   * Terminate current session
   */
  logout() {
    try {
      localStorage.removeItem(this.SESSION_KEY);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  /**
   * Check if user has active session
   * Automatically clears expired sessions
   * @returns {boolean} - True if session is active and valid
   */
  isAuthenticated() {
    try {
      const sessionDataStr = localStorage.getItem(this.SESSION_KEY);

      if (!sessionDataStr) {
        return false;
      }

      const sessionData = JSON.parse(sessionDataStr);

      // Check if session has required fields
      if (!sessionData.token || !sessionData.userId || !sessionData.expiresAt) {
        this.logout(); // Clear invalid session
        return false;
      }

      // Check if session has expired
      const expiresAt = new Date(sessionData.expiresAt);
      const now = new Date();

      if (now >= expiresAt) {
        console.warn('Session expired, clearing session data');
        // Set expiration flag before clearing session
        localStorage.setItem('sessionExpired', 'true');
        this.logout(); // Clear expired session
        return false;
      }

      return true;
    } catch (error) {
      console.error('Session validation failed:', error);
      this.logout(); // Clear corrupted session
      return false;
    }
  }

  /**
   * Get current session token
   * @returns {string|null} - Session token or null if not authenticated
   */
  getSessionToken() {
    try {
      if (!this.isAuthenticated()) {
        return null;
      }

      const sessionDataStr = localStorage.getItem(this.SESSION_KEY);
      const sessionData = JSON.parse(sessionDataStr);

      return sessionData.token;
    } catch (error) {
      console.error('Failed to get session token:', error);
      return null;
    }
  }

  /**
   * Get current user ID from session
   * @returns {number|null} - User ID or null if not authenticated
   */
  getUserId() {
    try {
      if (!this.isAuthenticated()) {
        return null;
      }

      const sessionDataStr = localStorage.getItem(this.SESSION_KEY);
      const sessionData = JSON.parse(sessionDataStr);

      return sessionData.userId;
    } catch (error) {
      console.error('Failed to get user ID:', error);
      return null;
    }
  }

  /**
   * Register a new user
   * @param {string} username - Username (must be unique)
   * @param {string} password - Plain text password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async register(username, password) {
    try {
      // Validate inputs
      if (!username || !password) {
        return { success: false, error: 'Username and password are required' };
      }

      // Validate username format
      if (username.length < 3) {
        return { success: false, error: 'Username must be at least 3 characters long' };
      }

      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        return { success: false, error: 'Username can only contain letters, numbers, and underscores' };
      }

      // Validate password strength
      if (password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters long' };
      }

      // Hash the password
      const passwordHash = await this.hashPassword(password);

      // Save user to database
      const result = await this.dataStore.saveUser(username, passwordHash);

      if (!result.success) {
        return { success: false, error: result.error };
      }

      console.log(`User registered successfully: ${username}`);
      return { success: true };
    } catch (error) {
      console.error('Registration failed:', error);
      
      if (error.message.includes('already exists')) {
        return { success: false, error: 'Username already exists' };
      }
      
      return { success: false, error: 'Registration failed. Please try again.' };
    }
  }
}

// Export as ES6 module
export default AuthManager;
