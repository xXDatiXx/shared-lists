import { useState, useEffect, useCallback } from 'react';
import { getAllLists, deleteList, generateId, type ShoppingList, type ListItem } from '@/lib/db';
import * as api from '@/lib/api';

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
    try {
      const data = await getAllLists();
      setLists(data);
    } catch (error) {
      console.error('Failed to fetch lists:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const createList = useCallback(async (name: string, emoji?: string) => {
    const selectedEmoji = emoji || LIST_EMOJIS[Math.floor(Math.random() * LIST_EMOJIS.length)];
    const color = LIST_COLORS[Math.floor(Math.random() * LIST_COLORS.length)];
    
    const list = await api.createList(name, selectedEmoji, color);
    await refresh();
    return list;
  }, [refresh]);

  const addItem = useCallback(async (listId: string, text: string, addedBy = 'Tú') => {
    await api.addItemToList(listId, text, addedBy);
    await refresh();
  }, [refresh]);

  const toggleItem = useCallback(async (listId: string, itemId: string, completedBy = 'Tú') => {
    const list = lists.find(l => l.id === listId);
    if (!list) return;
    
    const item = list.items.find(i => i.id === itemId);
    if (!item) return;
    
    await api.updateItem(listId, itemId, {
      completed: !item.completed,
      completedBy: !item.completed ? completedBy : undefined,
    });
    await refresh();
  }, [lists, refresh]);

  const removeItem = useCallback(async (listId: string, itemId: string) => {
    await api.deleteItem(listId, itemId);
    await refresh();
  }, [refresh]);

  const removeList = useCallback(async (id: string) => {
    await deleteList(id);
    await refresh();
  }, [refresh]);

  return { lists, loading, createList, addItem, toggleItem, removeItem, removeList };
}
