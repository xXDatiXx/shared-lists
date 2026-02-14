import * as api from './api';

export interface User {
  id: string;
  name: string;
  token: string;
  avatar: string;
  isAdmin: boolean;
  createdAt: number;
}

const CURRENT_USER_KEY = 'shared-lists-current-user';

export function getCurrentUser(): User | null {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (data) {
      const user = JSON.parse(data);
      // Restore auth token when getting current user
      api.setAuthToken(user.token);
      return user;
    }
    return null;
  } catch { 
    return null; 
  }
}

export function setCurrentUser(user: User | null) {
  if (user) {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    api.setAuthToken(user.token);
  } else {
    localStorage.removeItem(CURRENT_USER_KEY);
    api.setAuthToken(null);
  }
}

export async function loginWithToken(token: string): Promise<User | null> {
  try {
    const user = await api.loginWithToken(token);
    setCurrentUser(user);
    return user;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

export async function initializeAdmin(): Promise<User> {
  const admin = await api.initializeAdmin();
  return admin;
}

export async function createUser(name: string, avatar: string): Promise<User> {
  const user = await api.createUser(name, avatar);
  return user;
}

export async function getAllUsers(): Promise<User[]> {
  return api.getAllUsers();
}

export async function deleteUser(id: string): Promise<void> {
  await api.deleteUser(id);
}

export function logout() {
  setCurrentUser(null);
}
