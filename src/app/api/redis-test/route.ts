import { Redis } from '@upstash/redis';
import { NextResponse } from 'next/server';

// Initialize Redis
const redis = Redis.fromEnv();

export async function GET() {
  try {
    // Test Redis connection by setting and getting a value
    const testKey = 'test-connection';
    const testValue = 'Connection successful!';
    
    await redis.set(testKey, testValue);
    const result = await redis.get(testKey);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Redis connection successful',
      testValue: result 
    });
  } catch (error) {
    console.error('Redis connection error:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Redis connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 