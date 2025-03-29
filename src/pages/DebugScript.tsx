
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const DebugScript = () => {
  const [scriptContent, setScriptContent] = useState<string>("");
  const [dynamicScripts, setDynamicScripts] = useState<string[]>([]);

  useEffect(() => {
    // Fetch the debug script content to display it
    fetch("/src/utils/debugScript.js")
      .then(response => response.text())
      .then(text => {
        setScriptContent(text);
      })
      .catch(error => {
        console.error("Ошибка загрузки скрипта:", error);
      });
      
    // Find all scripts loaded in the page
    const scripts = Array.from(document.querySelectorAll('script'));
    const scriptUrls = scripts
      .filter(script => script.src)
      .map(script => script.src);
    setDynamicScripts(scriptUrls);
  }, []);
  
  const analyzeBundles = () => {
    // Get all loaded scripts including those injected by bundlers
    const allScripts = Array.from(document.querySelectorAll('script'));
    const dynamicScripts = allScripts
      .filter(script => script.getAttribute('type') === 'module')
      .map(script => script.src || 'Inline module script');
    
    setDynamicScripts(dynamicScripts);
    toast.success("Информация об используемых скриптах обновлена");
  };

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
      
      <div className="p-4 bg-amber-100 rounded-md mb-6">
        <h3 className="font-semibold mb-2">Способ загрузки скриптов:</h3>
        <p>В нашем проекте используется модульный подход с динамической загрузкой скриптов.</p>
        <p>Скрипты инжектятся в runtime через бандлер (Vite), а не напрямую в index.html.</p>
        <p>Это позволяет оптимизировать загрузку и кэширование ресурсов.</p>
      </div>
      
      <Button onClick={analyzeBundles} className="mb-6">
        Проанализировать загруженные скрипты
      </Button>
      
      <div className="mb-6 p-4 bg-gray-100 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Загруженные модульные скрипты:</h2>
        <ul className="list-disc pl-5 overflow-auto max-h-[200px]">
          {dynamicScripts.length > 0 ? (
            dynamicScripts.map((script, index) => (
              <li key={index} className="text-sm break-all mb-1">
                {script}
              </li>
            ))
          ) : (
            <li>Нет загруженных модульных скриптов</li>
          )}
        </ul>
      </div>
      
      <div className="p-4 bg-gray-100 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Код отладочного скрипта:</h2>
        <pre className="bg-black text-white p-4 rounded overflow-auto text-sm max-h-[500px]">
          {scriptContent || "Загрузка содержимого скрипта..."}
        </pre>
      </div>
    </div>
  );
};

export default DebugScript;
