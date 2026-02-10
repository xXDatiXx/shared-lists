import { generateId } from './db';

export interface User {
  id: string;
  name: string;
  token: string;
  avatar: string;
  isAdmin: boolean;
  createdAt: number;
}

const USERS_KEY = 'shared-lists-users';
const CURRENT_USER_KEY = 'shared-lists-current-user';
const ADMIN_TOKEN = 'admin-setup-token';

function getStoredUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch { return []; }
}

function setStoredUsers(users: User[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser(): User | null {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch { return null; }
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
  }
}

export function loginWithToken(token: string): User | null {
  const users = getStoredUsers();
  const user = users.find(u => u.token === token);
  if (user) {
    setCurrentUser(user);
    return user;
  }
  return null;
}

export function initializeAdmin(): User {
  const users = getStoredUsers();
  let admin = users.find(u => u.isAdmin);
  if (!admin) {
    admin = {
      id: generateId(),
      name: 'Admin',
      token: ADMIN_TOKEN,
      avatar: '👑',
      isAdmin: true,
      createdAt: Date.now(),
    };
    users.push(admin);
    setStoredUsers(users);
  }
  return admin;
}

export function createUser(name: string, avatar: string): User {
  const users = getStoredUsers();
  const user: User = {
    id: generateId(),
    name,
    token: generateId().slice(0, 8),
    avatar,
    isAdmin: false,
    createdAt: Date.now(),
  };
  users.push(user);
  setStoredUsers(users);
  return user;
}

export function getAllUsers(): User[] {
  return getStoredUsers();
}

export function deleteUser(id: string) {
  const users = getStoredUsers().filter(u => u.id !== id);
  setStoredUsers(users);
}

export function logout() {
  setCurrentUser(null);
}
