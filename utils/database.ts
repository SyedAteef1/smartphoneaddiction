import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('smasher.db');

export const initDatabase = () => {
  db.transaction(tx => {
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        childName TEXT,
        parentEmail TEXT,
        parentPhone TEXT
      );`
    );
    
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS usage_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        appName TEXT,
        duration INTEGER,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    );
    
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS rewards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        points INTEGER,
        earnedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    );
  });
};

export const saveUsageLog = (appName: string, duration: number) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO usage_logs (appName, duration) VALUES (?, ?)',
        [appName, duration],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const getUsageLogs = (days: number = 7) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT * FROM usage_logs 
         WHERE timestamp >= datetime('now', '-${days} days')
         ORDER BY timestamp DESC`,
        [],
        (_, { rows }) => resolve(rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const database = { initDatabase, saveUsageLog, getUsageLogs };
