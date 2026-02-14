import { useEffect } from 'react';

// Legacy hook for backward compatibility
export function useSystemTheme() {
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (e: MediaQueryList | MediaQueryListEvent) => {
      document.documentElement.classList.toggle('dark', e.matches);
    };
    apply(mq);
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);
}

// Re-export the new useTheme hook from ThemeContext
export { useTheme } from '@/contexts/ThemeContext';
