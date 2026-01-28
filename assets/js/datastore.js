/**
 * DataStoreManager - Handles all database operations using client-side SQLite
 * Uses sql.js (SQLite compiled to WebAssembly) for browser-based database
 */

class DataStoreManager {
  constructor() {
    this.db = null;
    this.initialized = false;
    this.STORAGE_KEY = 'transport_invoice_db';
  }

  /**
   * Initialize database and create tables
   * Creates default admin user on first initialization
   */
  async initialize() {
    try {
      // Initialize sql.js
      const SQL = await initSqlJs({
        locateFile: file => `assets/lib/${file}`
      });

      // Try to load existing database from LocalStorage
      const savedDb = localStorage.getItem(this.STORAGE_KEY);
      
      if (savedDb) {
        // Load existing database
        const uint8Array = new Uint8Array(JSON.parse(savedDb));
        this.db = new SQL.Database(uint8Array);
        this.initialized = true;
        console.log('Database loaded from LocalStorage');
      } else {
        // Create new database
        this.db = new SQL.Database();
        this.initialized = true; // Set before creating tables and admin
        await this.createTables();
        await this.createDefaultAdmin();
        console.log('New database created and initialized');
      }

      return { success: true };
    } catch (error) {
      console.error('Database initialization failed:', error);
      this.initialized = false;
      return { success: false, error: `Failed to initialize database: ${error.message}` };
    }
  }

  /**
   * Create database tables
   */
  async createTables() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `;

    const createFreightDetailsTable = `
      CREATE TABLE IF NOT EXISTS freight_details (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        origin TEXT NOT NULL,
        destination TEXT NOT NULL,
        goods_description TEXT NOT NULL,
        weight REAL NOT NULL,
        amount REAL NOT NULL,
        discount REAL DEFAULT 0,
        taxes REAL DEFAULT 0,
        eway_bill_number TEXT,
        eway_bill_date TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    const createDocumentHistoryTable = `
      CREATE TABLE IF NOT EXISTS document_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        freight_id INTEGER NOT NULL,
        document_type TEXT NOT NULL,
        generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (freight_id) REFERENCES freight_details(id)
      );
    `;

    // Create indexes for performance
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_freight_user_id ON freight_details(user_id);
      CREATE INDEX IF NOT EXISTS idx_freight_created_at ON freight_details(created_at);
      CREATE INDEX IF NOT EXISTS idx_document_freight_id ON document_history(freight_id);
    `;

    try {
      this.db.run(createUsersTable);
      this.db.run(createFreightDetailsTable);
      this.db.run(createDocumentHistoryTable);
      this.db.run(createIndexes);
      this.persistToLocalStorage();
    } catch (error) {
      console.error('Failed to create tables:', error);
      throw error;
    }
  }

  /**
   * Create default admin user (username: 'admin', password: 'admin123')
   */
  async createDefaultAdmin() {
    try {
      const passwordHash = await this.hashPassword('admin123');
      await this.saveUser('admin', passwordHash);
    } catch (error) {
      console.error('Failed to create default admin:', error);
      throw error;
    }
  }

  /**
   * Hash password using SHA-256
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
   * Persist database to LocalStorage
   */
  persistToLocalStorage() {
    try {
      const data = this.db.export();
      const buffer = Array.from(data);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(buffer));
    } catch (error) {
      console.error('Failed to persist database to LocalStorage:', error);
      throw new Error(`Failed to persist data: ${error.message}`);
    }
  }

  /**
   * Save freight details
   * Returns: { success: boolean, id: number, error: string }
   */
  saveFreightDetails(freightData) {
    if (!this.initialized) {
      console.error('Attempted to save freight details before database initialization');
      return { success: false, error: 'Database not initialized' };
    }

    try {
      const stmt = this.db.prepare(`
        INSERT INTO freight_details (
          user_id, origin, destination, goods_description, 
          weight, amount, discount, taxes, 
          eway_bill_number, eway_bill_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        freightData.userId,
        freightData.origin,
        freightData.destination,
        freightData.goodsDescription,
        freightData.weight,
        freightData.amount,
        freightData.discount || 0,
        freightData.taxes || 0,
        freightData.ewayBillNumber || null,
        freightData.ewayBillDate || null
      ]);

      stmt.free();

      // Get the last inserted ID
      const result = this.db.exec('SELECT last_insert_rowid() as id');
      const id = result[0].values[0][0];

      this.persistToLocalStorage();

