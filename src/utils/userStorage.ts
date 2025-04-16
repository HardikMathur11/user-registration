import fs from 'fs';
import path from 'path';
import { Redis } from '@upstash/redis';

// File paths for development environment
const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');
const PENDING_REGISTRATIONS_FILE = path.join(process.cwd(), 'data', 'pending-registrations.json');

// Initialize Redis client
const redis = Redis.fromEnv();

// Initialize files if they don't exist
if (!fs.existsSync(path.dirname(USERS_FILE))) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
}
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, '[]');
}
if (!fs.existsSync(PENDING_REGISTRATIONS_FILE)) {
  fs.writeFileSync(PENDING_REGISTRATIONS_FILE, '[]');
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
  console.log('Fetching users...');
  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('Fetching users from Redis...');
      const users = await redis.get<User[]>('users') || [];
      console.log('Users fetched from Redis:', users);
      return users;
    } catch (error) {
      console.error('Error fetching users from Redis:', error);
      return [];
    }
  } else {
    try {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading users file:', error);
      return [];
    }
  }
}

export async function getUsersByIds(ids: string[]): Promise<User[]> {
  const users = await getUsers();
  return users.filter(user => ids.includes(user.id));
}

export async function saveUser(user: User): Promise<void> {
  console.log('Saving user:', user);
  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('Saving user to Redis...');
      const users = await getUsers();
      users.push(user);
      await redis.set('users', users);
      console.log('User saved to Redis successfully');
    } catch (error) {
      console.error('Error saving user to Redis:', error);
      throw error;
    }
  } else {
    try {
      const users = await getUsers();
      users.push(user);
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    } catch (error) {
      console.error('Error saving user to file:', error);
      throw error;
    }
  }
}

export async function getPendingRegistration(id: string): Promise<PendingRegistration | null> {
  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('Fetching pending registration from Redis:', id);
      const registration = await redis.get<PendingRegistration>(`pending:${id}`);
      return registration;
    } catch (error) {
      console.error('Error fetching pending registration from Redis:', error);
      return null;
    }
  } else {
    try {
      const data = fs.readFileSync(PENDING_REGISTRATIONS_FILE, 'utf-8');
      const registrations: PendingRegistration[] = JSON.parse(data);
      return registrations.find(r => r.id === id) || null;
    } catch (error) {
      console.error('Error reading pending registration:', error);
      return null;
    }
  }
}

export async function savePendingRegistration(registration: PendingRegistration): Promise<void> {
  console.log('Saving pending registration:', registration);
  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('Saving pending registration to Redis...');
      await redis.set(`pending:${registration.id}`, registration, {
        ex: 600 // Expire after 10 minutes
      });
      console.log('Pending registration saved to Redis successfully');
    } catch (error) {
      console.error('Error saving pending registration to Redis:', error);
      throw error;
    }
  } else {
    try {
      const data = fs.readFileSync(PENDING_REGISTRATIONS_FILE, 'utf-8');
      const registrations: PendingRegistration[] = JSON.parse(data);
      const index = registrations.findIndex(r => r.id === registration.id);
      if (index >= 0) {
        registrations[index] = registration;
      } else {
        registrations.push(registration);
      }
      fs.writeFileSync(PENDING_REGISTRATIONS_FILE, JSON.stringify(registrations, null, 2));
    } catch (error) {
      console.error('Error saving pending registration:', error);
      throw error;
    }
  }
}

export async function deletePendingRegistration(id: string): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('Deleting pending registration from Redis:', id);
      await redis.del(`pending:${id}`);
      console.log('Pending registration deleted from Redis successfully');
    } catch (error) {
      console.error('Error deleting pending registration from Redis:', error);
      throw error;
    }
  } else {
    try {
      const data = fs.readFileSync(PENDING_REGISTRATIONS_FILE, 'utf-8');
      const registrations: PendingRegistration[] = JSON.parse(data);
      const filteredRegistrations = registrations.filter(r => r.id !== id);
      fs.writeFileSync(PENDING_REGISTRATIONS_FILE, JSON.stringify(filteredRegistrations, null, 2));
    } catch (error) {
      console.error('Error deleting pending registration:', error);
      throw error;
    }
  }
}

export async function clearAllUsers(): Promise<void> {
  if (process.env.NODE_ENV === 'production') {
    try {
      console.log('Clearing all users from Redis...');
      await redis.set('users', []);
      console.log('All users cleared from Redis successfully');
    } catch (error) {
      console.error('Error clearing users from Redis:', error);
      throw error;
    }
  } else {
    try {
      fs.writeFileSync(USERS_FILE, '[]');
      console.log('All users cleared from file system');
    } catch (error) {
      console.error('Error clearing users from file:', error);
      throw error;
    }
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const users = await getUsers();
  return users.find(user => user.email === email) || null;
} 