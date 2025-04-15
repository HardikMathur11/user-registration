import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const PENDING_REGISTRATIONS_FILE = path.join(DATA_DIR, 'pending-registrations.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize users file if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
}

// Initialize pending registrations file if it doesn't exist
if (!fs.existsSync(PENDING_REGISTRATIONS_FILE)) {
  fs.writeFileSync(PENDING_REGISTRATIONS_FILE, JSON.stringify({}, null, 2));
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  registeredAt: string;
  createdAt: string;
}

export interface PendingRegistration {
  name: string;
  email: string;
  mobile: string;
  city: string;
  otp: string;
  expiresAt: number;
}

export function getUsers(): User[] {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

export function getUsersByIds(userIds: string[]): User[] {
  const users = getUsers();
  return users.filter(user => userIds.includes(user.id));
}

export function saveUser(user: User): void {
  try {
    const users = getUsers();
    users.push(user);
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
}

export function clearAllUsers(): void {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  } catch (error) {
    console.error('Error clearing users:', error);
    throw new Error('Failed to clear users');
  }
}

export function getPendingRegistration(email: string): PendingRegistration | null {
  try {
    const data = fs.readFileSync(PENDING_REGISTRATIONS_FILE, 'utf-8');
    const pendingRegistrations = JSON.parse(data);
    return pendingRegistrations[email] || null;
  } catch (error) {
    console.error('Error reading pending registration:', error);
    return null;
  }
}

export function savePendingRegistration(email: string, registration: PendingRegistration): void {
  try {
    const data = fs.readFileSync(PENDING_REGISTRATIONS_FILE, 'utf-8');
    const pendingRegistrations = JSON.parse(data);
    pendingRegistrations[email] = registration;
    fs.writeFileSync(PENDING_REGISTRATIONS_FILE, JSON.stringify(pendingRegistrations, null, 2));
  } catch (error) {
    console.error('Error saving pending registration:', error);
    throw error;
  }
}

export function deletePendingRegistration(email: string): void {
  try {
    const data = fs.readFileSync(PENDING_REGISTRATIONS_FILE, 'utf-8');
    const pendingRegistrations = JSON.parse(data);
    delete pendingRegistrations[email];
    fs.writeFileSync(PENDING_REGISTRATIONS_FILE, JSON.stringify(pendingRegistrations, null, 2));
  } catch (error) {
    console.error('Error deleting pending registration:', error);
    throw error;
  }
} 