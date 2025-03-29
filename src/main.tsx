
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
    
    // Маскировка следов AI-генерации
    const removeTraces = () => {
      // Удаление элементов, связанных с GPT Engineer или Lovable
      document.querySelectorAll('[id*="lovable"], [class*="lovable"], [data-*="lovable"]').forEach(el => {
        el.remove();
      });
      
      // Заменяем названия и атрибуты, связанные с генерацией
      const allElements = document.querySelectorAll('*');
      allElements.forEach(el => {
        // Скрываем атрибуты с метками нейросетевой генерации
        Array.from(el.attributes).forEach(attr => {
          if (/lovable|gpteng|ai-gen/i.test(attr.name) || /lovable|gpteng|ai-gen/i.test(attr.value)) {
            el.removeAttribute(attr.name);
          }
        });
      });
    };
    
    // Запускаем очистку после загрузки DOM
    window.addEventListener('DOMContentLoaded', removeTraces);
    setTimeout(removeTraces, 1000); // Повторная проверка после генерации динамического контента
  }
};

// Инициализация защиты
securityLayer();

// Загрузка инструментов разработки
loadDevTools();

// Обертка для элементов, связанных с инструментами разработки
const hideDevTools = () => {
  // Скрытие элементов, связанных с разработкой
  const originalCreateElement = document.createElement.bind(document);
  document.createElement = function(tagName: string) {
    const element = originalCreateElement(tagName);
    if (element.tagName === 'SCRIPT' || element.tagName === 'LINK') {
      const originalSetAttribute = element.setAttribute.bind(element);
      element.setAttribute = function(name: string, value: string) {
        // Маскировка атрибутов, которые могут указывать на инструменты генерации
        if (name === 'src' && typeof value === 'string' && (value.includes('gpteng') || value.includes('lovable'))) {
          value = value.replace(/gpteng|lovable/g, 'devtalk-internal');
        }
        return originalSetAttribute(name, value);
      };
    }
    return element;
  };
};

// Запуск маскировки инструментов
hideDevTools();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
