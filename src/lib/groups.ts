import * as api from './api';
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

export async function getAllGroups(): Promise<Group[]> {
  return api.getAllGroups();
}

export async function getGroup(id: string): Promise<Group | undefined> {
  try {
    return await api.getGroup(id);
  } catch (error) {
    return undefined;
  }
}

export async function saveGroup(group: Group): Promise<void> {
  await api.updateGroup(group.id, {
    name: group.name,
    emoji: group.emoji,
  });
}

export async function deleteGroup(id: string): Promise<void> {
  await api.deleteGroup(id);
}

export async function createGroup(name: string, emoji: string, ownerId: string): Promise<Group> {
  return api.createGroup(name, emoji, ownerId);
}

export async function addMemberToGroup(groupId: string, userId: string): Promise<void> {
  await api.addMemberToGroup(groupId, userId);
}

export async function removeMemberFromGroup(groupId: string, userId: string): Promise<void> {
  await api.removeMemberFromGroup(groupId, userId);
}

export async function addListToGroup(groupId: string, listId: string): Promise<void> {
  await api.addListToGroup(groupId, listId);
}

export async function removeListFromGroup(groupId: string, listId: string): Promise<void> {
  await api.removeListFromGroup(groupId, listId);
}
