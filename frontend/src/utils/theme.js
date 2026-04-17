export const THEME_STORAGE_KEY = 'appTheme';

export function getStoredTheme() {
  const saved = localStorage.getItem(THEME_STORAGE_KEY);
  return saved === 'dark' ? 'dark' : 'light';
}

export function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  root.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}
