
/**
 * Блокировщик внешних CDN скриптов для DevTalk
 */

// Список заблокированных доменов
const BLOCKED_DOMAINS = [
  'gpteng.co',
  'gptengineer',
  'cdn.',
  'lovable.ai',
  'cdn.gpteng.co'
];

/**
 * Полностью блокирует загрузку скриптов с определенных доменов
 */
export const blockExternalCDN = (): void => {
  // Сначала удаляем все существующие скрипты с CDN
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src && BLOCKED_DOMAINS.some(domain => src.includes(domain))) {
      console.warn('Удаление существующего CDN скрипта:', src);
      script.remove();
    }
  });

  // Блокируем вставку через document.write
  const originalWrite = document.write;
  document.write = function(...args: string[]) {
    const content = args.join('');
    if (BLOCKED_DOMAINS.some(domain => content.includes(domain))) {
      console.warn('Блокировка document.write с CDN ссылками');
      return;
    }
    return originalWrite.apply(document, args);
  };
  
  // Блокировка динамического создания элементов
  const originalCreateElement = document.createElement;
  document.createElement = function<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K] {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'script' || tagName.toLowerCase() === 'link' || tagName.toLowerCase() === 'iframe') {
      const originalSetAttribute = element.setAttribute;
      
      element.setAttribute = function(name: string, value: string): void {
        if ((name === 'src' || name === 'href') && typeof value === 'string') {
          if (BLOCKED_DOMAINS.some(domain => value.includes(domain))) {
            console.warn(`Блокировка установки атрибута ${name}="${value}" для ${tagName}`);
            return;
          }
        }
        return originalSetAttribute.call(this, name, value);
      };
    }
    
    return element;
  };
  
  // Блокировка загрузки скриптов через appendChild
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function<T extends Node>(node: T): T {
    // Проверяем только HTML элементы
    if (node instanceof HTMLElement) {
      if (node.tagName === 'SCRIPT' || node.tagName === 'IFRAME' || node.tagName === 'LINK') {
        const src = node.getAttribute('src') || node.getAttribute('href') || '';
        if (src && typeof src === 'string' && BLOCKED_DOMAINS.some(domain => src.includes(domain))) {
          console.warn(`Блокировка appendChild для ${node.tagName} с src=${src}`);
          // Возвращаем пустой комментарий вместо блокированного элемента
          return document.createComment(`Заблокирован элемент ${node.tagName}`) as unknown as T;
        }
      }
    }
    return originalAppendChild.call(this, node);
  };
  
  // Блокировка insertBefore
  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function<T extends Node>(newNode: T, referenceNode: Node | null): T {
    if (newNode instanceof HTMLElement) {
      if (newNode.tagName === 'SCRIPT' || newNode.tagName === 'IFRAME' || newNode.tagName === 'LINK') {
        const src = newNode.getAttribute('src') || newNode.getAttribute('href') || '';
        if (src && typeof src === 'string' && BLOCKED_DOMAINS.some(domain => src.includes(domain))) {
          console.warn(`Блокировка insertBefore для ${newNode.tagName} с src=${src}`);
          return document.createComment(`Заблокирован элемент ${newNode.tagName}`) as unknown as T;
        }
      }
    }
    return originalInsertBefore.call(this, newNode, referenceNode);
  };
  
  // Перехват XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method: string, url: string | URL, ...args: any[]): void {
    const urlStr = url.toString();
    if (BLOCKED_DOMAINS.some(domain => urlStr.includes(domain))) {
      console.warn('Блокировка XHR запроса к заблокированному домену:', urlStr);
      // Имитируем открытие, но не делаем ничего
      this.abort();
      return;
    }
    return originalOpen.call(this, method, url, ...args);
  };
  
  // Перехват fetch
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = typeof input === 'string' ? input : input instanceof Request ? input.url : input.toString();
    if (BLOCKED_DOMAINS.some(domain => url.includes(domain))) {
      console.warn('Блокировка fetch запроса к заблокированному домену:', url);
      return Promise.reject(new Error('Запрос заблокирован: доступ к CDN запрещен'));
    }
    return originalFetch(input, init);
  };
  
  // Блокировка через MutationObserver для перехвата будущих вставок
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node instanceof HTMLElement) {
            if (node.tagName === 'SCRIPT' || node.tagName === 'IFRAME' || node.tagName === 'LINK') {
              const src = node.getAttribute('src') || node.getAttribute('href');
              if (src && BLOCKED_DOMAINS.some(domain => src.includes(domain))) {
                console.warn(`Удаление добавленного элемента ${node.tagName} через MutationObserver`);
                node.remove();
              }
            }
          }
        });
      }
    });
  });
  
  observer.observe(document, { childList: true, subtree: true });
  
  console.log('Блокировщик внешних CDN скриптов инициализирован');
};

/**
 * Инициализирует блокировку CDN и выполняет поиск и удаление всех скриптов
 * с заблокированных доменов
 */
export const initCDNBlocker = (): void => {
  // Запускаем блокировку
  blockExternalCDN();
  
  // Проверяем DOM при загрузке страницы
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', blockExternalCDN);
  } else {
    blockExternalCDN();
  }
  
  // И еще раз при полной загрузке
  window.addEventListener('load', blockExternalCDN);
  
  // Периодическая проверка
  setInterval(blockExternalCDN, 1000);
};

export default {
  blockExternalCDN,
  initCDNBlocker
};
