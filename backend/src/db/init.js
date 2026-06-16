const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

let db = null;

function dormirSync(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function openDatabase() {
  if (db) return db;

  const dbPath = process.env.DB_PATH || './festalink.db';
  const conexao = new Database(dbPath, { timeout: 5000 });

  // API e worker abrem o mesmo arquivo. Definir o modo WAL exige um lock
  // exclusivo momentâneo, que pode colidir com o outro processo subindo ao
  // mesmo tempo (SQLITE_BUSY). Tentamos algumas vezes antes de desistir.
  for (let tentativa = 1; ; tentativa++) {
    try {
      conexao.pragma('journal_mode = WAL');
      break;
    } catch (err) {
      if (err.code === 'SQLITE_BUSY' && tentativa < 20) {
        dormirSync(200);
        continue;
      }
      conexao.close();
      throw err;
    }
  }

  conexao.pragma('foreign_keys = ON');

  const schemaPath = path.join(__dirname, 'schema.sql');
  conexao.exec(fs.readFileSync(schemaPath, 'utf8'));

  db = conexao;
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
