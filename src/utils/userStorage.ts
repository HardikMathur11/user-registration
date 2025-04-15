import fs from 'fs';
import path from 'path';

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// Ensure the data directory exists
if (!fs.existsSync(path.dirname(USERS_FILE))) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
}

// Initialize with empty array if file doesn't exist
if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  city: string;
  registeredAt: string;
}

export async function saveUser(user: Omit<User, 'id' | 'registeredAt'>): Promise<User> {
  try {
    const users = await getUsers();
    const newUser: User = {
      ...user,
      id: Date.now().toString(),
      registeredAt: new Date().toISOString(),
    };
    
    const updatedUsers = [...users, newUser];
    fs.writeFileSync(USERS_FILE, JSON.stringify(updatedUsers, null, 2));
    return newUser;
  } catch (error) {
    console.error('Error saving user:', error);
    throw new Error('Failed to save user');
  }
}

export async function getUsers(): Promise<User[]> {
  try {
    const data = fs.readFileSync(USERS_FILE, 'utf-8');
    return JSON.parse(data);
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

// Function to clear all users
export async function clearAllUsers(): Promise<void> {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
    console.log('All users cleared successfully');
  } catch (error) {
    console.error('Error clearing users:', error);
    throw new Error('Failed to clear users');
  }
} 