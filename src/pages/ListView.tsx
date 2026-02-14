import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getList, type ShoppingList } from '@/lib/db';
import { useLists } from '@/hooks/useLists';
import { getAllUsers, type User } from '@/lib/auth';
import ListItemRow from '@/components/ListItemRow';
import AddItemInput from '@/components/AddItemInput';
import GlassCard from '@/components/GlassCard';
import { ArrowLeft, Trash2, UserPlus, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { toast } from 'sonner';

interface ListViewProps {
  user: User;
}

export default function ListView({ user }: ListViewProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addItem, toggleItem, removeItem, removeList, lists, shareList, unshareList } = useLists(user.id, user.isAdmin);
  const [list, setList] = useState<ShoppingList | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [shareOpen, setShareOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    getList(id).then(l => l && setList(l));
  }, [id, lists]);

  useEffect(() => {
    getAllUsers().then(users => setAllUsers(users.filter(u => !u.isAdmin)));
  }, []);

  if (!list) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  const isOwner = list.createdBy === user.id || user.isAdmin;
  const sharedUsers = allUsers.filter(u => list.sharedWith?.includes(u.id));
  const availableUsers = allUsers.filter(u => u.id !== list.createdBy && !list.sharedWith?.includes(u.id));
  const pending = list.items.filter(i => !i.completed);
  const completed = list.items.filter(i => i.completed);

  const handleShare = async (userId: string) => {
    await shareList(list.id, userId);
    toast.success('Usuario invitado');
  };

  const handleUnshare = async (userId: string) => {
    await unshareList(list.id, userId);
    toast.success('Acceso revocado');
  };

  return (
    <div className="min-h-screen">
      <div className="glass-strong sticky top-0 z-10 px-4 pt-safe">
        <div className="flex items-center justify-between h-14 max-w-lg mx-auto">
          <button onClick={() => navigate('/')} className="touch-target flex items-center justify-center">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="font-semibold text-foreground text-lg truncate mx-4">
            {list.emoji} {list.name}
          </h1>
          <div className="flex items-center gap-1">
            {isOwner && (
              <Sheet open={shareOpen} onOpenChange={setShareOpen}>
                <SheetTrigger asChild>
                  <button className="touch-target flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-primary" />
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="glass-strong rounded-t-3xl border-t-0 pb-safe">
                  <SheetHeader>
                    <SheetTitle className="text-foreground">Compartir lista</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-4">
                    {sharedUsers.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Con acceso</p>
                        <div className="flex gap-2 flex-wrap">
                          {sharedUsers.map(u => (
                            <span
                              key={u.id}
                              onClick={() => handleUnshare(u.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary/10 text-sm cursor-pointer hover:bg-destructive/10 transition-colors"
                            >
                              {u.avatar} {u.name} <X className="w-3 h-3" />
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {availableUsers.length > 0 ? (
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-2">Invitar</p>
                        <div className="flex gap-2 flex-wrap">
                          {availableUsers.map(u => (
                            <span
                              key={u.id}
                              onClick={() => handleShare(u.id)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-secondary text-sm text-muted-foreground cursor-pointer hover:bg-primary/10 transition-colors"
                            >
                              {u.avatar} {u.name} +
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : sharedUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">No hay usuarios disponibles para invitar</p>
                    ) : null}
                  </div>
                </SheetContent>
              </Sheet>
            )}
            {isOwner && (
              <button
                onClick={() => { removeList(list.id); navigate('/'); }}
                className="touch-target flex items-center justify-center"
              >
                <Trash2 className="w-5 h-5 text-destructive" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-8 pt-4 space-y-4">
        <AddItemInput onAdd={(text) => addItem(list.id, text, user.name)} />

        {pending.length > 0 && (
          <GlassCard className="p-4">
            <AnimatePresence>
              {pending.map(item => (
                <ListItemRow
                  key={item.id}
                  item={item}
                  onToggle={() => toggleItem(list.id, item.id, user.name)}
                  onRemove={() => removeItem(list.id, item.id)}
                />
              ))}
            </AnimatePresence>
          </GlassCard>
        )}

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
                    onToggle={() => toggleItem(list.id, item.id, user.name)}
                    onRemove={() => removeItem(list.id, item.id)}
                  />
                ))}
              </AnimatePresence>
            </GlassCard>
          </div>
        )}

        {list.items.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-16">
            <p className="text-5xl mb-3">📝</p>
            <p className="text-muted-foreground">Agrega tu primer elemento</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
