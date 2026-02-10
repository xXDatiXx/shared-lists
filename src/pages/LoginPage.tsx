import { useState } from 'react';
import { KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';
import GlassCard from '@/components/GlassCard';

interface LoginPageProps {
  onLogin: (token: string) => boolean;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [token, setToken] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = () => {
    if (!token.trim()) return;
    const success = onLogin(token.trim());
    if (!success) {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <p className="text-6xl mb-4">📋</p>
          <h1 className="text-3xl font-bold text-foreground">Listas Compartidas</h1>
          <p className="text-muted-foreground mt-2">Ingresa tu código de acceso</p>
        </div>

        <GlassCard className="p-6 space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              value={token}
              onChange={e => { setToken(e.target.value); setError(false); }}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Código de acceso..."
              autoFocus
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-secondary text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition-all text-lg"
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-destructive text-sm text-center"
            >
              Código inválido. Contacta al administrador.
            </motion.p>
          )}

          <button
            onClick={handleSubmit}
            disabled={!token.trim()}
            className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-lg disabled:opacity-40 active:scale-[0.98] transition-all touch-target"
          >
            Entrar
          </button>
        </GlassCard>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Usa el token <code className="bg-secondary px-1.5 py-0.5 rounded">admin-setup-token</code> para el primer acceso
        </p>
      </motion.div>
    </div>
  );
}
