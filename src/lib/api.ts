// API client for backend communication
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
export async function loginWithToken(token: string) {
  const response = await fetch(`${API_URL}/users/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  
  const user = await handleResponse<any>(response);
  setAuthToken(token);
  return user;
}

export async function createUser(name: string, avatar: string) {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name, avatar }),
  });
  
  return handleResponse<any>(response);
}

export async function getAllUsers() {
  const response = await fetch(`${API_URL}/users`, {
    headers: getHeaders(),
  });
  
  return handleResponse<any[]>(response);
}

export async function deleteUser(id: string) {
  const response = await fetch(`${API_URL}/users/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  return handleResponse<void>(response);
}

export async function initializeAdmin() {
  const response = await fetch(`${API_URL}/users/init-admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  
  return handleResponse<any>(response);
}

// Lists API
export async function getAllLists() {
  const response = await fetch(`${API_URL}/lists`, {
    headers: getHeaders(),
  });
  
  return handleResponse<any[]>(response);
}

export async function getList(id: string) {
  const response = await fetch(`${API_URL}/lists/${id}`, {
    headers: getHeaders(),
  });
  
  return handleResponse<any>(response);
}

export async function createList(name: string, emoji: string, color: string) {
  const response = await fetch(`${API_URL}/lists`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name, emoji, color }),
  });
  
  return handleResponse<any>(response);
}

export async function updateList(id: string, updates: { name?: string; emoji?: string; color?: string }) {
  const response = await fetch(`${API_URL}/lists/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  
  return handleResponse<any>(response);
}

export async function deleteList(id: string) {
  const response = await fetch(`${API_URL}/lists/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  return handleResponse<void>(response);
}

export async function addItemToList(listId: string, text: string, addedBy: string) {
  const response = await fetch(`${API_URL}/lists/${listId}/items`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ text, addedBy }),
  });
  
  return handleResponse<any>(response);
}

export async function updateItem(listId: string, itemId: string, updates: { text?: string; completed?: boolean; completedBy?: string }) {
  const response = await fetch(`${API_URL}/lists/${listId}/items/${itemId}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  
  return handleResponse<any>(response);
}

export async function deleteItem(listId: string, itemId: string) {
  const response = await fetch(`${API_URL}/lists/${listId}/items/${itemId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  return handleResponse<void>(response);
}

// Groups API
export async function getAllGroups() {
  const response = await fetch(`${API_URL}/groups`, {
    headers: getHeaders(),
  });
  
  return handleResponse<any[]>(response);
}

export async function getGroup(id: string) {
  const response = await fetch(`${API_URL}/groups/${id}`, {
    headers: getHeaders(),
  });
  
  return handleResponse<any>(response);
}

export async function createGroup(name: string, emoji: string, ownerId: string) {
  const response = await fetch(`${API_URL}/groups`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ name, emoji, ownerId }),
  });
  
  return handleResponse<any>(response);
}

export async function updateGroup(id: string, updates: { name?: string; emoji?: string }) {
  const response = await fetch(`${API_URL}/groups/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });
  
  return handleResponse<any>(response);
}

export async function deleteGroup(id: string) {
  const response = await fetch(`${API_URL}/groups/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  return handleResponse<void>(response);
}

export async function addMemberToGroup(groupId: string, userId: string) {
  const response = await fetch(`${API_URL}/groups/${groupId}/members`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ userId }),
  });
  
  return handleResponse<any>(response);
}

export async function removeMemberFromGroup(groupId: string, userId: string) {
  const response = await fetch(`${API_URL}/groups/${groupId}/members/${userId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  return handleResponse<void>(response);
}

export async function addListToGroup(groupId: string, listId: string) {
  const response = await fetch(`${API_URL}/groups/${groupId}/lists`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ listId }),
  });
  
  return handleResponse<any>(response);
}

export async function removeListFromGroup(groupId: string, listId: string) {
  const response = await fetch(`${API_URL}/groups/${groupId}/lists/${listId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  return handleResponse<void>(response);
}
