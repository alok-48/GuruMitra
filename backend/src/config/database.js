const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', '..', 'data', 'gurumitra.db');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

let db = null;
let dbReady = null;

function saveToDisk() {
  if (db) {
    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  }
}

function initDb() {
  if (dbReady) return dbReady;
  dbReady = initSqlJs().then(SQL => {
    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
    } else {
      db = new SQL.Database();
    }
    db.run('PRAGMA foreign_keys = ON');

    setInterval(saveToDisk, 5000);
    process.on('exit', saveToDisk);
    process.on('SIGINT', () => { saveToDisk(); process.exit(); });

    return db;
  });
  return dbReady;
}

const handler = {
  get(target, prop) {
    if (prop === 'initDb') return initDb;
    if (prop === 'save') return saveToDisk;
    if (prop === 'getDb') return () => db;

    if (prop === 'prepare') {
      return (sql) => ({
        run: (...params) => {
          db.run(sql, params);
          saveToDisk();
        },
        get: (...params) => {
          const stmt = db.prepare(sql);
          if (params.length) stmt.bind(params);
          const result = stmt.step() ? stmt.getAsObject() : undefined;
          stmt.free();
          return result;
        },
        all: (...params) => {
          const stmt = db.prepare(sql);
          if (params.length) stmt.bind(params);
          const results = [];
          while (stmt.step()) results.push(stmt.getAsObject());
          stmt.free();
          return results;
        },
      });
    }

    if (prop === 'exec') {
      return (sql) => {
        db.exec(sql);
        saveToDisk();
      };
    }

    if (prop === 'pragma') {
      return (pragma) => db.run(`PRAGMA ${pragma}`);
    }

    return undefined;
  }
};

const dbProxy = new Proxy({}, handler);

module.exports = dbProxy;
