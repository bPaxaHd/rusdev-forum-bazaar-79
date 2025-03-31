
/**
 * Утилита для очистки HTML от подозрительных скриптов
 */

// Список подозрительных доменов
const suspiciousDomains = ['gpteng.co', 'gptengineer', 'lovable.ai', 'cdn.'];

/**
 * Очищает HTML от скриптов из подозрительных доменов
 */
export const cleanHtml = (): void => {
  // Функция для проверки на подозрительный URL
  const isSuspiciousUrl = (url: string | null): boolean => {
    if (!url) return false;
    return suspiciousDomains.some(domain => url.includes(domain));
  };

  // Удаление подозрительных скриптов
  const removeScripts = (): void => {
    document.querySelectorAll('script[src]').forEach(script => {
      const src = script.getAttribute('src');
      if (isSuspiciousUrl(src)) {
        console.warn('Удален подозрительный скрипт:', src);
        script.remove();
      }
    });

    // Проверяем inline скрипты на подозрительный контент
    document.querySelectorAll('script:not([src])').forEach(script => {
      const content = script.textContent || '';
      if (suspiciousDomains.some(domain => content.includes(domain))) {
        console.warn('Удален подозрительный inline скрипт');
        script.remove();
      }
    });
  };

  // Удаление подозрительных iframe
  const removeIframes = (): void => {
    document.querySelectorAll('iframe').forEach(iframe => {
      const src = iframe.getAttribute('src');
      if (isSuspiciousUrl(src)) {
        console.warn('Удален подозрительный iframe:', src);
        iframe.remove();
      }
    });
  };

  // Удаление подозрительных ссылок
  const removeLinks = (): void => {
    document.querySelectorAll('link[href]').forEach(link => {
      const href = link.getAttribute('href');
      if (isSuspiciousUrl(href)) {
        console.warn('Удалена подозрительная ссылка:', href);
        link.remove();
      }
    });
  };

  // Исполнение очистки
  removeScripts();
  removeIframes();
  removeLinks();

  // Наблюдатель за DOM для удаления динамически добавляемых скриптов
  const observer = new MutationObserver(mutations => {
    let needsCleanup = false;
    
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            
            // Проверяем, является ли новый элемент скриптом или iframe
            if (element.tagName === 'SCRIPT' || element.tagName === 'IFRAME' || element.tagName === 'LINK') {
              needsCleanup = true;
            }
          }
        });
      }
    });
    
    if (needsCleanup) {
      removeScripts();
      removeIframes();
      removeLinks();
    }
  });

  // Запускаем наблюдатель
  observer.observe(document, {
    childList: true,
    subtree: true
  });

  // Периодическая проверка DOM
  setInterval(() => {
    removeScripts();
    removeIframes();
    removeLinks();
  }, 1000);

  return;
};

/**
 * Чистит HTML и устанавливает защиту от инъекций скриптов
 */
export const setupHtmlCleaning = (): void => {
  // Очистить HTML при загрузке
  cleanHtml();
  
  // Дополнительная очистка после полной загрузки страницы
  window.addEventListener('DOMContentLoaded', () => {
    cleanHtml();
  });
  
  window.addEventListener('load', () => {
    cleanHtml();
  });
};

export default {
  cleanHtml,
  setupHtmlCleaning
};
