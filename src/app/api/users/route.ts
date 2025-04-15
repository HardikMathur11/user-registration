import { NextResponse } from 'next/server';
import { getUsers } from '@/utils/userStorage';

// Import the registered users array from the register route
import { registeredUsers } from '../register/route';

// In-memory storage for registered users
let users: Array<{
  id: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  registeredAt: Date;
}> = [];

// Function to add a new user
export function addUser(user: {
  id: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  registeredAt: Date;
}) {
  console.log('Adding new user:', { ...user, id: '******' });
  users.push(user);
  console.log('Total users after adding:', users.length);
}

// Function to get all users
export function getAllUsers() {
  console.log('Getting all users, total count:', users.length);
  return users;
}

export async function GET() {
  try {
    const users = getUsers();
    console.log('Getting registered users:', users);
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
} 