import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGroups } from '@/hooks/useGroups';
import { useAuth } from '@/hooks/useAuth';
import { getAllUsers, type User } from '@/lib/auth';
import { useLists } from '@/hooks/useLists';
import GlassCard from '@/components/GlassCard';
import { ArrowLeft, Plus, Users, Trash2, UserPlus, ListPlus } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptic } from '@/hooks/useHaptic';
import { toast } from 'sonner';

const GROUP_EMOJIS = ['👨‍👩‍👧‍👦', '🏠', '🏢', '🎉', '🏋️', '📚', '🎮', '🌍'];

export default function GroupsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { groups, loading, createGroup, removeGroup, addMember, removeMember, addListToGroup } = useGroups();
  const { lists } = useLists();
  const haptic = useHaptic();
  const [name, setName] = useState('');
  const [emoji, setEmoji] = useState('👨‍👩‍👧‍👦');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    getAllUsers().then(users => setAllUsers(users.filter(u => !u.isAdmin)));
  }, []);

  const handleCreate = async () => {
    if (!name.trim() || !user) return;
    haptic.medium();
    await createGroup(name.trim(), emoji, user.id);
    setName('');
    setEmoji('👨‍👩‍👧‍👦');
    setCreateOpen(false);
    toast.success('Grupo creado');
  };

  const handleAddMember = async (groupId: string, userId: string) => {
    haptic.light();
    await addMember(groupId, userId);
    toast.success('Miembro agregado');
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    haptic.light();
    await removeMember(groupId, userId);
  };

  const handleAddList = async (groupId: string, listId: string) => {
    haptic.light();
    await addListToGroup(groupId, listId);
    toast.success('Lista vinculada al grupo');
  };

  return (
    <div className="min-h-screen">
      <div className="glass-strong sticky top-0 z-10 px-4 pt-safe">
        <div className="flex items-center justify-between h-14 max-w-lg mx-auto">
          <button onClick={() => navigate('/')} className="touch-target flex items-center justify-center">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="font-semibold text-foreground text-lg">
            <Users className="w-5 h-5 inline mr-2" />
            Grupos
          </h1>
          <Sheet open={createOpen} onOpenChange={setCreateOpen}>
            <SheetTrigger asChild>
              <button className="touch-target flex items-center justify-center">
                <Plus className="w-6 h-6 text-primary" />
              </button>
            </SheetTrigger>
            <SheetContent side="bottom" className="glass-strong rounded-t-3xl border-t-0 pb-safe">
              <SheetHeader>
                <SheetTitle className="text-foreground">Nuevo grupo</SheetTitle>
              </SheetHeader>
              <div className="mt-5 space-y-4">
                <div className="flex gap-2 flex-wrap">
                  {GROUP_EMOJIS.map(e => (
                    <button
                      key={e}
                      onClick={() => setEmoji(e)}
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
                  placeholder="Nombre del grupo..."
                  autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition-all text-lg"
                />
                <button
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-lg disabled:opacity-40 active:scale-[0.98] transition-all touch-target"
                >
                  Crear grupo
                </button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-8 pt-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="glass rounded-2xl h-24 animate-pulse" />)}
          </div>
        ) : groups.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <p className="text-5xl mb-4">👥</p>
            <h2 className="text-xl font-semibold text-foreground mb-2">Sin grupos</h2>
            <p className="text-muted-foreground">Crea un grupo para compartir listas</p>
          </motion.div>
        ) : (
          <AnimatePresence>
            {groups.map(group => {
              const isExpanded = selectedGroup === group.id;
              const memberUsers = allUsers.filter(u => group.memberIds.includes(u.id));
              const nonMembers = allUsers.filter(u => !group.memberIds.includes(u.id));
              const groupLists = lists.filter(l => group.listIds.includes(l.id));
              const unlinkedLists = lists.filter(l => !group.listIds.includes(l.id));

              return (
                <motion.div key={group.id} layout>
                  <GlassCard
                    className="p-4 cursor-pointer"
                    onClick={() => setSelectedGroup(isExpanded ? null : group.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{group.emoji}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-foreground">{group.name}</h3>
                        <p className="text-xs text-muted-foreground">
                          {group.memberIds.length} miembros · {group.listIds.length} listas
                        </p>
                      </div>
                      <button
                        onClick={e => { e.stopPropagation(); removeGroup(group.id); }}
                        className="touch-target flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </button>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 space-y-3"
                          onClick={e => e.stopPropagation()}
                        >
                          {/* Members */}
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                              <UserPlus className="w-3 h-3" /> Miembros
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {memberUsers.map(u => (
                                <span
                                  key={u.id}
                                  onClick={() => handleRemoveMember(group.id, u.id)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-sm cursor-pointer hover:bg-destructive/10 transition-colors"
                                >
                                  {u.avatar} {u.name} ✕
                                </span>
                              ))}
                              {nonMembers.map(u => (
                                <span
                                  key={u.id}
                                  onClick={() => handleAddMember(group.id, u.id)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-sm text-muted-foreground cursor-pointer hover:bg-primary/10 transition-colors"
                                >
                                  {u.avatar} {u.name} +
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Lists */}
                          <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                              <ListPlus className="w-3 h-3" /> Listas
                            </p>
                            <div className="flex gap-2 flex-wrap">
                              {groupLists.map(l => (
                                <span key={l.id} className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-sm">
                                  {l.emoji} {l.name}
                                </span>
                              ))}
                              {unlinkedLists.map(l => (
                                <span
                                  key={l.id}
                                  onClick={() => handleAddList(group.id, l.id)}
                                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-secondary text-sm text-muted-foreground cursor-pointer hover:bg-primary/10 transition-colors"
                                >
                                  {l.emoji} {l.name} +
                                </span>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </GlassCard>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
