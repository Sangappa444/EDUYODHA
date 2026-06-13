import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'cutoffs.db');

export function getSqliteDb() {
  const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      console.error('Error connecting to SQLite database:', err.message);
    }
  });
  return db;
}

export function queryAll<T>(sql: string, params: any[] = []): Promise<T[]> {
  const db = getSqliteDb();
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      db.close();
      if (err) {
        reject(err);
      } else {
        resolve(rows as T[]);
      }
    });
  });
}
