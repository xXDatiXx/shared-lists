import { useNavigate } from 'react-router-dom';
import { useLists } from '@/hooks/useLists';
import ListCard from '@/components/ListCard';
import CreateListSheet from '@/components/CreateListSheet';
import { motion } from 'framer-motion';
import { Users, Settings, LogOut, Wifi, WifiOff } from 'lucide-react';
import { type User } from '@/lib/auth';
import { useState, useEffect } from 'react';

interface IndexProps {
  user: User;
  isAdmin: boolean;
  onLogout: () => void;
}

export default function Index({ user, isAdmin, onLogout }: IndexProps) {
  const navigate = useNavigate();
  const { lists, loading, createList } = useLists(user.id, isAdmin);
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass-strong sticky top-0 z-10 px-4 pt-safe">
        <div className="flex items-center justify-between h-16 max-w-lg mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{user.avatar}</span>
            <div>
              <h1 className="font-bold text-xl text-foreground leading-tight">Listas</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {online ? <Wifi className="w-3 h-3 text-success" /> : <WifiOff className="w-3 h-3 text-destructive" />}
                {user.name} · {lists.length} {lists.length === 1 ? 'lista' : 'listas'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => navigate('/groups')} className="touch-target flex items-center justify-center">
              <Users className="w-5 h-5 text-muted-foreground" />
            </button>
            {isAdmin && (
              <button onClick={() => navigate('/admin')} className="touch-target flex items-center justify-center">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
            <button onClick={onLogout} className="touch-target flex items-center justify-center">
              <LogOut className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-28 pt-4">
        {!online && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 glass rounded-xl px-4 py-3 flex items-center gap-2"
          >
            <WifiOff className="w-4 h-4 text-destructive shrink-0" />
            <p className="text-sm text-foreground">
              <span className="font-medium">Modo offline</span> — Los cambios se sincronizarán al reconectar
            </p>
          </motion.div>
        )}

        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="glass rounded-2xl h-32 animate-pulse" />
            ))}
          </div>
        ) : lists.length > 0 ? (
          <motion.div
            className="grid grid-cols-2 gap-3"
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
          >
            {lists.map(list => (
              <motion.div
                key={list.id}
                variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
              >
                <ListCard list={list} onClick={() => navigate(`/list/${list.id}`)} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <p className="text-6xl mb-4">📋</p>
            <h2 className="text-xl font-semibold text-foreground mb-2">Sin listas aún</h2>
            <p className="text-muted-foreground">Crea tu primera lista para comenzar</p>
          </motion.div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-20">
        <CreateListSheet onCreateList={createList} />
      </div>
    </div>
  );
}
