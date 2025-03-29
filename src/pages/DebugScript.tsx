
import React, { useEffect } from "react";

const DebugScript = () => {
  useEffect(() => {
    // Создаем скрипт и выполняем его при монтировании
    const executeScript = () => {
      (() => {
        const config = {
          highlightColor: "#0da2e7",
          highlightBg: "#0da2e71a",
          allowedOrigins: ["https://example.com", "http://localhost:3000"],
          debounceDelay: 10,
          zIndex: 10000,
          tooltipOffset: 25,
        };

        const postMessageToParent = (message) => {
          config.allowedOrigins.forEach(origin => {
            try {
              if (!window.parent) return;
              window.parent.postMessage(message, origin);
            } catch (error) {
              console.error(`Message error to ${origin}:`, error);
            }
          });
        };

        const observeUrlChanges = () => {
          let lastUrl = document.location.href;
          const observer = new MutationObserver(() => {
            if (lastUrl !== document.location.href) {
              lastUrl = document.location.href;
              postMessageToParent({ type: "URL_CHANGED", url: lastUrl });
            }
          });
          observer.observe(document.body, { childList: true, subtree: true });
          return observer;
        };

        const logNetworkRequest = async (input, init) => {
          const startTime = Date.now();
          try {
            const response = await fetch(input, init);
            postMessageToParent({
              type: "NETWORK_REQUEST",
              request: {
                url: typeof input === 'string' ? input : input instanceof URL ? input.href : input.url,
                method: init?.method || "GET",
                status: response.status,
                timestamp: new Date().toISOString(),
                duration: Date.now() - startTime,
              },
            });
            return response;
          } catch (error) {
            postMessageToParent({ type: "NETWORK_ERROR", error: error.message });
            throw error;
          }
        };

        const overrideFetch = () => {
          const originalFetch = window.fetch;
          window.fetch = logNetworkRequest;
          return () => { window.fetch = originalFetch; };
        };

        const setupErrorLogging = () => {
          const errorHandler = (event) => {
            postMessageToParent({ type: "ERROR", message: event.message, stack: event.error?.stack });
          };
          window.addEventListener("error", errorHandler);
          return () => { window.removeEventListener("error", errorHandler); };
        };

        const initialize = () => {
          console.log("Debug script initialized");
          const urlObserver = observeUrlChanges();
          const restoreFetch = overrideFetch();
          const removeErrorListener = setupErrorLogging();
          
          // Сохраняем метод для очистки
          window._debugScriptCleanup = () => {
            urlObserver.disconnect();
            restoreFetch();
            removeErrorListener();
            delete window._debugScriptCleanup;
            console.log("Debug script cleaned up");
          };
        };

        initialize();
      })();
    };

    executeScript();

    return () => {
      // Очищаем при размонтировании
      if (typeof window._debugScriptCleanup === 'function') {
        window._debugScriptCleanup();
      }
    };
  }, []);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-4">Debug Script Page</h1>
      <p className="mb-4">
        Отладочный скрипт успешно загружен и выполнен. Этот скрипт отслеживает:
      </p>
      <ul className="list-disc pl-5 mb-4">
        <li>Изменения URL</li>
        <li>Сетевые запросы</li>
        <li>Ошибки JavaScript</li>
      </ul>
      <div className="p-4 bg-amber-100 rounded-md">
        <p>Откройте консоль разработчика для просмотра деталей работы скрипта.</p>
      </div>
    </div>
  );
};

// Расширяем Window для типизации
declare global {
  interface Window {
    _debugScriptCleanup?: () => void;
  }
}

export default DebugScript;
