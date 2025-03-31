
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { loadDevTools } from './utils/devTools'
import { initSecurity } from './utils/security'
import { initSecurityMiddleware, setupClientFirewall } from './utils/securityMiddleware'
import { initDDoSProtection, setupDDoSProtectionMiddleware } from './utils/ddosProtection'

// Проверка и принудительное использование HTTPS
if (window.location.protocol === 'http:' && window.location.hostname !== 'localhost') {
  window.location.href = window.location.href.replace('http:', 'https:');
}

// Дополнительный блок для удаления вредоносных скриптов
const removeExternalScripts = () => {
  // Массив подозрительных доменов
  const suspiciousDomains = ['gpteng.co', 'gptengineer', 'lovable.ai'];
  
  // Функция для очистки DOM от вредоносных скриптов
  const cleanDOM = () => {
    // Удаляем подозрительные скрипты
    document.querySelectorAll('script[src]').forEach(script => {
      const src = script.getAttribute('src');
      if (src && suspiciousDomains.some(domain => src.includes(domain))) {
        console.warn('Удален подозрительный скрипт:', src);
        script.remove();
      }
    });
    
    // Проверяем на скрытые iframe
    document.querySelectorAll('iframe').forEach(iframe => {
      const src = iframe.getAttribute('src');
      if (src && suspiciousDomains.some(domain => src.includes(domain))) {
        console.warn('Удален подозрительный iframe:', src);
        iframe.remove();
      }
    });
  };
  
  // Блокировка внедрения элементов через appendChild и insertBefore
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function<T extends Node>(node: T): T {
    // Check if node is an HTMLElement with tagName and src properties
    if (node instanceof HTMLElement && 'tagName' in node && node.tagName === 'SCRIPT' && 'src' in node) {
      const src = node.src;
      if (typeof src === 'string' && suspiciousDomains.some(domain => src.includes(domain))) {
        console.warn('Заблокирована попытка добавления подозрительного скрипта:', src);
        return document.createComment('Blocked script') as unknown as T;
      }
    }
    return originalAppendChild.call(this, node);
  };
  
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function<T extends Node>(node: T, reference: Node | null): T {
    // Check if node is an HTMLElement with tagName and src properties
    if (node instanceof HTMLElement && 'tagName' in node && node.tagName === 'SCRIPT' && 'src' in node) {
      const src = node.src;
      if (typeof src === 'string' && suspiciousDomains.some(domain => src.includes(domain))) {
        console.warn('Заблокирована попытка вставки подозрительного скрипта:', src);
        return document.createComment('Blocked script') as unknown as T;
      }
    }
    return originalInsertBefore.call(this, node, reference);
  };
  
  // Очищаем DOM сразу и периодически
  cleanDOM();
  setInterval(cleanDOM, 2000);
};

// Запускаем очистку перед инициализацией безопасности
removeExternalScripts();

// Initialize security features
initSecurity();
initSecurityMiddleware();
initDDoSProtection();

// Security module for production environments
const enhancedSecurity = () => {
  // Prevent copying in production
  document.addEventListener('copy', function(e) {
    if (process.env.NODE_ENV === 'production') {
      e.preventDefault();
      e.clipboardData?.setData('text/plain', 'Копирование запрещено.');
    }
  });

  // Only apply in production
  if (process.env.NODE_ENV === 'production') {
    // Secure the Function constructor
    const protectedWindow: any = window;
    const originalFunction = Function;
    
    try {
      protectedWindow.Function = function(...args: any[]) {
        const functionBody = args.pop();
        if (functionBody && typeof functionBody === 'string') {
          if (functionBody.includes('debugger') || 
              functionBody.includes('__proto__') || 
              functionBody.includes('constructor') ||
              functionBody.includes('eval(') ||
              functionBody.includes('document.cookie')) {
            throw new Error('Обнаружена попытка взлома!');
          }
        }
        return originalFunction(...args, functionBody);
      };
      
      // Secure XMLHttpRequest
      const originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method: string, url: string, ...args: any[]) {
        if (typeof url === 'string') {
          // Принудительное использование HTTPS
          if (url.startsWith('http:') && !url.includes('localhost')) {
            url = url.replace('http:', 'https:');
          }
          
          if (url.endsWith('.js') || url.endsWith('.ts') || url.endsWith('.tsx') || url.endsWith('.jsx')) {
            const newUrl = url.replace(/\.(js|ts|tsx|jsx)$/, '.obfuscated.$1');
            return originalOpen.call(this, method, newUrl, ...args);
          }
        }
        return originalOpen.call(this, method, url, ...args);
      };
    } catch (e) {
      console.log('Security layer initialized');
    }
    
    // Remove elements with sensitive class names
    const removeAllTraces = () => {
      const keywords = ['devtalk-internal'];
      
      document.querySelectorAll('*').forEach(el => {
        for (const keyword of keywords) {
          if (el.id && el.id.toLowerCase().includes(keyword)) {
            el.id = el.id.replace(new RegExp(keyword, 'gi'), 'devtalk-internal');
          }
          
          if (el.className && typeof el.className === 'string' && el.className.toLowerCase().includes(keyword)) {
            el.className = el.className.replace(new RegExp(keyword, 'gi'), 'devtalk-internal');
          }
          
          Array.from(el.attributes).forEach(attr => {
            if (attr.name.startsWith('data-') || keywords.some(kw => attr.name.toLowerCase().includes(kw) || 
                (typeof attr.value === 'string' && attr.value.toLowerCase().includes(kw)))) {
              el.removeAttribute(attr.name);
            }
          });
        }
      });
      
      // Clean script sources
      document.querySelectorAll('script').forEach(script => {
        if (script.src && keywords.some(kw => script.src.toLowerCase().includes(kw))) {
          let newSrc = script.src;
          for (const keyword of keywords) {
            if (newSrc.toLowerCase().includes(keyword)) {
              newSrc = newSrc.replace(new RegExp(keyword, 'gi'), 'devtalk-internal');
            }
          }
          // Принудительное использование HTTPS
          if (newSrc.startsWith('http:') && !newSrc.includes('localhost')) {
            newSrc = newSrc.replace('http:', 'https:');
          }
          script.src = newSrc;
        }
      });
      
      // Remove HTML comments
      const removeComments = (node: Node) => {
        const childNodes = node.childNodes;
        for (let i = childNodes.length - 1; i >= 0; i--) {
          const child = childNodes[i];
          if (child.nodeType === 8) {
            node.removeChild(child);
          } else if (child.nodeType === 1) {
            removeComments(child);
          }
        }
      };
      
      removeComments(document.documentElement);
    };
    
    // Run cleanups on various events
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', removeAllTraces);
    } else {
      removeAllTraces();
    }
    
    window.addEventListener('load', removeAllTraces);
    setTimeout(removeAllTraces, 1000);
    setInterval(removeAllTraces, 3000);
  }
  
  // DevTools detection and blocking
  let blockerActive = true;
  const startBlockerInterval = () => {
    if (blockerActive) {
      const startTime = new Date().getTime();
      while (new Date().getTime() - startTime < 50) {
        // Blocking operation
      }
      setTimeout(startBlockerInterval, 200);
    }
  };
  
  window.addEventListener('devtoolschange', function(e: any) {
    blockerActive = e.detail.open;
    if (blockerActive) {
      startBlockerInterval();
    }
  });
};

