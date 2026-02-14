// API client for backend communication
// In production (Docker), use relative path. In development, use env var or localhost
import type { User } from './auth';
import type { ShoppingList, ListItem } from './db';
import type { Group } from './groups';

const getApiUrl = () => {
  // If VITE_API_URL is set, use it (development)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production, use the same host but different port
  // If we're in Docker, both services are exposed on different ports
  const host = window.location.hostname;
  const protocol = window.location.protocol;
  
  // If accessing via port 3000 (frontend), backend is on port 3001
  return `${protocol}//${host}:3001/api`;
};

const API_URL = getApiUrl();

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

function getHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  if (response.status === 204) {
    return undefined as T;
  }
  
  return response.json();
}

// Users API
export async function loginWithToken(token: string): Promise<User> {
  const response = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  
  const user = await handleResponse<User>(response);
  setAuthToken(token);
  return user;
}

export async function createUser(name: string, avatar: string): Promise<User> {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name, avatar }),
  });
  
  return handleResponse<User>(response);
}

export async function getAllUsers(): Promise<User[]> {
  const response = await fetch(`${API_URL}/users`, {
    headers: getHeaders(),
  });
  
  return handleResponse<User[]>(response);
}

export async function deleteUser(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  return handleResponse<void>(response);
}

export async function initializeAdmin(): Promise<User> {
  const response = await fetch(`${API_URL}/users/init-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  
  return handleResponse<User>(response);
}

// Lists API
export async function getAllLists(): Promise<ShoppingList[]> {
  const response = await fetch(`${API_URL}/lists`, {
    headers: getHeaders(),
  });
  
  return handleResponse<ShoppingList[]>(response);
}

export async function getList(id: string): Promise<ShoppingList> {
  const response = await fetch(`${API_URL}/lists/${id}`, {
    headers: getHeaders(),
  });
  
  return handleResponse<ShoppingList>(response);
}

export async function createList(name: string, emoji: string, color: string): Promise<ShoppingList> {
  const response = await fetch(`${API_URL}/lists`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name, emoji, color }),
  });
  
  return handleResponse<ShoppingList>(response);
}

// Share/unshare list
export async function shareList(listId: string, userId: string): Promise<void> {
  const response = await fetch(`${API_URL}/lists/${listId}/share`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId }),
  });
  return handleResponse<void>(response);
}

export async function unshareList(listId: string, userId: string): Promise<void> {
  const response = await fetch(`${API_URL}/lists/${listId}/share/${userId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  return handleResponse<void>(response);
}

export async function updateList(id: string, updates: { name?: string; emoji?: string; color?: string }): Promise<ShoppingList> {
  const response = await fetch(`${API_URL}/lists/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  
  return handleResponse<ShoppingList>(response);
}

export async function deleteList(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/lists/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  return handleResponse<void>(response);
}

export async function addItemToList(listId: string, text: string, addedBy: string): Promise<ListItem> {
  const response = await fetch(`${API_URL}/lists/${listId}/items`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ text, addedBy }),
  });
  
  return handleResponse<ListItem>(response);
}

export async function updateItem(listId: string, itemId: string, updates: { text?: string; completed?: boolean; completedBy?: string }): Promise<ListItem> {
  const response = await fetch(`${API_URL}/lists/${listId}/items/${itemId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  
  return handleResponse<ListItem>(response);
}

export async function deleteItem(listId: string, itemId: string): Promise<void> {
  const response = await fetch(`${API_URL}/lists/${listId}/items/${itemId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  return handleResponse<void>(response);
}

// Groups API
export async function getAllGroups(): Promise<Group[]> {
  const response = await fetch(`${API_URL}/groups`, {
    headers: getHeaders(),
  });
  
  return handleResponse<Group[]>(response);
}

export async function getGroup(id: string): Promise<Group> {
  const response = await fetch(`${API_URL}/groups/${id}`, {
    headers: getHeaders(),
  });
  
  return handleResponse<Group>(response);
}

export async function createGroup(name: string, emoji: string, ownerId: string): Promise<Group> {
  const response = await fetch(`${API_URL}/groups`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name, emoji, ownerId }),
  });
  
  return handleResponse<Group>(response);
}

export async function updateGroup(id: string, updates: { name?: string; emoji?: string }): Promise<Group> {
  const response = await fetch(`${API_URL}/groups/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  
  return handleResponse<Group>(response);
}

export async function deleteGroup(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/groups/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  return handleResponse<void>(response);
}

export async function addMemberToGroup(groupId: string, userId: string): Promise<{ groupId: string; userId: string }> {
  const response = await fetch(`${API_URL}/groups/${groupId}/members`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId }),
  });
  
  return handleResponse<{ groupId: string; userId: string }>(response);
}

export async function removeMemberFromGroup(groupId: string, userId: string): Promise<void> {
  const response = await fetch(`${API_URL}/groups/${groupId}/members/${userId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  return handleResponse<void>(response);
}

export async function addListToGroup(groupId: string, listId: string): Promise<{ groupId: string; listId: string }> {
  const response = await fetch(`${API_URL}/groups/${groupId}/lists`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ listId }),
  });
  
  return handleResponse<{ groupId: string; listId: string }>(response);
}

export async function removeListFromGroup(groupId: string, listId: string): Promise<void> {
  const response = await fetch(`${API_URL}/groups/${groupId}/lists/${listId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  return handleResponse<void>(response);
}
