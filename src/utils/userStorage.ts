import fs from 'fs';
import path from 'path';
import { kv } from '@vercel/kv';

// In-memory storage for development environment
let inMemoryUsers: User[] = [];
const inMemoryPendingRegistrations: Record<string, PendingRegistration> = {};

// Check if we're in a production environment
const isProduction = process.env.NODE_ENV === 'production';

// File paths for development environment
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const PENDING_REGISTRATIONS_FILE = path.join(process.cwd(), 'data', 'pending-registrations.json');

// Initialize files if they don't exist (development only)
if (!isProduction) {
  if (!fs.existsSync(path.dirname(USERS_FILE))) {
    fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, '[]');
  }
  if (!fs.existsSync(PENDING_REGISTRATIONS_FILE)) {
    fs.writeFileSync(PENDING_REGISTRATIONS_FILE, '{}');
  }
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
  name: string;
  email: string;
  mobile: string;
  city: string;
  otp: string;
  expiresAt: string;
}

// File system operations
export async function getUsers(): Promise<User[]> {
  try {
    if (isProduction) {
      // Use Vercel KV in production
      const users = await kv.get<User[]>('users') || [];
      return users;
    }
    const data = await fs.promises.readFile(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users file:', error);
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
    if (isProduction) {
      // Use Vercel KV in production
      const users = await getUsers();
      users.push(user);
      await kv.set('users', users);
      return;
    }
    const users = await getUsers();
    users.push(user);
    await fs.promises.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
}

export async function getPendingRegistration(email: string): Promise<PendingRegistration | null> {
  try {
    if (isProduction) {
      // Use Vercel KV in production
      const registrations = await kv.get<Record<string, PendingRegistration>>('pending-registrations') || {};
      return registrations[email] || null;
    }
    const data = await fs.promises.readFile(PENDING_REGISTRATIONS_FILE, 'utf-8');
    const registrations = JSON.parse(data);
    return registrations[email] || null;
  } catch (error) {
    console.error('Error reading pending registration:', error);
    return null;
  }
}

export async function savePendingRegistration(email: string, registration: PendingRegistration): Promise<void> {
  try {
    if (isProduction) {
      // Use Vercel KV in production
      const registrations = await kv.get<Record<string, PendingRegistration>>('pending-registrations') || {};
      registrations[email] = registration;
      await kv.set('pending-registrations', registrations);
      return;
    }
    const data = await fs.promises.readFile(PENDING_REGISTRATIONS_FILE, 'utf-8');
    const registrations = JSON.parse(data);
    registrations[email] = registration;
    await fs.promises.writeFile(PENDING_REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2));
  } catch (error) {
    console.error('Error saving pending registration:', error);
    throw error;
  }
}

export async function deletePendingRegistration(email: string): Promise<void> {
  try {
    if (isProduction) {
      // Use Vercel KV in production
      const registrations = await kv.get<Record<string, PendingRegistration>>('pending-registrations') || {};
      delete registrations[email];
      await kv.set('pending-registrations', registrations);
      return;
    }
    const data = await fs.promises.readFile(PENDING_REGISTRATIONS_FILE, 'utf-8');
    const registrations = JSON.parse(data);
    delete registrations[email];
    await fs.promises.writeFile(PENDING_REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2));
  } catch (error) {
    console.error('Error deleting pending registration:', error);
    throw error;
  }
}

export async function clearAllUsers(): Promise<void> {
  try {
    if (isProduction) {
      // Use Vercel KV in production
      await kv.set('users', []);
      return;
    }
    await fs.promises.writeFile(USERS_FILE, '[]');
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