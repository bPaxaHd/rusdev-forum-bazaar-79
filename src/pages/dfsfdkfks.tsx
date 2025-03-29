
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const SecretDevTools = () => {
  const { toast } = useToast();

  useEffect(() => {
    // Скрипт инициализации инструментов отладки
    const initScript = () => {
      const config = {
        highlightColor: "#0da2e7",
        highlightBg: "#0da2e71a",
        allowedOrigins: [window.location.origin, "http://localhost:3000"],
        debounceDelay: 10,
        zIndex: 10000,
        tooltipOffset: 25,
      };

      const postMessageToParent = (message: any) => {
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

      const logNetworkRequest = async (input: RequestInfo, init?: RequestInit) => {
        const originalFetch = window.fetch;
        const startTime = Date.now();
        try {
          const response = await originalFetch(input, init);
          postMessageToParent({
            type: "NETWORK_REQUEST",
            request: {
              url: typeof input === 'string' ? input : input.url,
              method: init?.method || "GET",
              status: response.status,
              timestamp: new Date().toISOString(),
              duration: Date.now() - startTime,
            },
          });
          return response;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          postMessageToParent({ type: "NETWORK_ERROR", error: errorMessage });
          throw error;
        }
      };

      const setupErrorLogging = () => {
        const errorHandler = (event: ErrorEvent) => {
          postMessageToParent({
            type: "ERROR",
            message: event.message,
            stack: event.error?.stack
          });
        };
        window.addEventListener("error", errorHandler);
        return () => window.removeEventListener("error", errorHandler);
      };

      // Овердрайд fetch
      window.fetch = logNetworkRequest;
      
      // Инициализация отслеживания
      const urlObserver = observeUrlChanges();
      const cleanupErrors = setupErrorLogging();
      
      // Создаем функцию очистки
      window._secretToolsCleanup = () => {
        window.fetch = originalFetch;
        urlObserver.disconnect();
        cleanupErrors();
        delete window._secretToolsCleanup;
      };
      
      console.log("Debug monitoring activated");
      toast({
        title: "Мониторинг активирован",
        description: "Инструменты отладки запущены в фоновом режиме"
      });
    };

    // Оригинальный fetch перед овердрайдом
    const originalFetch = window.fetch.bind(window);
    
    // Запуск скрипта
    initScript();
    
    // Очистка при размонтировании
    return () => {
      if (typeof window._secretToolsCleanup === 'function') {
        window._secretToolsCleanup();
      }
      window.fetch = originalFetch;
    };
  }, [toast]);

  return (
    <div className="container py-8">
      <Card className="max-w-md mx-auto">
        <CardContent className="p-6">
          <div className="text-center">
            <p className="mb-4">Страница не найдена</p>
            <div className="animate-pulse flex justify-center">
              <div className="h-2 w-2 bg-muted-foreground rounded-full mx-1"></div>
              <div className="h-2 w-2 bg-muted-foreground rounded-full mx-1 animation-delay-200"></div>
              <div className="h-2 w-2 bg-muted-foreground rounded-full mx-1 animation-delay-400"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Расширение Window для типизации
declare global {
  interface Window {
    _secretToolsCleanup?: () => void;
    originalFetch?: typeof window.fetch;
  }
}

export default SecretDevTools;
