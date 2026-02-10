import { type ShoppingList } from '@/lib/db';
import GlassCard from './GlassCard';
import { motion } from 'framer-motion';

interface ListCardProps {
  list: ShoppingList;
  onClick: () => void;
}

export default function ListCard({ list, onClick }: ListCardProps) {
  const total = list.items.length;
  const completed = list.items.filter(i => i.completed).length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <GlassCard
      className="p-5 cursor-pointer active:scale-[0.97] transition-transform touch-target"
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      layout
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{list.emoji}</span>
        {total > 0 && (
          <span className="text-xs font-medium text-muted-foreground tabular-nums">
            {completed}/{total}
          </span>
        )}
      </div>
      <h3 className="font-semibold text-foreground text-lg leading-tight mb-2">{list.name}</h3>
      {total > 0 && (
        <div className="h-1 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', damping: 20 }}
          />
        </div>
      )}
      {total === 0 && (
        <p className="text-sm text-muted-foreground">Sin elementos</p>
      )}
    </GlassCard>
  );
}
