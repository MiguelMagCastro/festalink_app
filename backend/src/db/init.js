const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

let db = null;

function openDatabase() {
  if (db) return db;

  const dbPath = process.env.DB_PATH || './festalink.db';
  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);

  return db;
}

function getDatabase() {
  if (!db) {
    throw new Error('Database não inicializado. Chame openDatabase() no boot.');
  }
  return db;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { openDatabase, getDatabase, closeDatabase };
