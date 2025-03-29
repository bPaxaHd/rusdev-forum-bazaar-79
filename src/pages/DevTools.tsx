
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface NetworkRequest {
  url: string;
  method: string;
  status: number;
  timestamp: string;
  duration: number;
}

interface ErrorLog {
  message: string;
  stack?: string;
  timestamp: string;
}

const DevTools = () => {
  const [networkRequests, setNetworkRequests] = useState<NetworkRequest[]>([]);
  const [errorLogs, setErrorLogs] = useState<ErrorLog[]>([]);
  const [currentUrl, setCurrentUrl] = useState(window.location.href);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { toast } = useToast();

  const startMonitoring = () => {
    if (isMonitoring) return;
    
    // Создаем конфигурацию для мониторинга
    const config = {
      highlightColor: "#0da2e7",
      highlightBg: "#0da2e71a",
      allowedOrigins: [window.location.origin, "http://localhost:3000"],
      debounceDelay: 10,
      zIndex: 10000,
      tooltipOffset: 25,
    };

    // Переопределяем fetch для логирования запросов
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const startTime = Date.now();
      try {
        const response = await originalFetch(input, init);
        const request = {
          url: typeof input === 'string' ? input : input.url,
          method: init?.method || "GET",
          status: response.status,
          timestamp: new Date().toISOString(),
          duration: Date.now() - startTime,
        };
        
        setNetworkRequests(prev => [request, ...prev]);
        return response;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        const errorLog = {
          message: `Network error: ${errorMessage}`,
          timestamp: new Date().toISOString(),
        };
        setErrorLogs(prev => [errorLog, ...prev]);
        throw error;
      }
    };

    // Настраиваем отслеживание ошибок
    const errorHandler = (event: ErrorEvent) => {
      const errorLog = {
        message: event.message,
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
      };
      setErrorLogs(prev => [errorLog, ...prev]);
    };
    window.addEventListener("error", errorHandler);

    // Настраиваем отслеживание изменений URL
    const urlObserver = new MutationObserver(() => {
      if (currentUrl !== window.location.href) {
        setCurrentUrl(window.location.href);
      }
    });
    urlObserver.observe(document.body, { childList: true, subtree: true });

    // Сохраняем ссылки для очистки
    window._devToolsCleanup = () => {
      window.fetch = originalFetch;
      window.removeEventListener("error", errorHandler);
      urlObserver.disconnect();
    };

    setIsMonitoring(true);
    toast({
      title: "Мониторинг активирован",
      description: "Теперь все сетевые запросы и ошибки будут отслеживаться",
    });
  };

  const stopMonitoring = () => {
    if (!isMonitoring) return;
    
    if (window._devToolsCleanup) {
      window._devToolsCleanup();
      delete window._devToolsCleanup;
    }
    
    setIsMonitoring(false);
    toast({
      title: "Мониторинг остановлен",
      description: "Отслеживание запросов и ошибок прекращено",
    });
  };

  const clearLogs = () => {
    setNetworkRequests([]);
    setErrorLogs([]);
    toast({
      title: "Логи очищены",
      description: "Все записи мониторинга были удалены",
    });
  };

  useEffect(() => {
    return () => {
      if (window._devToolsCleanup) {
        window._devToolsCleanup();
        delete window._devToolsCleanup;
      }
    };
  }, []);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Инструменты разработчика</h1>
      
      <div className="flex flex-wrap gap-4 mb-8">
        <Button 
          onClick={isMonitoring ? stopMonitoring : startMonitoring}
          variant={isMonitoring ? "destructive" : "default"}
        >
          {isMonitoring ? "Остановить мониторинг" : "Начать мониторинг"}
        </Button>
        
        <Button 
          onClick={clearLogs}
          variant="outline"
          disabled={networkRequests.length === 0 && errorLogs.length === 0}
        >
          Очистить логи
        </Button>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Статус мониторинга</CardTitle>
          <CardDescription>Текущее состояние инструментов отладки</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Мониторинг:</span>
              <Badge variant={isMonitoring ? "default" : "outline"}>
                {isMonitoring ? "Активен" : "Неактивен"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Текущий URL:</span>
              <code className="bg-muted p-1 rounded text-sm">{currentUrl}</code>
            </div>
            <div className="flex items-center justify-between">
              <span>Количество запросов:</span>
              <Badge variant="outline">{networkRequests.length}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Количество ошибок:</span>
              <Badge variant="outline">{errorLogs.length}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="network" className="w-full">
        <TabsList className="grid grid-cols-2 w-full md:w-[400px]">
          <TabsTrigger value="network">Сетевые запросы</TabsTrigger>
          <TabsTrigger value="errors">Журнал ошибок</TabsTrigger>
        </TabsList>
        
        <TabsContent value="network" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Сетевые запросы</CardTitle>
              <CardDescription>Мониторинг всех сетевых запросов приложения</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                {networkRequests.length > 0 ? (
                  <div className="space-y-4">
                    {networkRequests.map((request, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="flex justify-between mb-2">
                          <Badge>{request.method}</Badge>
                          <Badge variant={request.status < 400 ? "outline" : "destructive"}>
                            {request.status}
                          </Badge>
                        </div>
                        <p className="mb-2 text-sm text-muted-foreground truncate">{request.url}</p>
                        <div className="flex justify-between text-xs">
                          <span>{new Date(request.timestamp).toLocaleTimeString()}</span>
                          <span>{request.duration}ms</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Нет записанных запросов
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="errors" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Журнал ошибок</CardTitle>
              <CardDescription>Мониторинг всех ошибок в приложении</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                {errorLogs.length > 0 ? (
                  <div className="space-y-4">
                    {errorLogs.map((error, index) => (
                      <div key={index} className="border rounded-lg p-3">
                        <div className="mb-2">
                          <Badge variant="destructive">Ошибка</Badge>
                          <span className="text-xs ml-2 text-muted-foreground">
                            {new Date(error.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="mb-2 text-sm font-medium">{error.message}</p>
                        {error.stack && (
                          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-[100px]">
                            {error.stack}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Нет записанных ошибок
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Добавляем расширение к Window для типизации
declare global {
  interface Window {
    _devToolsCleanup?: () => void;
  }
}

export default DevTools;
