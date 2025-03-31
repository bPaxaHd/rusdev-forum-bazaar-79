
// Debug script for the DevTalk Forum
// Локальная версия без внешних зависимостей

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

// Безопасная инициализация отладчика
const initDebugger = () => {
  // Только минимально необходимый функционал, без внешних зависимостей
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
