import { useEffect, useState } from 'react';
import { applyTheme, getStoredTheme } from '../utils/theme';

export function useAppTheme() {
  const [theme, setTheme] = useState(() => getStoredTheme());

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return { theme, toggleTheme, setTheme };
}
