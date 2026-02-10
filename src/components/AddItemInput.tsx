import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';

interface AddItemInputProps {
  onAdd: (text: string) => void;
}

export default function AddItemInput({ onAdd }: AddItemInputProps) {
  const [text, setText] = useState('');
  const haptic = useHaptic();

  const handleAdd = () => {
    if (!text.trim()) return;
    haptic.light();
    onAdd(text.trim());
    setText('');
  };

  return (
    <div className="flex gap-2">
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && handleAdd()}
        placeholder="Agregar elemento..."
        className="flex-1 px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition-all"
      />
      <button
        onClick={handleAdd}
        disabled={!text.trim()}
        className="touch-target w-12 h-12 rounded-xl bg-primary flex items-center justify-center disabled:opacity-40 active:scale-95 transition-all shrink-0"
      >
        <Plus className="w-5 h-5 text-primary-foreground" />
      </button>
    </div>
  );
}
