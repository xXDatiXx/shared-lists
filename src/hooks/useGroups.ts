import { useState, useEffect, useCallback } from 'react';
import {
  getAllGroups,
  createGroup as dbCreateGroup,
  deleteGroup as dbDeleteGroup,
  addMemberToGroup,
  removeMemberFromGroup,
  addListToGroup as dbAddListToGroup,
  removeListFromGroup as dbRemoveListFromGroup,
  type Group,
} from '@/lib/groups';

export function useGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getAllGroups();
    setGroups(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const createGroup = useCallback(async (name: string, emoji: string, ownerId: string) => {
    const group = await dbCreateGroup(name, emoji, ownerId);
    await refresh();
    return group;
  }, [refresh]);

  const removeGroup = useCallback(async (id: string) => {
    await dbDeleteGroup(id);
    await refresh();
  }, [refresh]);

  const addMember = useCallback(async (groupId: string, userId: string) => {
    await addMemberToGroup(groupId, userId);
    await refresh();
  }, [refresh]);

  const removeMember = useCallback(async (groupId: string, userId: string) => {
    await removeMemberFromGroup(groupId, userId);
    await refresh();
  }, [refresh]);

  const addListToGroup = useCallback(async (groupId: string, listId: string) => {
    await dbAddListToGroup(groupId, listId);
    await refresh();
  }, [refresh]);

  const removeListFromGroup = useCallback(async (groupId: string, listId: string) => {
    await dbRemoveListFromGroup(groupId, listId);
    await refresh();
  }, [refresh]);

  return { groups, loading, createGroup, removeGroup, addMember, removeMember, addListToGroup, removeListFromGroup };
}
