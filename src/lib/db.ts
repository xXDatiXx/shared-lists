import * as api from './api';

export interface ListItem {
  id: string;
  text: string;
  completed: boolean;
  addedBy: string;
  completedBy?: string;
  createdAt: number;
  completedAt?: number;
}

export interface ShoppingList {
  id: string;
  name: string;
  emoji: string;
  color: string;
  items: ListItem[];
  createdAt: number;
  updatedAt: number;
}

export async function getAllLists(): Promise<ShoppingList[]> {
  return api.getAllLists();
}

export async function getList(id: string): Promise<ShoppingList | undefined> {
  try {
    return await api.getList(id);
  } catch (error) {
    return undefined;
  }
}

export async function deleteList(id: string): Promise<void> {
  await api.deleteList(id);
}

export function generateId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
