/*
 * teodeloso@gmail.com
 *
 * Helper functions for the Expenses list
 */

// Calculate total expenses
export function getTotalExpenses(expenses) {
  return expenses.reduce((sum, e) => sum + Number(e.budgetAmt), 0);
}

// Calculate remaining budget
export function getRemainingBudget(totalBudget, expenses) {
  const totalExpenses = getTotalExpenses(expenses);

  return totalBudget - totalExpenses;
}
