import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getList, type ShoppingList } from '@/lib/db';
import { useLists } from '@/hooks/useLists';
import ListItemRow from '@/components/ListItemRow';
import AddItemInput from '@/components/AddItemInput';
import GlassCard from '@/components/GlassCard';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function ListView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, toggleItem, removeItem, removeList, lists } = useLists();
  const [list, setList] = useState<ShoppingList | null>(null);

  useEffect(() => {
    if (!id) return;
    getList(id).then(l => l && setList(l));
  }, [id, lists]);

  if (!list) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  const pending = list.items.filter(i => !i.completed);
  const completed = list.items.filter(i => i.completed);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass-strong sticky top-0 z-10 px-4 pt-safe">
        <div className="flex items-center justify-between h-14 max-w-lg mx-auto">
          <button onClick={() => navigate('/')} className="touch-target flex items-center justify-center">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="font-semibold text-foreground text-lg truncate mx-4">
            {list.emoji} {list.name}
          </h1>
          <button
            onClick={() => { removeList(list.id); navigate('/'); }}
            className="touch-target flex items-center justify-center"
          >
            <Trash2 className="w-5 h-5 text-destructive" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-8 pt-4 space-y-4">
        {/* Add item */}
        <AddItemInput onAdd={(text) => addItem(list.id, text)} />

        {/* Pending items */}
        {pending.length > 0 && (
          <GlassCard className="p-4">
            <AnimatePresence>
              {pending.map(item => (
                <ListItemRow
                  key={item.id}
                  item={item}
                  onToggle={() => toggleItem(list.id, item.id)}
                  onRemove={() => removeItem(list.id, item.id)}
                />
              ))}
            </AnimatePresence>
          </GlassCard>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2 px-1">
              Completados ({completed.length})
            </p>
            <GlassCard className="p-4">
              <AnimatePresence>
                {completed.map(item => (
                  <ListItemRow
                    key={item.id}
                    item={item}
                    onToggle={() => toggleItem(list.id, item.id)}
                    onRemove={() => removeItem(list.id, item.id)}
                  />
                ))}
              </AnimatePresence>
            </GlassCard>
          </div>
        )}

        {list.items.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-5xl mb-3">📝</p>
            <p className="text-muted-foreground">Agrega tu primer elemento</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
