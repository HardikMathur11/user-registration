import { NextResponse } from 'next/server';
import { getUsers } from '@/utils/userStorage';

export async function GET() {
  try {
    console.log('API: Fetching users from API route');
    const users = await getUsers();
    console.log('API: Users fetched successfully, count:', users.length);
    
    // Ensure we're returning a valid array
    if (!Array.isArray(users)) {
      console.error('API: Users is not an array:', users);
      return NextResponse.json([], { status: 200 });
    }
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('API: Error fetching users:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch users', 
        details: error instanceof Error ? error.message : 'Unknown error',
        env: {
          hasUpstashUrl: !!process.env.UPSTASH_REDIS_REST_URL,
          hasUpstashToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
          hasRedisUrl: !!process.env.REDIS_URL,
          hasKvUrl: !!process.env.KV_URL,
          hasKvToken: !!process.env.KV_REST_API_TOKEN,
          nodeEnv: process.env.NODE_ENV
        }
      },
      { status: 500 }
    );
  }
} 