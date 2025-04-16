import { NextResponse } from 'next/server';
import { getUsers } from '@/utils/userStorage';

export async function GET() {
  try {
    console.log('API: Fetching users from API route');
    const users = await getUsers();
    console.log('API: Users fetched successfully:', users);
    return NextResponse.json(users);
  } catch (error) {
    console.error('API: Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 