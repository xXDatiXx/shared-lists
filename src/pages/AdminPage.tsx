import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser, getAllUsers, deleteUser, type User } from '@/lib/auth';
import { ArrowLeft, Plus, Trash2, Copy, Check } from 'lucide-react';
import GlassCard from '@/components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';
import { useHaptic } from '@/hooks/useHaptic';
import { toast } from 'sonner';

const AVATARS = ['😊', '🦊', '🐱', '🐶', '🦄', '🐼', '🐸', '🦁', '🐷', '🐰', '🦋', '🌸'];

export default function AdminPage() {
  const navigate = useNavigate();
  const haptic = useHaptic();
  const [users, setUsers] = useState<User[]>([]);
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('😊');
  const [showCreate, setShowCreate] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
    }
    loadUsers();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    haptic.medium();
    try {
      const user = await createUser(name.trim(), avatar);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      setName('');
      setAvatar('😊');
      setShowCreate(false);
      toast.success(`Usuario "${user.name}" creado. Token: ${user.token}`);
    } catch (error) {
      toast.error('Error al crear usuario');
    }
  };

  const handleDelete = async (id: string) => {
    haptic.light();
    try {
      await deleteUser(id);
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      toast.success('Usuario eliminado');
    } catch (error) {
      toast.error('Error al eliminar usuario');
    }
  };

  const copyToken = (user: User) => {
    const url = `${window.location.origin}?token=${user.token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(user.id);
    haptic.light();
    toast.success('URL de acceso copiada');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const nonAdminUsers = users.filter(u => !u.isAdmin);

  return (
    <div className="min-h-screen">
      <div className="glass-strong sticky top-0 z-10 px-4 pt-safe">
        <div className="flex items-center justify-between h-14 max-w-lg mx-auto">
          <button onClick={() => navigate('/')} className="touch-target flex items-center justify-center">
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="font-semibold text-foreground text-lg">👑 Admin</h1>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="touch-target flex items-center justify-center"
          >
            <Plus className="w-6 h-6 text-primary" />
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-8 pt-4 space-y-4">
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <GlassCard className="p-5 space-y-4">
                <h2 className="font-semibold text-foreground">Nuevo usuario</h2>
                <div className="flex gap-2 flex-wrap">
                  {AVATARS.map(a => (
                    <button
                      key={a}
                      onClick={() => setAvatar(a)}
                      className={`touch-target w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                        avatar === a ? 'bg-primary/15 ring-2 ring-primary scale-110' : 'bg-secondary'
                      }`}
                    >
                      {a}
                    </button>
                  ))}
                </div>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCreate()}
                  placeholder="Nombre del usuario..."
                  className="w-full px-4 py-3 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition-all"
                />
                <button
                  onClick={handleCreate}
                  disabled={!name.trim()}
                  className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold disabled:opacity-40 active:scale-[0.98] transition-all touch-target"
                >
                  Crear usuario
                </button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          <h2 className="text-sm font-medium text-muted-foreground px-1">
            Usuarios ({nonAdminUsers.length})
          </h2>
          {nonAdminUsers.length === 0 ? (
            <GlassCard className="p-6 text-center">
              <p className="text-muted-foreground">No hay usuarios creados</p>
            </GlassCard>
          ) : (
            <GlassCard className="p-2">
              {nonAdminUsers.map(user => (
                <div key={user.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors">
                  <span className="text-2xl">{user.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{user.token}</p>
                  </div>
                  <button onClick={() => copyToken(user)} className="touch-target flex items-center justify-center">
                    {copiedId === user.id ? (
                      <Check className="w-4 h-4 text-success" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                  <button onClick={() => handleDelete(user.id)} className="touch-target flex items-center justify-center">
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              ))}
            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}
