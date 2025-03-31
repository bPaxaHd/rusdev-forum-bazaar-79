
// Debug script for the DevTalk Forum
// Локальная версия без внешних зависимостей

// Антивирус: Блокировка вредоносных внешних скриптов
const blockMaliciousScripts = () => {
  const dangerousDomains = [
    'gpteng.co',
    'gptengineer',
    'lovable.ai'
  ];
  
  // Перехват создания элементов script
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      const originalSetAttribute = element.setAttribute;
      
      element.setAttribute = function(name, value) {
        if (name === 'src' && typeof value === 'string') {
          // Проверка на вредоносные домены
          if (dangerousDomains.some(domain => value.includes(domain))) {
            console.warn('Заблокирована попытка загрузки подозрительного скрипта:', value);
            return;
          }
        }
        return originalSetAttribute.call(this, name, value);
      };
    }
    
    return element;
  };
  
  // Перехват appendChild для предотвращения инъекции скриптов
  const originalAppendChild = Node.prototype.appendChild;
  Node.prototype.appendChild = function(node) {
    if (node.tagName === 'SCRIPT' && node.src) {
      // Проверка на вредоносные домены
      if (dangerousDomains.some(domain => node.src.includes(domain))) {
        console.warn('Заблокирована попытка добавления подозрительного скрипта:', node.src);
        return document.createComment('Blocked script');
      }
    }
    return originalAppendChild.call(this, node);
  };
};

// Базовые функции для отслеживания изменений URL
const trackUrlChanges = () => {
  const trackChanges = () => {
    let currentUrl = document.location.href;
    const body = document.querySelector("body");
    
    const observer = new MutationObserver(() => {
      if (currentUrl !== document.location.href) {
        currentUrl = document.location.href;
        if (window.top) {
          // Используем только безопасное уведомление
          console.log("URL изменен:", document.location.href);
        }
      }
    });
    
    if (body) {
      observer.observe(body, { childList: true, subtree: true });
    }
  };
  
  window.addEventListener("load", trackChanges);
};

// Сканирование DOM на наличие подозрительных элементов
const scanDOMForMalicious = () => {
  // Проверка на подозрительные script теги
  const scripts = document.querySelectorAll('script[src]');
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src && (src.includes('gpteng.co') || src.includes('gptengineer'))) {
      console.warn('Обнаружен подозрительный скрипт:', src);
      script.remove();
    }
  });
  
  // Проверка на скрытые iframe
  const iframes = document.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    const style = window.getComputedStyle(iframe);
    if (style.display === 'none' || style.visibility === 'hidden' || 
        iframe.width === '0' || iframe.height === '0') {
      console.warn('Обнаружен скрытый iframe:', iframe.src);
      iframe.remove();
    }
  });
};

// Безопасная инициализация отладчика
const initDebugger = () => {
  // Блокировка вредоносных скриптов
  blockMaliciousScripts();
  
  // Отслеживание изменений URL
  trackUrlChanges();
  
  // Добавляем базовое логирование консоли для отладки
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error
  };
  
  // Переопределяем методы консоли для отладки
  console.log = function(...args) {
    originalConsole.log.apply(console, args);
  };
  
  console.warn = function(...args) {
    originalConsole.warn.apply(console, args);
  };
  
  console.error = function(...args) {
    originalConsole.error.apply(console, args);
  };
  
  // Периодическое сканирование DOM
  setInterval(scanDOMForMalicious, 5000);
  
  console.info("DevTalk безопасный отладчик инициализирован");
};

// Запуск только если нужно
if (window.location.search.includes("debug=true")) {
  initDebugger();
} else if (window.top !== window.self) {
  // Проверяем что это не iframe извне
  const trustedParents = [
    "devtalk-forum.com",
    "localhost",
    window.location.hostname
  ];
  
  const isParentTrusted = trustedParents.some(domain => {
    try {
      return window.parent.location.hostname.includes(domain);
    } catch (e) {
      return false;
    }
  });
  
  if (isParentTrusted) {
    trackUrlChanges();
  }
}

// Запускаем антивирусное сканирование при загрузке
document.addEventListener('DOMContentLoaded', () => {
  blockMaliciousScripts();
  scanDOMForMalicious();
});

// Немедленно запускаем блокировку вредоносных скриптов
blockMaliciousScripts();
