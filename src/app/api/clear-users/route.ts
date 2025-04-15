import { NextResponse } from 'next/server';
import { clearAllUsers } from '@/utils/userStorage';

export async function POST(request: Request) {
  try {
    const { password } = await request.json();
    
    // Verify admin password
    if (password !== 'admin123') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Clear all users
    await clearAllUsers();
    
    return NextResponse.json({ message: 'All users cleared successfully' });
  } catch (error) {
    console.error('Error clearing users:', error);
    return NextResponse.json(
      { error: 'Failed to clear users' },
      { status: 500 }
    );
  }
} 