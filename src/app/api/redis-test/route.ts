import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export async function GET() {
  try {
    console.log('Testing Redis connection...');
    
    // Initialize Redis client
    const redis = Redis.fromEnv();
    
    // Test Redis connection
    const testKey = 'test-key-' + Date.now();
    const testValue = 'test-value-' + Date.now();
    
    console.log('Setting test key:', testKey);
    await redis.set(testKey, testValue);
    
    console.log('Getting test key:', testKey);
    const retrievedValue = await redis.get(testKey);
    
    console.log('Retrieved value:', retrievedValue);
    
    // Clean up
    await redis.del(testKey);
    
    return NextResponse.json({
      success: true,
      message: 'Redis connection successful',
      testKey,
      testValue,
      retrievedValue
    });
  } catch (error) {
    console.error('Redis test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Redis connection failed', 
        details: error instanceof Error ? error.message : 'Unknown error',
        env: {
          hasUrl: !!process.env.UPSTASH_REDIS_REST_URL,
          hasToken: !!process.env.UPSTASH_REDIS_REST_TOKEN,
          nodeEnv: process.env.NODE_ENV
        }
      },
      { status: 500 }
    );
  }
} 