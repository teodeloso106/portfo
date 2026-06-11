/*
 * teodeloso@gmail.com
 *
 * Database services for the landing page routing layer
 */

import db from './db';
import {MAX_USERS} from './constants';

// Get all users
export function getAllUsers() {

  const createGetAllUsersTransaction = db.transaction(() => {
    return db.prepare('SELECT * FROM budgetUsers').all();
  });

  return createGetAllUsersTransaction();
}

// Get single user
export function getUserById(userId) {

  const createUserByIdTransaction = db.transaction((tUserId) => {
    return db.prepare('SELECT * FROM budgetUsers WHERE userId = ?').get(tUserId);
  });

  return createUserByIdTransaction(userId);
}

// Create user
export function createUser(userName, budget) {

  const createUserTransaction = db.transaction((tUserName, tBudget) => {

    //check for max users
    const resultMaxUsers = db.prepare(`
      SELECT COUNT(*) as userCount 
      FROM budgetUsers
      `).get();

    if (resultMaxUsers.userCount >= MAX_USERS) {
      /*  just return the MAX_USERS data and
          determine in page.js if its really MAX_USERS
      */
      return { 
        userId: MAX_USERS, 
        userName: "max users", 
        userBudgetTotalAmt: 0};
    }

    // insert user to database
    //  lastActive field: for future updates
    const userId = Date.now().toString();
    db.prepare(`
      INSERT INTO budgetUsers
      (userId, userName, userBudgetTotalAmt, isUserOnline, lastActive)
      VALUES (?, ?, ?, 1, datetime('now'))
    `).run(userId, tUserName, tBudget);

    return {
      userId: userId, 
      userName: tUserName, 
      userBudgetTotalAmt: tBudget};
  });

  return createUserTransaction(userName, budget);
}

// Delete user
export function deleteUser(userId) {

  const deleteUserTransaction = db.transaction((tUserId) => {

    //delete user expenses
    const delUserExp = db.prepare(`
      DELETE FROM budgetExpenses 
      WHERE userId = ?
      `);
    const resultDelUserExp = delUserExp.run(tUserId);   
    if (resultDelUserExp.changes === 0) {
      //no expenses: for future updates
    } else {
      //user expenses deleted: for future updates
    }

    //delete the user
    const delUser = db.prepare(`
      DELETE FROM budgetUsers 
      WHERE userId = ?
      `);
    const resultDelUser = delUser.run(tUserId);
    if (resultDelUser.changes === 0) {
      //user not found: for future updates
    } else {
      //user deleted: for future updates
    }

    return tUserId;
  });

  return deleteUserTransaction(userId);
}
