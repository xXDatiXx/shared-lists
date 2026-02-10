import { useCallback } from 'react';

export function useHaptic() {
  const vibrate = useCallback((pattern: number | number[] = 10) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const light = useCallback(() => vibrate(10), [vibrate]);
  const medium = useCallback(() => vibrate(25), [vibrate]);
  const success = useCallback(() => vibrate([10, 50, 10]), [vibrate]);

  return { light, medium, success };
}
