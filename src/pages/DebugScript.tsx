
import React, { useEffect, useState } from "react";

const DebugScript = () => {
  const [scriptContent, setScriptContent] = useState<string>("");

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
        <p>Скрипт загружен напрямую через тег script в index.html.</p>
      </div>
      
      <div className="mt-6 p-4 bg-gray-100 rounded-md">
        <h2 className="text-xl font-semibold mb-2">Код скрипта:</h2>
        <pre className="bg-black text-white p-4 rounded overflow-auto text-sm max-h-[500px]">
          {scriptContent || "Загрузка содержимого скрипта..."}
        </pre>
      </div>
    </div>
  );
};

export default DebugScript;
