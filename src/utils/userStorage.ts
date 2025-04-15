import fs from 'fs';
import path from 'path';

const USERS_FILE_PATH = path.join(process.cwd(), 'data', 'users.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(USERS_FILE_PATH))) {
  fs.mkdirSync(path.dirname(USERS_FILE_PATH), { recursive: true });
}

// Initialize users file if it doesn't exist
if (!fs.existsSync(USERS_FILE_PATH)) {
  fs.writeFileSync(USERS_FILE_PATH, JSON.stringify([]));
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  registeredAt: string;
}

export function getUsers(): User[] {
  try {
    const data = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading users:', error);
    return [];
  }
}

export function saveUser(user: User): void {
  try {
    const users = getUsers();
    users.push(user);
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving user:', error);
  }
}

export function getUserById(id: string): User | undefined {
  const users = getUsers();
  return users.find(user => user.id === id);
}

export function getUsersByIds(ids: string[]): User[] {
  const users = getUsers();
  return users.filter(user => ids.includes(user.id));
} 