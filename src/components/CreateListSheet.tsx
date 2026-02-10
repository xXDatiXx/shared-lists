import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Plus } from 'lucide-react';
import { useHaptic } from '@/hooks/useHaptic';

const EMOJIS = ['🛒', '📋', '💡', '🎯', '📦', '✨', '🏠', '🍳', '🎉', '📚', '🏋️', '✈️'];

interface CreateListSheetProps {
  onCreateList: (name: string, emoji: string) => void;
}

export default function CreateListSheet({ onCreateList }: CreateListSheetProps) {
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('🛒');
  const [open, setOpen] = useState(false);
  const haptic = useHaptic();

  const handleCreate = () => {
    if (!name.trim()) return;
    haptic.medium();
    onCreateList(name.trim(), emoji);
    setName('');
    setEmoji('🛒');
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="touch-target w-14 h-14 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 active:scale-95 transition-transform">
          <Plus className="w-7 h-7 text-primary-foreground" />
        </button>
      </SheetTrigger>
      <SheetContent side="bottom" className="glass-strong rounded-t-3xl border-t-0 pb-safe">
        <SheetHeader>
          <SheetTitle className="text-foreground">Nueva lista</SheetTitle>
        </SheetHeader>
        <div className="mt-5 space-y-5">
          <div className="flex gap-2 flex-wrap">
            {EMOJIS.map(e => (
              <button
                key={e}
                onClick={() => { setEmoji(e); haptic.light(); }}
                className={`touch-target w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all ${
                  emoji === e ? 'bg-primary/15 ring-2 ring-primary scale-110' : 'bg-secondary'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
            placeholder="Nombre de la lista..."
            autoFocus
            className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition-all text-lg"
          />
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-lg disabled:opacity-40 active:scale-[0.98] transition-all touch-target"
          >
            Crear lista
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
