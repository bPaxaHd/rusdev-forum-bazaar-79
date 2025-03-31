
/**
 * Блокировщик подозрительных скриптов для DevTalk
 */

// Список подозрительных доменов
const SUSPICIOUS_DOMAINS = ['gpteng.co', 'gptengineer', 'lovable.ai', 'cdn.'];

/**
 * Блокирует и удаляет подозрительные скрипты 
 */
export const blockSuspiciousScripts = (): void => {
  // Перехват создания скриптов
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName: string) {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'script' || tagName.toLowerCase() === 'iframe' || tagName.toLowerCase() === 'link') {
      // Перехват установки src/href атрибута
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name: string, value: string) {
        if ((name === 'src' || name === 'href') && 
            typeof value === 'string' && 
            SUSPICIOUS_DOMAINS.some(domain => value.includes(domain))) {
          console.warn('Заблокирована установка подозрительного URL:', value);
          return element;
        }
        return originalSetAttribute.call(this, name, value);
      };
    }
    
    return element;
  };
  
  // Блокировка динамической вставки скриптов через innerHTML
  const originalInnerHTMLDescriptor = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML');
  if (originalInnerHTMLDescriptor) {
    Object.defineProperty(Element.prototype, 'innerHTML', {
      set(value) {
        // Проверяем на наличие подозрительных строк
        if (typeof value === 'string' && 
            SUSPICIOUS_DOMAINS.some(domain => value.includes(domain))) {
          console.warn('Заблокирована попытка вставки подозрительного кода через innerHTML');
          // Заменяем подозрительные скрипты
          const sanitized = value.replace(
            /<script[^>]*src=["']([^"']+)["'][^>]*>[\s\S]*?<\/script>/gi, 
            (match, src) => {
              if (SUSPICIOUS_DOMAINS.some(domain => src.includes(domain))) {
                return '<!-- Blocked suspicious script -->';
              }
              return match;
            }
          );
          originalInnerHTMLDescriptor.set?.call(this, sanitized);
        } else {
          originalInnerHTMLDescriptor.set?.call(this, value);
        }
      },
      get: originalInnerHTMLDescriptor.get,
      configurable: true
    });
  }
  
  // Блокировка внешних запросов к подозрительным доменам
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const url = input instanceof Request ? input.url : input.toString();
    if (typeof url === 'string' && 
        SUSPICIOUS_DOMAINS.some(domain => url.includes(domain))) {
      console.warn('Заблокирован fetch запрос к подозрительному домену:', url);
      return Promise.reject(new Error('Запрос заблокирован по соображениям безопасности'));
    }
    return originalFetch(input, init);
  };
  
  // Блокировка подозрительных XMLHttpRequest запросов
  const originalXhrOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string, ...args: any[]) {
    if (typeof url === 'string' && 
        SUSPICIOUS_DOMAINS.some(domain => url.includes(domain))) {
      console.warn('Заблокирован XHR запрос к подозрительному домену:', url);
      throw new Error('Запрос заблокирован по соображениям безопасности');
    }
    return originalXhrOpen.call(this, method, url, ...args);
  };
  
  // Блокировка вставок через отдельные методы DOM API
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function<T extends Node>(node: T): T {
    if (node instanceof HTMLElement &&
        (node.tagName === 'SCRIPT' || node.tagName === 'IFRAME')) {
      const src = node.getAttribute('src');
      if (typeof src === 'string' && 
          SUSPICIOUS_DOMAINS.some(domain => src.includes(domain))) {
        console.warn('Заблокирована вставка подозрительного элемента:', node.tagName, src);
        return document.createComment('Blocked element') as unknown as T;
      }
    }
    return originalAppendChild.call(this, node);
  };
  
  // Блокировка вставок через insertBefore
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function<T extends Node>(node: T, reference: Node | null): T {
    if (node instanceof HTMLElement &&
        (node.tagName === 'SCRIPT' || node.tagName === 'IFRAME')) {
      const src = node.getAttribute('src');
      if (typeof src === 'string' && 
          SUSPICIOUS_DOMAINS.some(domain => src.includes(domain))) {
        console.warn('Заблокирована вставка подозрительного элемента через insertBefore:', node.tagName, src);
        return document.createComment('Blocked element') as unknown as T;
      }
    }
    return originalInsertBefore.call(this, node, reference);
  };
};

/**
 * Сканирует текущий DOM и удаляет подозрительные элементы
 */
export const scanAndCleanDom = (): void => {
  // Удаление подозрительных скриптов
  document.querySelectorAll('script[src]').forEach(script => {
    const src = script.getAttribute('src');
    if (src && SUSPICIOUS_DOMAINS.some(domain => src.includes(domain))) {
      console.warn('Удален подозрительный скрипт:', src);
      script.remove();
    }
  });
  
  // Проверка inline скриптов
  document.querySelectorAll('script:not([src])').forEach(script => {
    const content = script.textContent || '';
    if (SUSPICIOUS_DOMAINS.some(domain => content.includes(domain))) {
      console.warn('Удален подозрительный inline скрипт');
      script.remove();
    }
  });
  
  // Удаление подозрительных iframe
  document.querySelectorAll('iframe').forEach(iframe => {
    const src = iframe.getAttribute('src');
    if (src && SUSPICIOUS_DOMAINS.some(domain => src.includes(domain))) {
      console.warn('Удален подозрительный iframe:', src);
      iframe.remove();
    }
  });
  
  // Удаление подозрительных link элементов
  document.querySelectorAll('link').forEach(link => {
    const href = link.getAttribute('href');
    if (href && SUSPICIOUS_DOMAINS.some(domain => href.includes(domain))) {
      console.warn('Удален подозрительный link элемент:', href);
      link.remove();
    }
  });
};

/**
 * Наблюдает за изменениями в DOM и очищает подозрительный контент
 */
export const startDomObserver = (): MutationObserver => {
  const observer = new MutationObserver(mutations => {
    let needsCleanup = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        needsCleanup = true;
      }
    });
    
    if (needsCleanup) {
      scanAndCleanDom();
    }
  });
  
  observer.observe(document, {
    childList: true,
    subtree: true
  });
  
  return observer;
};

/**
 * Инициализирует блокировщик скриптов
 */
export const initScriptBlocker = (): void => {
  // Блокируем подозрительные скрипты
  blockSuspiciousScripts();
  
  // Очищаем DOM
  scanAndCleanDom();
  
  // Запускаем наблюдатель за DOM
  startDomObserver();
  
  // Периодически сканируем DOM
  setInterval(scanAndCleanDom, 1000);
  
  // Дополнительная очистка при полной загрузке страницы
  window.addEventListener('DOMContentLoaded', scanAndCleanDom);
  window.addEventListener('load', scanAndCleanDom);
  
  console.log('Блокировщик подозрительных скриптов инициализирован');
};

export default {
  initScriptBlocker,
  scanAndCleanDom,
  blockSuspiciousScripts
};
