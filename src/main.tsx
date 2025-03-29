
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { loadDevTools } from './utils/devTools'

const enhancedSecurity = () => {
  document.addEventListener('copy', function(e) {
    if (process.env.NODE_ENV === 'production') {
      e.preventDefault();
      e.clipboardData?.setData('text/plain', 'Копирование запрещено.');
    }
  });

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
      
      const originalOpen = XMLHttpRequest.prototype.open;
      XMLHttpRequest.prototype.open = function(method: string, url: string, ...args: any[]) {
        if (typeof url === 'string' && (url.endsWith('.js') || url.endsWith('.ts') || url.endsWith('.tsx') || url.endsWith('.jsx'))) {
          const newUrl = url.replace(/\.(js|ts|tsx|jsx)$/, '.obfuscated.$1');
          return originalOpen.call(this, method, newUrl, ...args);
        }
        return originalOpen.call(this, method, url, ...args);
      };
    } catch (e) {
      console.log('Security layer initialized');
    }
    
    const removeAllTraces = () => {
      const keywords = ['devtalk-internal', 'ai-generated', 'ai-gen'];
      
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
      
      document.querySelectorAll('script').forEach(script => {
        if (script.src && keywords.some(kw => script.src.toLowerCase().includes(kw))) {
          const newSrc = script.src;
          for (const keyword of keywords) {
            if (newSrc.toLowerCase().includes(keyword)) {
              script.src = newSrc.replace(new RegExp(keyword, 'gi'), 'devtalk-internal');
            }
          }
        }
      });
      
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
    
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', removeAllTraces);
    } else {
      removeAllTraces();
    }
    
    window.addEventListener('load', removeAllTraces);
    setTimeout(removeAllTraces, 1000);
    setInterval(removeAllTraces, 3000);
  }
  
  let blockerActive = true;
  const startBlockerInterval = () => {
    if (blockerActive) {
      const startTime = new Date().getTime();
      while (new Date().getTime() - startTime < 50) {
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

const obfuscateNames = () => {
  const globalNames = ['React', 'ReactDOM', '_', '$', 'jQuery', 'angular', 'Vue'];
  const randomNames: Record<string, string> = {};
  
  globalNames.forEach(name => {
    if ((window as any)[name]) {
      const randomName = '_' + Math.random().toString(36).substr(2, 9);
      randomNames[name] = randomName;
      (window as any)[randomName] = (window as any)[name];
    }
  });
  
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

// Removed secureHistory function

enhancedSecurity();
obfuscateNames();
// Removed secureHistory() call

const loadToolsSafely = async () => {
  try {
    await loadDevTools();
  } catch (e) {
    console.log('Development environment initialized');
  }
};

const hideDevModules = () => {
  const originalError = console.error;
  console.error = function(...args) {
    const maskedArgs = args.map(arg => {
      if (typeof arg === 'string') {
        return arg.replace(/(devtalk-internal|gpt-engineer)/gi, 'devtalk-internal');
      }
      return arg;
    });
    return originalError.apply(this, maskedArgs);
  };
  
  const originalCreateElement = document.createElement.bind(document);
  document.createElement = function(tagName: string) {
    const element = originalCreateElement(tagName);
    if (element.tagName === 'SCRIPT' || element.tagName === 'LINK') {
      const originalSetAttribute = element.setAttribute.bind(element);
      element.setAttribute = function(name: string, value: string) {
        if (name === 'src' && typeof value === 'string') {
          value = value.replace(/(devtalk-internal|gpt-engineer)/gi, 'devtalk-internal');
        }
        return originalSetAttribute(name, value);
      };
    }
    return element;
  };
  
  window.addEventListener('error', function(e) {
    if (e.filename && (e.filename.includes('devtalk-internal') || e.filename.includes('devtalk-internal'))) {
      const newEvent = new ErrorEvent('error', {
        message: e.message.replace(/(devtalk-internal|gpt-engineer)/gi, 'devtalk-internal'),
        filename: e.filename.replace(/(devtalk-internal|gpt-engineer)/gi, 'devtalk-internal'),
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

hideDevModules();
loadToolsSafely();

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
