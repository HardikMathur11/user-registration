import { NextResponse } from 'next/server';
import { clearAllUsers } from '@/utils/userStorage';

export async function POST() {
  try {
    clearAllUsers();
    return NextResponse.json({ message: 'All users cleared successfully' });
  } catch (error) {
    console.error('Error clearing users:', error);
    return NextResponse.json(
      { error: 'Failed to clear users' },
      { status: 500 }
    );
  }
} 