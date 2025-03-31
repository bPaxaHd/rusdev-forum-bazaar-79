
// Локальная версия devTools без внешних зависимостей
// Использует только локальные модули

// Использовать только локальные пути
const _urls = {
  ws: '/src/modules/resources/dev-tools-socket.js',
  http: '/src/modules/resources/dev-tools.js'
};

const _generateNonce = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

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

export const loadDevTools = loadRemoteTools;

Object.freeze(loadRemoteTools);
Object.freeze(loadDevTools);
