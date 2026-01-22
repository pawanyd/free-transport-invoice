// Test setup file for polyfills
import { TextEncoder, TextDecoder } from 'util';
import crypto from 'crypto';

// Add TextEncoder/TextDecoder polyfills for Node.js environment
globalThis.TextEncoder = TextEncoder;
globalThis.TextDecoder = TextDecoder;

// Add crypto.subtle polyfill for Node.js environment
// Node 18+ requires using webcrypto from crypto module
if (!globalThis.crypto) {
  globalThis.crypto = {};
}
globalThis.crypto.subtle = crypto.webcrypto.subtle;
globalThis.crypto.getRandomValues = crypto.webcrypto.getRandomValues.bind(crypto.webcrypto);

// Mock sql.js for testing
global.initSqlJs = async () => {
  // Create a mock SQL.js implementation
  class MockDatabase {
    constructor(data) {
      this.tables = {
        users: [],
        freight_details: [],
        document_history: []
      };
      this.lastInsertId = 0;
    }

    run(sql) {
      // Simple mock that handles CREATE TABLE and INSERT
      if (sql.includes('CREATE TABLE') || sql.includes('CREATE INDEX')) {
        return;
      }
    }

    prepare(sql) {
      const db = this;
      let boundParams = null;
      
      return {
        run(params) {
          if (sql.includes('INSERT INTO users')) {
            db.lastInsertId++;
            const existing = db.tables.users.find(u => u.username === params[0]);
            if (existing) {
              throw new Error('UNIQUE constraint failed: users.username');
            }
            db.tables.users.push({
              id: db.lastInsertId,
              username: params[0],
              password_hash: params[1],
              created_at: new Date().toISOString()
            });
          } else if (sql.includes('INSERT INTO freight_details')) {
            db.lastInsertId++;
            db.tables.freight_details.push({
              id: db.lastInsertId,
              user_id: params[0],
              origin: params[1],
              destination: params[2],
              goods_description: params[3],
              weight: params[4],
              amount: params[5],
              discount: params[6],
              taxes: params[7],
              eway_bill_number: params[8],
              eway_bill_date: params[9],
              created_at: new Date().toISOString()
            });
          }
        },
        bind(params) {
          boundParams = params;
        },
        step() {
          if (sql.includes('SELECT') && sql.includes('FROM users')) {
            const username = boundParams[0];
            this.currentRow = db.tables.users.find(u => u.username === username);
            return !!this.currentRow;
          } else if (sql.includes('SELECT') && sql.includes('FROM freight_details WHERE id')) {
            const id = boundParams[0];
            this.currentRow = db.tables.freight_details.find(f => f.id === id);
            return !!this.currentRow;
          } else if (sql.includes('SELECT') && sql.includes('FROM freight_details') && sql.includes('WHERE user_id')) {
            const userId = boundParams[0];
            if (!this.rows) {
              this.rows = db.tables.freight_details.filter(f => f.user_id === userId);
              this.rowIndex = 0;
            }
            if (this.rowIndex < this.rows.length) {
              return true;
            }
            return false;
          }
          return false;
        },
        getAsObject() {
          if (this.rows && this.rowIndex < this.rows.length) {
            const row = this.rows[this.rowIndex];
            this.rowIndex++;
            return row;
          }
          return this.currentRow;
        },
        free() {
          this.rows = null;
          this.rowIndex = 0;
        }
      };
    }

    exec(sql) {
      if (sql.includes('last_insert_rowid')) {
        return [{
          values: [[this.lastInsertId]]
        }];
      }
      return [];
    }

    export() {
      return new Uint8Array([1, 2, 3, 4]);
    }
  }

  return {
    Database: MockDatabase
  };
};
