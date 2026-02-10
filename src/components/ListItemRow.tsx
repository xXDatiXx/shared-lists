import { type ListItem } from '@/lib/db';
import { useHaptic } from '@/hooks/useHaptic';
import { Check, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ListItemRowProps {
  item: ListItem;
  onToggle: () => void;
  onRemove: () => void;
}

export default function ListItemRow({ item, onToggle, onRemove }: ListItemRowProps) {
  const haptic = useHaptic();

  const handleToggle = () => {
    haptic.success();
    onToggle();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex items-center gap-3 py-3 px-1 group"
    >
      <button
        onClick={handleToggle}
        className={cn(
          'touch-target flex items-center justify-center w-7 h-7 rounded-full border-2 transition-all shrink-0',
          item.completed
            ? 'bg-success border-success'
            : 'border-muted-foreground/30 hover:border-primary'
        )}
      >
        <AnimatePresence>
          {item.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="animate-check-pop"
            >
              <Check className="w-4 h-4 text-success-foreground" strokeWidth={3} />
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      <div className="flex-1 min-w-0">
        <span className={cn(
          'text-base transition-all',
          item.completed ? 'line-through text-muted-foreground' : 'text-foreground'
        )}>
          {item.text}
        </span>
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.addedBy}
          {item.completed && item.completedBy && ` · ✓ ${item.completedBy}`}
        </p>
      </div>

      <button
        onClick={onRemove}
        className="touch-target flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
      >
        <Trash2 className="w-4 h-4 text-destructive" />
      </button>
    </motion.div>
  );
}
