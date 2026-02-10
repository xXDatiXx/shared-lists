import { useNavigate } from 'react-router-dom';
import { useLists } from '@/hooks/useLists';
import ListCard from '@/components/ListCard';
import CreateListSheet from '@/components/CreateListSheet';
import { motion } from 'framer-motion';

export default function Index() {
  const navigate = useNavigate();
  const { lists, loading, createList } = useLists();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="glass-strong sticky top-0 z-10 px-4 pt-safe">
        <div className="flex items-center justify-between h-16 max-w-lg mx-auto">
          <div>
            <h1 className="font-bold text-2xl text-foreground">Listas</h1>
            <p className="text-xs text-muted-foreground">
              {lists.length} {lists.length === 1 ? 'lista' : 'listas'}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pb-28 pt-4">
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
            variants={{
              visible: { transition: { staggerChildren: 0.05 } },
            }}
          >
            {lists.map(list => (
              <motion.div
                key={list.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
              >
                <ListCard list={list} onClick={() => navigate(`/list/${list.id}`)} />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24"
          >
            <p className="text-6xl mb-4">📋</p>
            <h2 className="text-xl font-semibold text-foreground mb-2">Sin listas aún</h2>
            <p className="text-muted-foreground">Crea tu primera lista para comenzar</p>
          </motion.div>
        )}
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 z-20">
        <CreateListSheet onCreateList={createList} />
      </div>
    </div>
  );
}
