import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

// File paths for development environment
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const PENDING_REGISTRATIONS_FILE = path.join(process.cwd(), 'data', 'pending_registrations.json');

// Initialize Redis client using fromEnv
const redis = Redis.fromEnv();

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
      const users = await redis.get<User[]>('users');
      if (!users) {
        await redis.set('users', []);
        return [];
      }
      return users;
    } else {
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
      const users = await getUsers();
      const existingUserIndex = users.findIndex(u => u.id === user.id);
      if (existingUserIndex >= 0) {
        users[existingUserIndex] = user;
      } else {
        users.push(user);
      }
      await redis.set('users', users);
    } else {
      const users = await getUsers();
      const existingUserIndex = users.findIndex(u => u.id === user.id);
      if (existingUserIndex >= 0) {
        users[existingUserIndex] = user;
      } else {
        users.push(user);
      }
      await fs.promises.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
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
      await redis.set('users', []);
    } else {
      await fs.promises.writeFile(USERS_FILE, '[]');
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