import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

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

interface ListsDB extends DBSchema {
  lists: {
    key: string;
    value: ShoppingList;
    indexes: { 'by-updated': number };
  };
}

const DB_NAME = 'shared-lists-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ListsDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<ListsDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('lists', { keyPath: 'id' });
        store.createIndex('by-updated', 'updatedAt');
      },
    });
  }
  return dbPromise;
}

export async function getAllLists(): Promise<ShoppingList[]> {
  const db = await getDB();
  const lists = await db.getAllFromIndex('lists', 'by-updated');
  return lists.reverse();
}

export async function getList(id: string): Promise<ShoppingList | undefined> {
  const db = await getDB();
  return db.get('lists', id);
}

export async function saveList(list: ShoppingList): Promise<void> {
  const db = await getDB();
  await db.put('lists', { ...list, updatedAt: Date.now() });
}

export async function deleteList(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('lists', id);
}

export function generateId(): string {
  if (crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for browsers that don't support crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