      console.log(`Freight details saved successfully with ID: ${id}`);
      return { success: true, id };
    } catch (error) {
      console.error('Failed to save freight details:', error);
      return { success: false, error: `Failed to save data: ${error.message}` };
    }
  }

  /**
   * Retrieve freight details by ID
   * Returns: FreightDetails object or null
   */
  getFreightDetails(id) {
    if (!this.initialized) {
      return null;
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM freight_details WHERE id = ?
      `);

      stmt.bind([id]);
      
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        
        return {
          id: row.id,
          userId: row.user_id,
          origin: row.origin,
          destination: row.destination,
          goodsDescription: row.goods_description,
          weight: row.weight,
          amount: row.amount,
          discount: row.discount,
          taxes: row.taxes,
          ewayBillNumber: row.eway_bill_number,
          ewayBillDate: row.eway_bill_date,
          createdAt: row.created_at
        };
      }

      stmt.free();
      return null;
    } catch (error) {
      console.error('Failed to get freight details:', error);
      return null;
    }
  }

  /**
   * Get all freight records for current user
   * Returns: Array of FreightDetails
   */
  getUserFreightRecords(userId) {
    if (!this.initialized) {
      return [];
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM freight_details 
        WHERE user_id = ? 
        ORDER BY id DESC
      `);

      stmt.bind([userId]);
      
      const records = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        records.push({
          id: row.id,
          userId: row.user_id,
          origin: row.origin,
          destination: row.destination,
          goodsDescription: row.goods_description,
          weight: row.weight,
          amount: row.amount,
          discount: row.discount,
          taxes: row.taxes,
          ewayBillNumber: row.eway_bill_number,
          ewayBillDate: row.eway_bill_date,
          createdAt: row.created_at
        });
      }

      stmt.free();
      return records;
    } catch (error) {
      console.error('Failed to get user freight records:', error);
      return [];
    }
  }

  /**
   * Save user credentials
   */
  async saveUser(username, passwordHash) {
    if (!this.initialized) {
      throw new Error('Database not initialized');
    }

    try {
      const stmt = this.db.prepare(`
        INSERT INTO users (username, password_hash) 
        VALUES (?, ?)
      `);

      stmt.run([username, passwordHash]);
      stmt.free();

      this.persistToLocalStorage();

      return { success: true };
    } catch (error) {
      console.error('Failed to save user:', error);
      
      // Check if it's a duplicate username error
      if (error.message.includes('UNIQUE constraint failed')) {
        throw new Error('Username already exists');
      }
      
      throw error;
    }
  }

  /**
   * Verify user credentials
   * Returns: { valid: boolean, userId: number }
   */
  async verifyUser(username, passwordHash) {
    if (!this.initialized) {
      return { valid: false, userId: null };
    }

    try {
      const stmt = this.db.prepare(`
        SELECT id, password_hash FROM users WHERE username = ?
      `);

      stmt.bind([username]);
      
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        
        const valid = row.password_hash === passwordHash;
        return { valid, userId: valid ? row.id : null };
      }

      stmt.free();
      return { valid: false, userId: null };
    } catch (error) {
      console.error('Failed to verify user:', error);
      return { valid: false, userId: null };
    }
  }

  /**
   * Record document generation in history
   */
  recordDocumentGeneration(freightId, documentType) {
    if (!this.initialized) {
      return { success: false, error: 'Database not initialized' };
    }

    try {
      const stmt = this.db.prepare(`
        INSERT INTO document_history (freight_id, document_type) 
        VALUES (?, ?)
      `);

      stmt.run([freightId, documentType]);
      stmt.free();

      this.persistToLocalStorage();

      return { success: true };
    } catch (error) {
      console.error('Failed to record document generation:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get document generation history for a freight record
   */
  getDocumentHistory(freightId) {
    if (!this.initialized) {
      return [];
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM document_history 
        WHERE freight_id = ? 
        ORDER BY generated_at DESC
      `);

      stmt.bind([freightId]);
      
      const history = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        history.push({
          id: row.id,
          freightId: row.freight_id,
          documentType: row.document_type,
          generatedAt: row.generated_at
        });
      }

      stmt.free();
      return history;
    } catch (error) {
      console.error('Failed to get document history:', error);
      return [];
    }
  }

  /**
   * Update freight details
   * Returns: { success: boolean, error?: string }
   */
  updateFreightDetails(id, freightData) {
    if (!this.initialized) {
      console.error('Attempted to update freight details before database initialization');
      return { success: false, error: 'Database not initialized' };
    }

    try {
      const stmt = this.db.prepare(`
        UPDATE freight_details SET
          origin = ?,
          destination = ?,
          goods_description = ?,
          weight = ?,
          amount = ?,
          discount = ?,
          taxes = ?,
          eway_bill_number = ?,
          eway_bill_date = ?
        WHERE id = ? AND user_id = ?
      `);

      stmt.run([
        freightData.origin,
        freightData.destination,
        freightData.goodsDescription,
        freightData.weight,
        freightData.amount,
        freightData.discount || 0,
        freightData.taxes || 0,
        freightData.ewayBillNumber || null,
        freightData.ewayBillDate || null,
        id,
        freightData.userId
      ]);

      stmt.free();

      this.persistToLocalStorage();

      console.log(`Freight details updated successfully for ID: ${id}`);
      return { success: true };
    } catch (error) {
      console.error('Failed to update freight details:', error);
      return { success: false, error: `Failed to update data: ${error.message}` };
    }
  }

  /**
   * Delete freight details and associated document history
   * Returns: { success: boolean, error?: string }
   */
  deleteFreightDetails(id, userId) {
    if (!this.initialized) {
      console.error('Attempted to delete freight details before database initialization');
      return { success: false, error: 'Database not initialized' };
    }

    try {
      // First delete associated document history
      const deleteHistoryStmt = this.db.prepare(`
        DELETE FROM document_history WHERE freight_id = ?
      `);
      deleteHistoryStmt.run([id]);
      deleteHistoryStmt.free();

      // Then delete the freight record
      const deleteFreightStmt = this.db.prepare(`
        DELETE FROM freight_details WHERE id = ? AND user_id = ?
      `);
      deleteFreightStmt.run([id, userId]);
      deleteFreightStmt.free();

      this.persistToLocalStorage();

      console.log(`Freight details deleted successfully for ID: ${id}`);
      return { success: true };
    } catch (error) {
      console.error('Failed to delete freight details:', error);
      return { success: false, error: `Failed to delete data: ${error.message}` };
    }
  }

  /**
   * Clear all data (for testing or user data reset)
   */
  clearAllData() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      this.db = null;
      this.initialized = false;
      return { success: true };
    } catch (error) {
      console.error('Failed to clear data:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export as ES6 module
export default DataStoreManager;
