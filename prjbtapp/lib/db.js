/*
 * teodeloso@gmail.com
 *
 * Budget Tracker App database library/schema
 */

import Database from 'better-sqlite3';

// Create the database
const db = new Database('budget.db');

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
