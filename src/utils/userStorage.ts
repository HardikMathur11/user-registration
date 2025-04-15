import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize users file if it doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2));
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