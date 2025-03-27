
import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

export function useTheme() {
  // Проверяем наличие сохраненной темы в localStorage или используем тему по умолчанию
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme') as Theme;
    return savedTheme || 'dark'; // dark по умолчанию
  });

  // Эффект для синхронизации темы с DOM и localStorage
  useEffect(() => {
    // Обновляем data-theme атрибут на html элементе
    const root = window.document.documentElement;
    root.setAttribute('data-theme', theme);
    
    // Сохраняем текущую тему в localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Функция для переключения темы
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return { theme, toggleTheme };
}
