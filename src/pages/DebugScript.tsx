
import React, { useEffect } from "react";
import { debugScript, injectDebugScript } from "../utils/debugScript";

const DebugScript = () => {
  useEffect(() => {
    // Используем функцию для внедрения скрипта из utils
    const cleanup = injectDebugScript();
    
    // Очистка при размонтировании
    return cleanup;
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
      
      <div className="mt-6 p-4 bg-gray-100 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Код скрипта:</h2>
        <pre className="bg-black text-white p-4 rounded overflow-auto text-sm">
          {debugScript}
        </pre>
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
