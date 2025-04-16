import { NextResponse } from 'next/server';
import { getUsers } from '@/utils/userStorage';

export async function GET() {
  try {
    console.log('Fetching users from API');
    const users = await getUsers();
    console.log('Users fetched:', users);
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
} 