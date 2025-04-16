import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

// File paths for development environment
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const PENDING_REGISTRATIONS_FILE = path.join(process.cwd(), 'data', 'pending_registrations.json');

// Initialize Redis client with explicit configuration
let redis: Redis;
try {
  console.log('Initializing Redis client with URL:', process.env.UPSTASH_REDIS_REST_URL ? 'URL is set' : 'URL is not set');
  console.log('Redis token is set:', !!process.env.UPSTASH_REDIS_REST_TOKEN);
  
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || '',
    token: process.env.UPSTASH_REDIS_REST_TOKEN || '',
  });
  
  // Test Redis connection
  if (process.env.NODE_ENV === 'production') {
    console.log('Testing Redis connection in production...');
    redis.ping().then(() => {
      console.log('Redis connection successful');
    }).catch(err => {
      console.error('Redis connection failed:', err);
    });
  }
} catch (error) {
  console.error('Error initializing Redis client:', error);
  // Fallback to file system if Redis initialization fails
  console.log('Falling back to file system storage');
}

// Initialize files if they don't exist
if (!fs.existsSync(path.dirname(USERS_FILE))) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
}
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, '[]');
}
if (!fs.existsSync(PENDING_REGISTRATIONS_FILE)) {
  fs.writeFileSync(PENDING_REGISTRATIONS_FILE, '{}');
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  registeredAt: string;
}

export interface PendingRegistration {
  id: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  otp: string;
  expiresAt: string;
}

export async function getUsers(): Promise<User[]> {
  try {
    if (process.env.NODE_ENV === 'production') {
      console.log('Fetching users from Redis in production');
      try {
        const users = await redis.get<User[]>('users');
        console.log('Redis users:', users);
        return users || [];
      } catch (redisError) {
        console.error('Error fetching users from Redis:', redisError);
        console.log('Falling back to file system for users');
        // Fallback to file system if Redis fails
        const data = await fs.promises.readFile(USERS_FILE, 'utf-8');
        return JSON.parse(data);
      }
    } else {
      console.log('Fetching users from file system in development');
      const data = await fs.promises.readFile(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

export async function getUsersByIds(userIds: string[]): Promise<User[]> {
  try {
    const users = await getUsers();
    return users.filter(user => userIds.includes(user.id));
  } catch (error) {
    console.error('Error getting users by IDs:', error);
    return [];
  }
}

export async function saveUser(user: User): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'production') {
      console.log('Saving user to Redis in production:', user);
      try {
        const users = await getUsers();
        const existingUserIndex = users.findIndex(u => u.id === user.id);
        if (existingUserIndex >= 0) {
          users[existingUserIndex] = user;
        } else {
          users.push(user);
        }
        await redis.set('users', users);
        console.log('User saved to Redis successfully');
        
        // Also save to file system as backup
        await fs.promises.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
        console.log('User also saved to file system as backup');
      } catch (redisError) {
        console.error('Error saving user to Redis:', redisError);
        console.log('Falling back to file system for saving user');
        // Fallback to file system if Redis fails
        const users = await getUsers();
        const existingUserIndex = users.findIndex(u => u.id === user.id);
        if (existingUserIndex >= 0) {
          users[existingUserIndex] = user;
        } else {
          users.push(user);
        }
        await fs.promises.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
        console.log('User saved to file system successfully');
      }
    } else {
      console.log('Saving user to file system in development:', user);
      const users = await getUsers();
      const existingUserIndex = users.findIndex(u => u.id === user.id);
      if (existingUserIndex >= 0) {
        users[existingUserIndex] = user;
      } else {
        users.push(user);
      }
      await fs.promises.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
      console.log('User saved to file system successfully');
    }
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
}

export async function getPendingRegistration(id: string): Promise<PendingRegistration | null> {
  try {
    if (process.env.NODE_ENV === 'production') {
      const registration = await redis.get<PendingRegistration>(`pending:${id}`);
      return registration;
    } else {
      const data = await fs.promises.readFile(PENDING_REGISTRATIONS_FILE, 'utf-8');
      const registrations = JSON.parse(data);
      return registrations[id] || null;
    }
  } catch (error) {
    console.error('Error reading pending registration:', error);
    return null;
  }
}

export async function savePendingRegistration(id: string, registration: PendingRegistration): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'production') {
      await redis.set(`pending:${id}`, registration);
    } else {
      const data = await fs.promises.readFile(PENDING_REGISTRATIONS_FILE, 'utf-8');
      const registrations = JSON.parse(data);
      registrations[id] = registration;
      await fs.promises.writeFile(PENDING_REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2));
    }
  } catch (error) {
    console.error('Error saving pending registration:', error);
    throw error;
  }
}

export async function deletePendingRegistration(id: string): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'production') {
      await redis.del(`pending:${id}`);
    } else {
      const data = await fs.promises.readFile(PENDING_REGISTRATIONS_FILE, 'utf-8');
      const registrations = JSON.parse(data);
      delete registrations[id];
      await fs.promises.writeFile(PENDING_REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2));
    }
  } catch (error) {
    console.error('Error deleting pending registration:', error);
    throw error;
  }
}

export async function clearAllUsers(): Promise<void> {
  try {
    if (process.env.NODE_ENV === 'production') {
      console.log('Clearing users from Redis in production');
      try {
        await redis.set('users', []);
        console.log('Users cleared from Redis successfully');
        
        // Also clear file system as backup
        await fs.promises.writeFile(USERS_FILE, '[]');
        console.log('Users also cleared from file system as backup');
      } catch (redisError) {
        console.error('Error clearing users from Redis:', redisError);
        console.log('Falling back to file system for clearing users');
        // Fallback to file system if Redis fails
        await fs.promises.writeFile(USERS_FILE, '[]');
        console.log('Users cleared from file system successfully');
      }
    } else {
      console.log('Clearing users from file system in development');
      await fs.promises.writeFile(USERS_FILE, '[]');
      console.log('Users cleared from file system successfully');
    }
  } catch (error) {
    console.error('Error clearing users:', error);
    throw error;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const users = await getUsers();
    return users.find(user => user.email === email) || null;
  } catch (error) {
    console.error('Error getting user by email:', error);
    return null;
  }
} 