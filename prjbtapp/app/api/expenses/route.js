/*
 * teodeloso@gmail.com
 *
 * User page routing layer
 */

import { getExpensesByUser, addExpense, deleteUserExpense } from '@/lib/expenseService';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');

  return Response.json(getExpensesByUser(userId));
}

// Add a user expense
export async function POST(req) {
  const body = await req.json();

  const expenseId = addExpense(body.userId, body.budgetName, body.budgetAmt);

  return Response.json({
          id: expenseId, 
          userId: body.userId });
}

// Delete a user expense
export async function DELETE(req) {
  const body = await req.json();

  const expenseId = deleteUserExpense(body.id, body.userId);
  
  return Response.json({
          id: expenseId, 
          userId: body.userId});
}