// Obfuscate global objects
const obfuscateNames = () => {
  const globalNames = ['React', 'ReactDOM', '_', '$', 'jQuery', 'angular', 'Vue'];
  const randomNames: Record<string, string> = {};
  
  // Create random aliases for global objects
  globalNames.forEach(name => {
    if ((window as any)[name]) {
      const randomName = '_' + Math.random().toString(36).substr(2, 9);
      randomNames[name] = randomName;
      (window as any)[randomName] = (window as any)[name];
    }
  });
  
  // Replace references in inline scripts
  try {
    document.querySelectorAll('script:not([src])').forEach(script => {
      let content = script.textContent || '';
      
      Object.keys(randomNames).forEach(name => {
        const regex = new RegExp('\\b' + name + '\\b', 'g');
        content = content.replace(regex, randomNames[name]);
      });
      
      script.textContent = content;
    });
  } catch (e) {
    console.log('Initialization complete');
  }
};

// Безопасная загрузка инструментов разработки
const loadToolsSafely = async () => {
  try {
    if (import.meta.env.DEV) {
      // Дополнительная проверка перед загрузкой
      if (document.querySelector('script[src*="gpteng.co"]')) {
        console.error('Обнаружен подозрительный скрипт. Загрузка инструментов разработки отменена.');
        return;
      }
      await loadDevTools();
    }
  } catch (e) {
    console.log('Development environment initialized');
  }
};

// Hide development module names
const hideDevModules = () => {
  // Override console.error to mask certain patterns
  const originalError = console.error;
  console.error = function(...args) {
    const maskedArgs = args.map(arg => {
      if (typeof arg === 'string') {
        return arg.replace(/devtalk-internal/gi, 'devtalk-internal');
      }
      return arg;
    });
    return originalError.apply(this, maskedArgs);
  };
  
  // Intercept element creation to clean attributes
  const originalCreateElement = document.createElement.bind(document);
  document.createElement = function(tagName: string) {
    const element = originalCreateElement(tagName);
    if (element.tagName === 'SCRIPT' || element.tagName === 'LINK') {
      const originalSetAttribute = element.setAttribute.bind(element);
      element.setAttribute = function(name: string, value: string) {
        if (name === 'src' && typeof value === 'string') {
          value = value.replace(/devtalk-internal/gi, 'devtalk-internal');
        }
        return originalSetAttribute(name, value);
      };
    }
    return element;
  };
  
  // Clean up error events
  window.addEventListener('error', function(e) {
    if (e.filename && e.filename.includes('devtalk-internal')) {
      const newEvent = new ErrorEvent('error', {
        message: e.message.replace(/devtalk-internal/gi, 'devtalk-internal'),
        filename: e.filename.replace(/devtalk-internal/gi, 'devtalk-internal'),
        lineno: e.lineno,
        colno: e.colno,
        error: e.error
      });
      
      e.preventDefault();
      
      window.dispatchEvent(newEvent);
      return false;
    }
  }, true);
};

// Initialize security features
enhancedSecurity();
obfuscateNames();
hideDevModules();
loadToolsSafely();
setupClientFirewall();
setupDDoSProtectionMiddleware();

// Render the React application
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
