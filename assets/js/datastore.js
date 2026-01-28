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
        
        // Run migrations for existing database
        await this.runMigrations();
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
   * Run database migrations for existing databases
   */
  async runMigrations() {
    try {
      // Check if company_profiles table exists
      const companyTableExists = this.tableExists('company_profiles');
      if (!companyTableExists) {
        console.log('Running migration: Adding company_profiles table');
        const createCompanyProfilesTable = `
          CREATE TABLE IF NOT EXISTS company_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            address TEXT,
            city TEXT,
            state TEXT,
            pincode TEXT,
            gst_number TEXT,
            pan_number TEXT,
            phone TEXT,
            email TEXT,
            website TEXT,
            is_default INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
          );
        `;
        this.db.run(createCompanyProfilesTable);
        this.db.run('CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON company_profiles(user_id);');
      }

      // Check if custom_field_definitions table exists
      const customFieldsTableExists = this.tableExists('custom_field_definitions');
      if (!customFieldsTableExists) {
        console.log('Running migration: Adding custom_field_definitions table');
        const createCustomFieldsTable = `
          CREATE TABLE IF NOT EXISTS custom_field_definitions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            field_name TEXT NOT NULL,
            field_label TEXT NOT NULL,
            field_type TEXT NOT NULL,
            is_required INTEGER DEFAULT 0,
            options TEXT,
            display_order INTEGER DEFAULT 0,
            is_active INTEGER DEFAULT 1,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
          );
        `;
        this.db.run(createCustomFieldsTable);
        this.db.run('CREATE INDEX IF NOT EXISTS idx_custom_fields_user_id ON custom_field_definitions(user_id);');
      }

      // Check if freight_details has new columns
      const hasCompanyProfileId = this.columnExists('freight_details', 'company_profile_id');
      if (!hasCompanyProfileId) {
        console.log('Running migration: Adding company_profile_id to freight_details');
        this.db.run('ALTER TABLE freight_details ADD COLUMN company_profile_id INTEGER;');
        this.db.run('CREATE INDEX IF NOT EXISTS idx_freight_company_profile ON freight_details(company_profile_id);');
      }

      const hasCustomFields = this.columnExists('freight_details', 'custom_fields');
      if (!hasCustomFields) {
        console.log('Running migration: Adding custom_fields to freight_details');
        this.db.run('ALTER TABLE freight_details ADD COLUMN custom_fields TEXT;');
      }

      this.persistToLocalStorage();
      console.log('Migrations completed successfully');
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Check if a table exists
   */
  tableExists(tableName) {
    try {
      const result = this.db.exec(`SELECT name FROM sqlite_master WHERE type='table' AND name='${tableName}';`);
      return result.length > 0 && result[0].values.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if a column exists in a table
   */
  columnExists(tableName, columnName) {
    try {
      const result = this.db.exec(`PRAGMA table_info(${tableName});`);
      if (result.length === 0) return false;
      
      const columns = result[0].values;
      return columns.some(col => col[1] === columnName);
    } catch (error) {
      return false;
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
        company_profile_id INTEGER,
        origin TEXT NOT NULL,
        destination TEXT NOT NULL,
        goods_description TEXT NOT NULL,
        weight REAL NOT NULL,
        amount REAL NOT NULL,
        discount REAL DEFAULT 0,
        taxes REAL DEFAULT 0,
        eway_bill_number TEXT,
        eway_bill_date TEXT,
        custom_fields TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (company_profile_id) REFERENCES company_profiles(id)
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

    const createCompanyProfilesTable = `
      CREATE TABLE IF NOT EXISTS company_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        address TEXT,
        city TEXT,
        state TEXT,
        pincode TEXT,
        gst_number TEXT,
        pan_number TEXT,
        phone TEXT,
        email TEXT,
        website TEXT,
        is_default INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    const createCustomFieldsTable = `
      CREATE TABLE IF NOT EXISTS custom_field_definitions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        field_name TEXT NOT NULL,
        field_label TEXT NOT NULL,
        field_type TEXT NOT NULL,
        is_required INTEGER DEFAULT 0,
        options TEXT,
        display_order INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    // Create indexes for performance
    const createIndexes = `
      CREATE INDEX IF NOT EXISTS idx_freight_user_id ON freight_details(user_id);
      CREATE INDEX IF NOT EXISTS idx_freight_created_at ON freight_details(created_at);
      CREATE INDEX IF NOT EXISTS idx_freight_company_profile ON freight_details(company_profile_id);
      CREATE INDEX IF NOT EXISTS idx_document_freight_id ON document_history(freight_id);
      CREATE INDEX IF NOT EXISTS idx_company_profiles_user_id ON company_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_custom_fields_user_id ON custom_field_definitions(user_id);
    `;

    try {
      this.db.run(createUsersTable);
      this.db.run(createFreightDetailsTable);
      this.db.run(createDocumentHistoryTable);
      this.db.run(createCompanyProfilesTable);
      this.db.run(createCustomFieldsTable);
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

  // ===== COMPANY PROFILE METHODS =====

  /**
   * Save company profile
   */
  saveCompanyProfile(profileData) {
    if (!this.initialized) {
      return { success: false, error: 'Database not initialized' };
    }

    try {
      const stmt = this.db.prepare(`
        INSERT INTO company_profiles (
          user_id, name, address, city, state, pincode,
          gst_number, pan_number, phone, email, website, is_default
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        profileData.userId,
        profileData.name,
        profileData.address || null,
        profileData.city || null,
        profileData.state || null,
        profileData.pincode || null,
        profileData.gstNumber || null,
        profileData.panNumber || null,
        profileData.phone || null,
        profileData.email || null,
        profileData.website || null,
        profileData.isDefault ? 1 : 0
      ]);

      stmt.free();

      const result = this.db.exec('SELECT last_insert_rowid() as id');
      const id = result[0].values[0][0];

      // If this is set as default, unset other defaults
      if (profileData.isDefault) {
        this.unsetOtherDefaults(profileData.userId, id);
      }

      this.persistToLocalStorage();
      return { success: true, id };
    } catch (error) {
      console.error('Failed to save company profile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update company profile
   */
  updateCompanyProfile(id, profileData) {
    if (!this.initialized) {
      return { success: false, error: 'Database not initialized' };
    }

    try {
      const stmt = this.db.prepare(`
        UPDATE company_profiles SET
          name = ?, address = ?, city = ?, state = ?, pincode = ?,
          gst_number = ?, pan_number = ?, phone = ?, email = ?, website = ?, is_default = ?
        WHERE id = ? AND user_id = ?
      `);

      stmt.run([
        profileData.name,
        profileData.address || null,
        profileData.city || null,
        profileData.state || null,
        profileData.pincode || null,
        profileData.gstNumber || null,
        profileData.panNumber || null,
        profileData.phone || null,
        profileData.email || null,
        profileData.website || null,
        profileData.isDefault ? 1 : 0,
        id,
        profileData.userId
      ]);

      stmt.free();

      if (profileData.isDefault) {
        this.unsetOtherDefaults(profileData.userId, id);
      }

      this.persistToLocalStorage();
      return { success: true };
    } catch (error) {
      console.error('Failed to update company profile:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Unset other default profiles
   */
  unsetOtherDefaults(userId, exceptId) {
    try {
      const stmt = this.db.prepare(`
        UPDATE company_profiles SET is_default = 0
        WHERE user_id = ? AND id != ?
      `);
      stmt.run([userId, exceptId]);
      stmt.free();
    } catch (error) {
      console.error('Failed to unset other defaults:', error);
    }
  }

  /**
   * Get all company profiles for user
   */
  getUserCompanyProfiles(userId) {
    if (!this.initialized) {
      return [];
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM company_profiles
        WHERE user_id = ?
        ORDER BY is_default DESC, name ASC
      `);

      stmt.bind([userId]);
      
      const profiles = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        profiles.push({
          id: row.id,
          userId: row.user_id,
          name: row.name,
          address: row.address,
          city: row.city,
          state: row.state,
          pincode: row.pincode,
          gstNumber: row.gst_number,
          panNumber: row.pan_number,
          phone: row.phone,
          email: row.email,
          website: row.website,
          isDefault: row.is_default === 1,
          createdAt: row.created_at
        });
      }

      stmt.free();
      return profiles;
    } catch (error) {
      console.error('Failed to get company profiles:', error);
      return [];
    }
  }

  /**
   * Get default company profile
   */
  getDefaultCompanyProfile(userId) {
    if (!this.initialized) {
      return null;
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM company_profiles
        WHERE user_id = ? AND is_default = 1
        LIMIT 1
      `);

      stmt.bind([userId]);
      
      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return {
          id: row.id,
          userId: row.user_id,
          name: row.name,
          address: row.address,
          city: row.city,
          state: row.state,
          pincode: row.pincode,
          gstNumber: row.gst_number,
          panNumber: row.pan_number,
          phone: row.phone,
          email: row.email,
          website: row.website,
          isDefault: true,
          createdAt: row.created_at
        };
      }

      stmt.free();
      return null;
    } catch (error) {
      console.error('Failed to get default company profile:', error);
      return null;
    }
  }

  /**
   * Delete company profile
   */
  deleteCompanyProfile(id, userId) {
    if (!this.initialized) {
      return { success: false, error: 'Database not initialized' };
    }

    try {
      const stmt = this.db.prepare(`
        DELETE FROM company_profiles WHERE id = ? AND user_id = ?
      `);
      stmt.run([id, userId]);
      stmt.free();

      this.persistToLocalStorage();
      return { success: true };
    } catch (error) {
      console.error('Failed to delete company profile:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== CUSTOM FIELDS METHODS =====

  /**
   * Save custom field definition
   */
  saveCustomField(fieldData) {
    if (!this.initialized) {
      return { success: false, error: 'Database not initialized' };
    }

    try {
      const stmt = this.db.prepare(`
        INSERT INTO custom_field_definitions (
          user_id, field_name, field_label, field_type,
          is_required, options, display_order, is_active
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        fieldData.userId,
        fieldData.fieldName,
        fieldData.fieldLabel,
        fieldData.fieldType,
        fieldData.isRequired ? 1 : 0,
        fieldData.options ? JSON.stringify(fieldData.options) : null,
        fieldData.displayOrder || 0,
        fieldData.isActive !== false ? 1 : 0
      ]);

      stmt.free();

      const result = this.db.exec('SELECT last_insert_rowid() as id');
      const id = result[0].values[0][0];

      this.persistToLocalStorage();
      return { success: true, id };
    } catch (error) {
      console.error('Failed to save custom field:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get all custom fields for user
   */
  getUserCustomFields(userId) {
    if (!this.initialized) {
      return [];
    }

    try {
      const stmt = this.db.prepare(`
        SELECT * FROM custom_field_definitions
        WHERE user_id = ? AND is_active = 1
        ORDER BY display_order ASC, field_label ASC
      `);

      stmt.bind([userId]);
      
      const fields = [];
      while (stmt.step()) {
        const row = stmt.getAsObject();
        fields.push({
          id: row.id,
          userId: row.user_id,
          fieldName: row.field_name,
          fieldLabel: row.field_label,
          fieldType: row.field_type,
          isRequired: row.is_required === 1,
          options: row.options ? JSON.parse(row.options) : null,
          displayOrder: row.display_order,
          isActive: row.is_active === 1,
          createdAt: row.created_at
        });
      }

      stmt.free();
      return fields;
    } catch (error) {
      console.error('Failed to get custom fields:', error);
      return [];
    }
  }

  /**
   * Delete custom field
   */
  deleteCustomField(id, userId) {
    if (!this.initialized) {
      return { success: false, error: 'Database not initialized' };
    }

    try {
      const stmt = this.db.prepare(`
        UPDATE custom_field_definitions SET is_active = 0
        WHERE id = ? AND user_id = ?
      `);
      stmt.run([id, userId]);
      stmt.free();

      this.persistToLocalStorage();
      return { success: true };
    } catch (error) {
      console.error('Failed to delete custom field:', error);
      return { success: false, error: error.message };
    }
  }

  // ===== BACKUP & RESTORE METHODS =====

  /**
   * Export entire database to JSON
   */
  exportBackup() {
    if (!this.initialized) {
      return { success: false, error: 'Database not initialized' };
    }

    try {
      const backup = {
        version: '1.0',
        exportDate: new Date().toISOString(),
        data: {}
      };

      // Export all tables
      const tables = ['users', 'freight_details', 'document_history', 'company_profiles', 'custom_field_definitions'];
      
      tables.forEach(tableName => {
        try {
          const result = this.db.exec(`SELECT * FROM ${tableName}`);
          if (result.length > 0) {
            const columns = result[0].columns;
            const values = result[0].values;
            backup.data[tableName] = values.map(row => {
              const obj = {};
              columns.forEach((col, idx) => {
                obj[col] = row[idx];
              });
              return obj;
            });
          } else {
            backup.data[tableName] = [];
          }
        } catch (error) {
          console.warn(`Table ${tableName} not found, skipping`);
          backup.data[tableName] = [];
        }
      });

      return { success: true, data: backup };
    } catch (error) {
      console.error('Failed to export backup:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Import backup from JSON
   */
  async importBackup(backupData) {
    try {
      // Validate backup data
      if (!backupData.version || !backupData.data) {
        return { success: false, error: 'Invalid backup file format' };
      }

      // Clear existing database
      this.clearAllData();

      // Reinitialize
      const SQL = await initSqlJs({
        locateFile: file => `assets/lib/${file}`
      });
      this.db = new SQL.Database();
      this.initialized = true;

      // Create tables
      await this.createTables();

      // Import data
      const tables = ['users', 'freight_details', 'document_history', 'company_profiles', 'custom_field_definitions'];
      
      for (const tableName of tables) {
        const tableData = backupData.data[tableName];
        if (!tableData || tableData.length === 0) continue;

        // Get column names from first row
        const columns = Object.keys(tableData[0]);
        const placeholders = columns.map(() => '?').join(', ');
        
        const stmt = this.db.prepare(`
          INSERT INTO ${tableName} (${columns.join(', ')})
          VALUES (${placeholders})
        `);

        tableData.forEach(row => {
          const values = columns.map(col => row[col]);
          stmt.run(values);
        });

        stmt.free();
      }

      this.persistToLocalStorage();
      
      // Update last backup date
      localStorage.setItem('lastBackupDate', new Date().toISOString());

      return { success: true };
    } catch (error) {
      console.error('Failed to import backup:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get database statistics
   */
  getDatabaseStats() {
    if (!this.initialized) {
      return null;
    }

    try {
      const stats = {};

      // Count records in each table
      const tables = ['freight_details', 'company_profiles', 'custom_field_definitions'];
      tables.forEach(tableName => {
        try {
          const result = this.db.exec(`SELECT COUNT(*) as count FROM ${tableName}`);
          stats[tableName] = result[0]?.values[0]?.[0] || 0;
        } catch (error) {
          stats[tableName] = 0;
        }
      });

      // Calculate database size
      const dbData = localStorage.getItem(this.STORAGE_KEY);
      stats.sizeBytes = dbData ? dbData.length : 0;
      stats.sizeKB = (stats.sizeBytes / 1024).toFixed(2);

      return stats;
    } catch (error) {
      console.error('Failed to get database stats:', error);
      return null;
    }
  }
}

// Export as ES6 module
export default DataStoreManager;
