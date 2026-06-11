/*
 * teodeloso@gmail.com
 *
 * Landing page routing layer
 */

import { getAllUsers, createUser, deleteUser } from '@/lib/userService';

// GET users
export async function GET() {
  return Response.json(getAllUsers());
}

// POST create user
export async function POST(req) {
  const body = await req.json();

  const userData = createUser(
    body.userName,
    body.userBudgetTotalAmt
  );
  
  return Response.json(userData);
}

// DELETE user
export async function DELETE(req) {
  const body = await req.json();

  const userId = deleteUser(body.userId);
  
  return Response.json({userId: userId});
}
