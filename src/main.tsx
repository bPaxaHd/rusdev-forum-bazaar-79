
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { loadDevTools } from './utils/devTools'

// Дополнительная защита
const securityLayer = () => {
  // Предотвращение копирования в буфер обмена
  document.addEventListener('copy', function(e) {
    if (process.env.NODE_ENV === 'production') {
      e.preventDefault();
      e.clipboardData?.setData('text/plain', 'Копирование запрещено.');
    }
  });

  // Защита от извлечения исходного кода
  if (process.env.NODE_ENV === 'production') {
    const protectedWindow: any = window;
    const originalFunction = Function;
    
    try {
      protectedWindow.Function = function(...args: any[]) {
        const functionBody = args.pop();
        if (functionBody && typeof functionBody === 'string') {
          if (functionBody.includes('debugger') || 
              functionBody.includes('__proto__') || 
              functionBody.includes('constructor')) {
            throw new Error('Обнаружена попытка взлома!');
          }
        }
        return originalFunction(...args, functionBody);
      };
    } catch (e) {
      console.log('Security layer initialized');
    }
  }
};

// Инициализация защиты
securityLayer();

// Загрузка инструментов разработки
loadDevTools();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
