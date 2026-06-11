/*
 * teodeloso@gmail.com
 *
 * Database servicess for the user page routing layer
 */

import db from './db';
import {MAX_EXPENSES} from './constants';

// Get expenses by user
export function getExpensesByUser(userId) {

  const createExpenseByUserTransaction = db.transaction((tUserId) => {
    return db.prepare('SELECT * FROM budgetExpenses WHERE userId = ?').all(tUserId);
  });

  return createExpenseByUserTransaction(userId);
}

// Add a user expense
export function addExpense(userId, name, amt) {

  const createExpenseTransaction = db.transaction((tUserId, tName, tAmt) => {
    //check for max expenses
    const resultMaxExpenses = db.prepare(`
      SELECT COUNT(*) as expenseCount 
      FROM budgetExpenses 
      WHERE userId = ?
      `).get(tUserId);

    if (resultMaxExpenses.expenseCount >= MAX_EXPENSES) {
      /*  just return the MAX_EXPENSES data and
          determine in user/page.js if its really MAX_EXPENSES
      */
      return MAX_EXPENSES;
    }

    //add the user expense to database
    const expenseId = Date.now().toString();
    db.prepare(`
      INSERT INTO budgetExpenses (id, userId, budgetName, budgetAmt)
      VALUES (?, ?, ?, ?)
    `).run(expenseId, tUserId, tName, tAmt);
    
    // Update activity: for future updates
    db.prepare(`
      UPDATE budgetUsers
      SET lastActive = datetime('now'), isUserOnline = 1
      WHERE userId = ?
    `).run(tUserId);

    return expenseId;
  });
  
  return createExpenseTransaction(userId, name, amt);
}

// Delete a user expense
export function deleteUserExpense(myId, myUserId) {
  
  const createDeleteUserExpenseTransactn = db.transaction((tMyId, tMyUserId) => {
    
    const delUserExpense = db.prepare(`
      DELETE FROM budgetExpenses 
      WHERE id = ? AND userId = ?
      `);
    const result = delUserExpense.run(tMyId, tMyUserId);
    if (result.changes === 0) {
      //no expenses: for future updates
    } else {
      //expenses deleted: for future updates
    }

    return tMyId;
  });

  return createDeleteUserExpenseTransactn(myId, myUserId);
}
