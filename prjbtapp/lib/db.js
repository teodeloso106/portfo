/*
 * teodeloso@gmail.com
 *
 * Budget Tracker App database library/schema
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Create the database
// const db = new Database('budget.db');
const templateDbPath = path.join(process.cwd(), 'budget.db'); 
const writeableDbPath = path.join('/tmp', 'budget.db');

try {
  if (!fs.existsSync(writeableDbPath)) {
    if (fs.existsSync(templateDbPath)) {
      fs.copyFileSync(templateDbPath, writeableDbPath);
      // at this point, file is successfully copied
    }
  }
} catch (error) {
  console.error("[ lib/db.js ] Failed to copy database file:", error);
}

const db = new Database(writeableDbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS budgetUsers (
    userId TEXT PRIMARY KEY,
    userName TEXT,
    userBudgetTotalAmt REAL,
    isUserOnline INTEGER,
    lastActive DATETIME
  );

  CREATE TABLE IF NOT EXISTS budgetExpenses (
    id TEXT PRIMARY KEY,
    userId TEXT,
    budgetName TEXT,
    budgetAmt REAL
  );
`);
export default db;
