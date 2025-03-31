
// Локальная версия скрипта без обращений к внешним CDN
// Заменяет внешний скрипт от gpteng.co

// Отслеживание изменений URL
const trackUrlChanges = () => {
  const trackChanges = () => {
    let currentUrl = document.location.href;
    const body = document.querySelector("body");
    
    const observer = new MutationObserver(() => {
      if (currentUrl !== document.location.href) {
        currentUrl = document.location.href;
        console.log("URL изменен:", document.location.href);
      }
    });
    
    if (body) {
      observer.observe(body, { childList: true, subtree: true });
    }
  };
  
  window.addEventListener("load", trackChanges);
};

// Конфигурация для сценариев выделения элементов
const CONFIG = {
  HIGHLIGHT_COLOR: "#0da2e7",
  HIGHLIGHT_BG: "#0da2e71a",
  Z_INDEX: 10000,
  SELECTED_ATTR: "data-selected",
  HOVERED_ATTR: "data-hovered"
};

// Базовая инициализация консоли для отслеживания ошибок
const initConsoleTracking = () => {
  const originalConsole = {
    log: console.log,
    warn: console.warn,
    error: console.error
  };
  
  console.log = function(...args) {
    originalConsole.log.apply(console, args);
  };
  
  console.warn = function(...args) {
    originalConsole.warn.apply(console, args);
  };
  
  console.error = function(...args) {
    originalConsole.error.apply(console, args);
  };
};

// Отслеживание сетевых запросов
const trackNetworkRequests = () => {
  const originalFetch = window.fetch;
  
  window.fetch = async function(...args) {
    try {
      const response = await originalFetch(...args);
      return response;
    } catch (error) {
      console.error("Ошибка сетевого запроса:", error);
      throw error;
    }
  };
};

// Инициализация отладки ошибок JavaScript
const initErrorTracking = () => {
  window.addEventListener("error", (event) => {
    console.error("JavaScript Error:", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  });
  
  window.addEventListener("unhandledrejection", (event) => {
    console.error("Unhandled Promise Rejection:", event.reason);
  });
};

// Безопасная инициализация функций только для локального использования
const initLocalTools = () => {
  // Инициализация только базовых функций
  initConsoleTracking();
  trackNetworkRequests();
  initErrorTracking();
  trackUrlChanges();
  
  console.info("DevTalk локальные инструменты инициализированы");
};

// Запуск только в режиме разработки
if (window.location.hostname === "localhost" || 
    window.location.hostname.includes("lovable.app") || 
    window.location.search.includes("debug=true")) {
  initLocalTools();
}

// Предотвращение загрузки внешних скриптов
const preventExternalScripts = () => {
  // Перехват создания элементов script
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      const originalSetAttribute = element.setAttribute;
      
      element.setAttribute = function(name, value) {
        if (name === 'src' && typeof value === 'string') {
          // Блокировка внешних скриптов
          if (value.includes('gpteng.co') || 
              value.includes('cdn.') || 
              value.includes('gptengineer')) {
            console.warn('Заблокирована попытка загрузки внешнего скрипта:', value);
            return;
          }
        }
        return originalSetAttribute.call(this, name, value);
      };
    }
    
    return element;
  };
};

// Активировать защиту
preventExternalScripts();
