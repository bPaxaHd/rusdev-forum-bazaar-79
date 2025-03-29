
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const DebugInjector = () => {
  const [scriptContent, setScriptContent] = useState<string>(`(() => {
  // Конфигурация инструмента отладки
  const config = {
    highlightColor: "#0da2e7",
    highlightBg: "#0da2e71a",
    allowedOrigins: [window.location.origin, "http://localhost:3000"],
    debounceDelay: 10,
    zIndex: 10000,
    tooltipOffset: 25,
  };

  // Отправка сообщений родительскому окну
  const postMessageToParent = (message) => {
    config.allowedOrigins.forEach(origin => {
      try {
        if (!window.parent) return;
        window.parent.postMessage(message, origin);
      } catch (error) {
        console.error(\`Message error to \${origin}:\`, error);
      }
    });
  };

  // Наблюдение за изменениями URL
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

  // Мониторинг сетевых запросов
  const monitorNetworkRequests = () => {
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
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
        postMessageToParent({ 
          type: "NETWORK_ERROR", 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
        throw error;
      }
    };
    return () => { window.fetch = originalFetch; };
  };

  // Настройка журналирования ошибок
  const setupErrorLogging = () => {
    const errorHandler = (event) => {
      postMessageToParent({ 
        type: "ERROR", 
        message: event.message, 
        stack: event.error?.stack 
      });
    };
    window.addEventListener("error", errorHandler);
    return () => { window.removeEventListener("error", errorHandler); };
  };

  // Инициализация инструментов отладки
  const initialize = () => {
    console.log("Debug tools initialized");
    const urlObserver = observeUrlChanges();
    const cleanupNetwork = monitorNetworkRequests();
    const cleanupErrors = setupErrorLogging();
    
    // Создаем метод для очистки
    window._debugToolsCleanup = () => {
      urlObserver.disconnect();
      cleanupNetwork();
      cleanupErrors();
      delete window._debugToolsCleanup;
      console.log("Debug tools cleaned up");
    };
  };

  initialize();
})();`);

  const [isInjected, setIsInjected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Проверяем, установлен ли уже скрипт отладки
    const checkInjected = () => {
      return typeof window._debugToolsCleanup === 'function';
    };
    
    setIsInjected(checkInjected());
    
    return () => {
      // Очищаем скрипт при размонтировании компонента
      if (typeof window._debugToolsCleanup === 'function') {
        window._debugToolsCleanup();
      }
    };
  }, []);

  const injectScript = () => {
    try {
      // Удаляем любой предыдущий инжектированный скрипт
      if (typeof window._debugToolsCleanup === 'function') {
        window._debugToolsCleanup();
      }
      
      // Создаем и выполняем скрипт
      const script = document.createElement('script');
      script.textContent = scriptContent;
      script.id = 'debug-injector-script';
      document.body.appendChild(script);
      
      // Создаем метод для удаления скрипта
      const originalCleanup = window._debugToolsCleanup;
      window._debugToolsCleanup = () => {
        if (originalCleanup) originalCleanup();
        if (script && script.parentNode) {
          script.parentNode.removeChild(script);
        }
        delete window._debugToolsCleanup;
      };
      
      setIsInjected(true);
      toast({
        title: "Скрипт успешно внедрен",
        description: "Инструменты отладки активированы",
      });
    } catch (error) {
      console.error("Error injecting script:", error);
      toast({
        title: "Ошибка внедрения скрипта",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive",
      });
    }
  };

  const removeScript = () => {
    try {
      if (typeof window._debugToolsCleanup === 'function') {
        window._debugToolsCleanup();
      }
      
      setIsInjected(false);
      toast({
        title: "Скрипт удален",
        description: "Инструменты отладки деактивированы",
      });
    } catch (error) {
      console.error("Error removing script:", error);
      toast({
        title: "Ошибка удаления скрипта",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Инжектор скриптов отладки</h1>
      
      <Alert className="mb-8">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Внимание</AlertTitle>
        <AlertDescription>
          Этот инструмент предназначен только для разработчиков. Инжектирование скриптов 
          может повлиять на производительность и стабильность приложения.
        </AlertDescription>
      </Alert>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Скрипт отладки</CardTitle>
          <CardDescription>
            Отредактируйте скрипт отладки ниже и нажмите "Внедрить", чтобы активировать инструменты.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={scriptContent}
            onChange={(e) => setScriptContent(e.target.value)}
            className="font-mono text-sm h-[400px]"
          />
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => setScriptContent(``)}
          >
            Сбросить
          </Button>
          {isInjected ? (
            <Button variant="destructive" onClick={removeScript}>
              Удалить скрипт
            </Button>
          ) : (
            <Button onClick={injectScript}>
              Внедрить скрипт
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Статус</CardTitle>
          <CardDescription>
            Текущее состояние инструментов отладки
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <div className={`h-3 w-3 rounded-full mr-2 ${isInjected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span>{isInjected ? 'Скрипт активен' : 'Скрипт не активен'}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Добавляем расширение к Window для типизации
declare global {
  interface Window {
    _debugToolsCleanup?: () => void;
  }
}

export default DebugInjector;
