import { useState, useEffect, useCallback } from 'react';
import { getAllLists, saveList, deleteList, generateId, type ShoppingList, type ListItem } from '@/lib/db';

const LIST_COLORS = [
  'hsl(211, 100%, 50%)',
  'hsl(340, 82%, 52%)',
  'hsl(142, 71%, 45%)',
  'hsl(25, 95%, 53%)',
  'hsl(262, 83%, 58%)',
  'hsl(47, 96%, 53%)',
];

const LIST_EMOJIS = ['🛒', '📋', '💡', '🎯', '📦', '✨', '🏠', '🍳'];

export function useLists() {
  const [lists, setLists] = useState<ShoppingList[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const data = await getAllLists();
    setLists(data);
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const createList = useCallback(async (name: string, emoji?: string) => {
    const list: ShoppingList = {
      id: generateId(),
      name,
      emoji: emoji || LIST_EMOJIS[Math.floor(Math.random() * LIST_EMOJIS.length)],
      color: LIST_COLORS[Math.floor(Math.random() * LIST_COLORS.length)],
      items: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await saveList(list);
    await refresh();
    return list;
  }, [refresh]);

  const addItem = useCallback(async (listId: string, text: string, addedBy = 'Tú') => {
    const data = await getAllLists();
    const list = data.find(l => l.id === listId);
    if (!list) return;
    const item: ListItem = {
      id: generateId(),
      text,
      completed: false,
      addedBy,
      createdAt: Date.now(),
    };
    list.items.push(item);
    await saveList(list);
    await refresh();
  }, [refresh]);

  const toggleItem = useCallback(async (listId: string, itemId: string, completedBy = 'Tú') => {
    const data = await getAllLists();
    const list = data.find(l => l.id === listId);
    if (!list) return;
    const item = list.items.find(i => i.id === itemId);
    if (!item) return;
    item.completed = !item.completed;
    item.completedBy = item.completed ? completedBy : undefined;
    item.completedAt = item.completed ? Date.now() : undefined;
    await saveList(list);
    await refresh();
  }, [refresh]);

  const removeItem = useCallback(async (listId: string, itemId: string) => {
    const data = await getAllLists();
    const list = data.find(l => l.id === listId);
    if (!list) return;
    list.items = list.items.filter(i => i.id !== itemId);
    await saveList(list);
    await refresh();
  }, [refresh]);

  const removeList = useCallback(async (id: string) => {
    await deleteList(id);
    await refresh();
  }, [refresh]);

  return { lists, loading, createList, addItem, toggleItem, removeItem, removeList };
}
