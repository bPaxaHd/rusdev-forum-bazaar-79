
// Локальная версия devTools без внешних зависимостей
// Использует только локальные модули

// Блокировка вредоносных доменов
const blockedDomains = ['gpteng.co', 'gptengineer', 'cdn.', 'lovable.ai'];

// Использовать только локальные пути
const _urls = {
  ws: '/src/modules/resources/dev-tools-socket.js',
  http: '/src/modules/resources/dev-tools.js'
};

const _generateNonce = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Проверка на вредоносные URL
const _isBlockedUrl = (url: string): boolean => {
  return blockedDomains.some(domain => url.includes(domain));
};

// Безопасная загрузка скриптов только из локальных источников
export const loadRemoteTools = async (): Promise<void> => {
  if (import.meta.env.DEV) {
    try {
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      const _loadScript = (url: string) => {
        return new Promise<void>((resolve, reject) => {
          // Проверяем, что загружаем только локальные скрипты
          if (!url.startsWith('/')) {
            console.error('Попытка загрузить внешний скрипт отклонена');
            reject();
            return;
          }
          
          // Дополнительная проверка на вредоносные URL
          if (_isBlockedUrl(url)) {
            console.error('Попытка загрузить скрипт из заблокированного домена отклонена');
            reject();
            return;
          }
          
          const script = document.createElement('script');
          script.type = 'module';
          script.src = url;
          script.onload = () => resolve();
          script.onerror = () => reject();
          document.head.appendChild(script);
        });
      };
      
      await _loadScript(_urls.http);
      console.log('DevTools загружены успешно');
    } catch (error) {
      console.error('Ошибка загрузки инструментов разработки');
    }
  }
};

// Инициализация блокировки подозрительных скриптов при старте
const initScriptBlocker = (): void => {
  // Блокировка через перехват createElement
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName: string) {
    const element = originalCreateElement.call(document, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name: string, value: string) {
        if (name === 'src' && blockedDomains.some(domain => value.includes(domain))) {
          console.warn('Заблокирована попытка загрузки подозрительного скрипта:', value);
          return element;
        }
        return originalSetAttribute.call(this, name, value);
      };
    }
    
    return element;
  };
};

// Запуск блокировщика при импорте модуля
initScriptBlocker();

export const loadDevTools = loadRemoteTools;

Object.freeze(loadRemoteTools);
Object.freeze(loadDevTools);
