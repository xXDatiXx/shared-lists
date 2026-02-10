import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import { generateId } from './db';

export interface Group {
  id: string;
  name: string;
  emoji: string;
  ownerId: string;
  memberIds: string[];
  listIds: string[];
  createdAt: number;
  updatedAt: number;
}

interface GroupsDB extends DBSchema {
  groups: {
    key: string;
    value: Group;
    indexes: { 'by-updated': number };
  };
}

let dbPromise: Promise<IDBPDatabase<GroupsDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<GroupsDB>('shared-lists-groups-db', 1, {
      upgrade(db) {
        const store = db.createObjectStore('groups', { keyPath: 'id' });
        store.createIndex('by-updated', 'updatedAt');
      },
    });
  }
  return dbPromise;
}

export async function getAllGroups(): Promise<Group[]> {
  const db = await getDB();
  const groups = await db.getAllFromIndex('groups', 'by-updated');
  return groups.reverse();
}

export async function getGroup(id: string): Promise<Group | undefined> {
  const db = await getDB();
  return db.get('groups', id);
}

export async function saveGroup(group: Group): Promise<void> {
  const db = await getDB();
  await db.put('groups', { ...group, updatedAt: Date.now() });
}

export async function deleteGroup(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('groups', id);
}

export async function createGroup(name: string, emoji: string, ownerId: string): Promise<Group> {
  const group: Group = {
    id: generateId(),
    name,
    emoji,
    ownerId,
    memberIds: [ownerId],
    listIds: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  await saveGroup(group);
  return group;
}

export async function addMemberToGroup(groupId: string, userId: string): Promise<void> {
  const group = await getGroup(groupId);
  if (!group) return;
  if (!group.memberIds.includes(userId)) {
    group.memberIds.push(userId);
    await saveGroup(group);
  }
}

export async function removeMemberFromGroup(groupId: string, userId: string): Promise<void> {
  const group = await getGroup(groupId);
  if (!group) return;
  group.memberIds = group.memberIds.filter(id => id !== userId);
  await saveGroup(group);
}

export async function addListToGroup(groupId: string, listId: string): Promise<void> {
  const group = await getGroup(groupId);
  if (!group) return;
  if (!group.listIds.includes(listId)) {
    group.listIds.push(listId);
    await saveGroup(group);
  }
}

export async function removeListFromGroup(groupId: string, listId: string): Promise<void> {
  const group = await getGroup(groupId);
  if (!group) return;
  group.listIds = group.listIds.filter(id => id !== listId);
  await saveGroup(group);
}
