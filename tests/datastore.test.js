import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
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

    test('should create default admin user', async () => {
      const passwordHash = await dataStore.hashPassword('admin123');
      const result = await dataStore.verifyUser('admin', passwordHash);
      expect(result.valid).toBe(true);
      expect(result.userId).toBeTruthy();
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
