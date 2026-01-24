import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import fc from 'fast-check';
import DataStoreManager from '../assets/js/datastore.js';

describe('DataStoreManager - Unit Tests', () => {
  let dataStore;

  beforeEach(async () => {
    // Clear localStorage before each test
    localStorage.clear();
    dataStore = new DataStoreManager();
    await dataStore.initialize();
  });

  afterEach(() => {
    if (dataStore) {
      dataStore.clearAllData();
    }
  });

  describe('Database Initialization', () => {
    test('should initialize database successfully', async () => {
      expect(dataStore.initialized).toBe(true);
      expect(dataStore.db).not.toBeNull();
    });

    test('should create tables on initialization', async () => {
      // Tables should be created (verified by no errors during initialization)
      expect(dataStore.initialized).toBe(true);
    });

    test('should create all required tables with correct schema', async () => {
      // Verify database is initialized
      expect(dataStore.initialized).toBe(true);
      expect(dataStore.db).not.toBeNull();
      
      // Verify users table exists and has correct schema by using it
      const testUsername = 'schema_test_user';
      const testPasswordHash = await dataStore.hashPassword('test123');
      const saveUserResult = await dataStore.saveUser(testUsername, testPasswordHash);
      expect(saveUserResult.success).toBe(true);
      
      const verifyResult = await dataStore.verifyUser(testUsername, testPasswordHash);
      expect(verifyResult.valid).toBe(true);
      expect(verifyResult.userId).toBeTruthy();
      
      // Verify freight_details table exists and has correct schema by using it
      const testFreight = {
        userId: verifyResult.userId,
        origin: 'Test Origin',
        destination: 'Test Destination',
        goodsDescription: 'Test Goods',
        weight: 100,
        amount: 5000,
        discount: 100,
        taxes: 900,
        ewayBillNumber: 'TEST123',
        ewayBillDate: '2024-01-01'
      };
      const saveFreightResult = dataStore.saveFreightDetails(testFreight);
      expect(saveFreightResult.success).toBe(true);
      expect(saveFreightResult.id).toBeTruthy();
      
      // Verify all fields are stored correctly (proves schema has all required columns)
      const retrievedFreight = dataStore.getFreightDetails(saveFreightResult.id);
      expect(retrievedFreight).not.toBeNull();
      expect(retrievedFreight.id).toBe(saveFreightResult.id);
      expect(retrievedFreight.userId).toBe(testFreight.userId);
      expect(retrievedFreight.origin).toBe(testFreight.origin);
      expect(retrievedFreight.destination).toBe(testFreight.destination);
      expect(retrievedFreight.goodsDescription).toBe(testFreight.goodsDescription);
      expect(retrievedFreight.weight).toBe(testFreight.weight);
      expect(retrievedFreight.amount).toBe(testFreight.amount);
      expect(retrievedFreight.discount).toBe(testFreight.discount);
      expect(retrievedFreight.taxes).toBe(testFreight.taxes);
      expect(retrievedFreight.ewayBillNumber).toBe(testFreight.ewayBillNumber);
      expect(retrievedFreight.ewayBillDate).toBe(testFreight.ewayBillDate);
      expect(retrievedFreight.createdAt).toBeTruthy();
    });

    test('should create default admin user', async () => {
      const passwordHash = await dataStore.hashPassword('admin123');
      const result = await dataStore.verifyUser('admin', passwordHash);
      expect(result.valid).toBe(true);
      expect(result.userId).toBeTruthy();
    });

    test('should handle database initialization errors gracefully', async () => {
      // Create a new datastore instance without initializing
      const uninitializedStore = new DataStoreManager();
      
      // Attempt to save data before initialization
      const result = uninitializedStore.saveFreightDetails({
        userId: 1,
        origin: 'Mumbai',
        destination: 'Delhi',
        goodsDescription: 'Test',
        weight: 100,
        amount: 5000
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database not initialized');
    });
  });

  describe('User Management', () => {
    test('should save a new user', async () => {
      const passwordHash = await dataStore.hashPassword('testpass');
      const result = await dataStore.saveUser('testuser', passwordHash);
      expect(result.success).toBe(true);
    });

    test('should verify valid user credentials', async () => {
      const passwordHash = await dataStore.hashPassword('testpass');
      await dataStore.saveUser('testuser', passwordHash);
      
      const result = await dataStore.verifyUser('testuser', passwordHash);
      expect(result.valid).toBe(true);
      expect(result.userId).toBeTruthy();
    });

    test('should reject invalid credentials', async () => {
      const passwordHash = await dataStore.hashPassword('testpass');
      await dataStore.saveUser('testuser', passwordHash);
      
      const wrongHash = await dataStore.hashPassword('wrongpass');
      const result = await dataStore.verifyUser('testuser', wrongHash);
      expect(result.valid).toBe(false);
      expect(result.userId).toBeNull();
    });

    test('should handle duplicate username', async () => {
      const passwordHash = await dataStore.hashPassword('testpass');
      await dataStore.saveUser('testuser', passwordHash);
      
      await expect(async () => {
        await dataStore.saveUser('testuser', passwordHash);
      }).rejects.toThrow('Username already exists');
    });
  });

  describe('Freight Details Management', () => {
    test('should save freight details', () => {
      const freightData = {
        userId: 1,
        origin: 'Mumbai',
        destination: 'Delhi',
        goodsDescription: 'Electronics',
        weight: 100,
        amount: 5000,
        discount: 100,
        taxes: 900
      };

      const result = dataStore.saveFreightDetails(freightData);
      expect(result.success).toBe(true);
      expect(result.id).toBeTruthy();
    });

    test('should retrieve freight details by ID', () => {
      const freightData = {
        userId: 1,
        origin: 'Mumbai',
        destination: 'Delhi',
        goodsDescription: 'Electronics',
        weight: 100,
        amount: 5000,
        discount: 100,
        taxes: 900
      };

      const saveResult = dataStore.saveFreightDetails(freightData);
      const retrieved = dataStore.getFreightDetails(saveResult.id);

      expect(retrieved).not.toBeNull();
      expect(retrieved.origin).toBe('Mumbai');
      expect(retrieved.destination).toBe('Delhi');
      expect(retrieved.goodsDescription).toBe('Electronics');
      expect(retrieved.weight).toBe(100);
      expect(retrieved.amount).toBe(5000);
    });

    test('should get all freight records for a user', () => {
      const freightData1 = {
        userId: 1,
        origin: 'Mumbai',
        destination: 'Delhi',
        goodsDescription: 'Electronics',
        weight: 100,
        amount: 5000
      };

      const freightData2 = {
        userId: 1,
        origin: 'Pune',
        destination: 'Bangalore',
        goodsDescription: 'Furniture',
        weight: 200,
        amount: 8000
      };

      dataStore.saveFreightDetails(freightData1);
      dataStore.saveFreightDetails(freightData2);

      const records = dataStore.getUserFreightRecords(1);
      expect(records.length).toBe(2);
    });

    test('should handle missing eWay bill gracefully', () => {
      const freightData = {
        userId: 1,
        origin: 'Mumbai',
        destination: 'Delhi',
        goodsDescription: 'Electronics',
        weight: 100,
        amount: 5000
      };

      const result = dataStore.saveFreightDetails(freightData);
      const retrieved = dataStore.getFreightDetails(result.id);

      expect(retrieved.ewayBillNumber).toBeNull();
      expect(retrieved.ewayBillDate).toBeNull();
    });

    test('should save eWay bill information when provided', () => {
      const freightData = {
        userId: 1,
        origin: 'Mumbai',
        destination: 'Delhi',
        goodsDescription: 'Electronics',
        weight: 100,
        amount: 5000,
        ewayBillNumber: 'EWB123456',
        ewayBillDate: '2024-01-15'
      };

      const result = dataStore.saveFreightDetails(freightData);
      const retrieved = dataStore.getFreightDetails(result.id);

      expect(retrieved.ewayBillNumber).toBe('EWB123456');
      expect(retrieved.ewayBillDate).toBe('2024-01-15');
    });
  });

  describe('Edge Cases', () => {
    test('should handle zero discount and taxes', () => {
      const freightData = {
        userId: 1,
        origin: 'Mumbai',
        destination: 'Delhi',
        goodsDescription: 'Electronics',
        weight: 100,
        amount: 5000,
        discount: 0,
        taxes: 0
      };

      const result = dataStore.saveFreightDetails(freightData);
      const retrieved = dataStore.getFreightDetails(result.id);

      expect(retrieved.discount).toBe(0);
      expect(retrieved.taxes).toBe(0);
    });

    test('should return null for non-existent freight ID', () => {
      const retrieved = dataStore.getFreightDetails(99999);
      expect(retrieved).toBeNull();
    });

    test('should return empty array for user with no freight records', () => {
      const records = dataStore.getUserFreightRecords(99999);
      expect(records).toEqual([]);
    });
  });

  describe('Password Hashing', () => {
    test('should hash passwords consistently', async () => {
      const hash1 = await dataStore.hashPassword('testpass');
      const hash2 = await dataStore.hashPassword('testpass');
      expect(hash1).toBe(hash2);
    });

    test('should produce different hashes for different passwords', async () => {
      const hash1 = await dataStore.hashPassword('testpass1');
      const hash2 = await dataStore.hashPassword('testpass2');
      expect(hash1).not.toBe(hash2);
    });
  });
});

// Feature: transport-invoice-system, Property 7: Data persistence round-trip
describe('DataStoreManager - Property-Based Tests', () => {
  let dataStore;

  beforeEach(async () => {
    localStorage.clear();
    dataStore = new DataStoreManager();
    await dataStore.initialize();
  });

  afterEach(() => {
    if (dataStore) {
      dataStore.clearAllData();
    }
  });

  describe('Property 7: Data persistence round-trip', () => {
    test('freight details round-trip preserves all fields', () => {
      fc.assert(
        fc.property(
          fc.record({
            userId: fc.integer({ min: 1, max: 1000 }),
            origin: fc.string({ minLength: 1, maxLength: 100 }),
            destination: fc.string({ minLength: 1, maxLength: 100 }),
            goodsDescription: fc.string({ minLength: 1, maxLength: 200 }),
            weight: fc.float({ min: Math.fround(0.1), max: Math.fround(10000), noNaN: true }),
            amount: fc.float({ min: Math.fround(0.1), max: Math.fround(1000000), noNaN: true }),
            discount: fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true }),
            taxes: fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true }),
            ewayBillNumber: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: null }),
            ewayBillDate: fc.option(fc.string({ minLength: 1, maxLength: 20 }), { nil: null })
          }),
          (freightDetails) => {
            // Save freight details
            const saved = dataStore.saveFreightDetails(freightDetails);
            
            // Verify save was successful
            expect(saved.success).toBe(true);
            expect(saved.id).toBeTruthy();
            
            // Retrieve freight details
            const retrieved = dataStore.getFreightDetails(saved.id);
            
            // Verify retrieval was successful
            expect(retrieved).not.toBeNull();
            
            // Verify all fields are preserved
            expect(retrieved.userId).toBe(freightDetails.userId);
            expect(retrieved.origin).toBe(freightDetails.origin);
            expect(retrieved.destination).toBe(freightDetails.destination);
            expect(retrieved.goodsDescription).toBe(freightDetails.goodsDescription);
            
            // Use toBeCloseTo for floating point comparisons
            expect(retrieved.weight).toBeCloseTo(freightDetails.weight, 5);
            expect(retrieved.amount).toBeCloseTo(freightDetails.amount, 5);
            expect(retrieved.discount).toBeCloseTo(freightDetails.discount, 5);
            expect(retrieved.taxes).toBeCloseTo(freightDetails.taxes, 5);
            
            // Verify optional fields
            expect(retrieved.ewayBillNumber).toBe(freightDetails.ewayBillNumber);
            expect(retrieved.ewayBillDate).toBe(freightDetails.ewayBillDate);
            
            // Verify auto-generated fields exist
            expect(retrieved.id).toBe(saved.id);
            expect(retrieved.createdAt).toBeTruthy();
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 23: User data isolation', () => {
    test('freight details saved by one user are not accessible to another user', () => {
      fc.assert(
        fc.property(
          // Generate two different user IDs
          fc.integer({ min: 1, max: 1000 }),
          fc.integer({ min: 1, max: 1000 }),
          // Generate freight details for user 1
          fc.record({
            origin: fc.string({ minLength: 1, maxLength: 100 }),
            destination: fc.string({ minLength: 1, maxLength: 100 }),
            goodsDescription: fc.string({ minLength: 1, maxLength: 200 }),
            weight: fc.float({ min: Math.fround(0.1), max: Math.fround(10000), noNaN: true }),
            amount: fc.float({ min: Math.fround(0.1), max: Math.fround(1000000), noNaN: true }),
            discount: fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true }),
            taxes: fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true })
          }),
          // Generate freight details for user 2
          fc.record({
            origin: fc.string({ minLength: 1, maxLength: 100 }),
            destination: fc.string({ minLength: 1, maxLength: 100 }),
            goodsDescription: fc.string({ minLength: 1, maxLength: 200 }),
            weight: fc.float({ min: Math.fround(0.1), max: Math.fround(10000), noNaN: true }),
            amount: fc.float({ min: Math.fround(0.1), max: Math.fround(1000000), noNaN: true }),
            discount: fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true }),
            taxes: fc.float({ min: Math.fround(0), max: Math.fround(10000), noNaN: true })
          }),
          (userId1, userId2, freightData1, freightData2) => {
            // Skip if user IDs are the same (we need different users)
            fc.pre(userId1 !== userId2);
            
            // Save freight details for user 1
            const user1Freight = { ...freightData1, userId: userId1 };
            const saved1 = dataStore.saveFreightDetails(user1Freight);
            expect(saved1.success).toBe(true);
            
            // Save freight details for user 2
            const user2Freight = { ...freightData2, userId: userId2 };
            const saved2 = dataStore.saveFreightDetails(user2Freight);
            expect(saved2.success).toBe(true);
            
            // Get freight records for user 1
            const user1Records = dataStore.getUserFreightRecords(userId1);
            
            // Get freight records for user 2
            const user2Records = dataStore.getUserFreightRecords(userId2);
            
            // Verify user 1's records contain only their freight details
            expect(user1Records.length).toBeGreaterThan(0);
            const user1HasOnlyOwnData = user1Records.every(record => record.userId === userId1);
            expect(user1HasOnlyOwnData).toBe(true);
            
            // Verify user 2's records contain only their freight details
            expect(user2Records.length).toBeGreaterThan(0);
            const user2HasOnlyOwnData = user2Records.every(record => record.userId === userId2);
            expect(user2HasOnlyOwnData).toBe(true);
            
            // Verify user 1's records do not contain user 2's freight ID
            const user1RecordIds = user1Records.map(r => r.id);
            expect(user1RecordIds).not.toContain(saved2.id);
            
            // Verify user 2's records do not contain user 1's freight ID
            const user2RecordIds = user2Records.map(r => r.id);
            expect(user2RecordIds).not.toContain(saved1.id);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
