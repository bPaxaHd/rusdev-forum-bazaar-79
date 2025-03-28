
import React from "react";
import { Badge } from "@/components/ui/badge";

const Documentation = () => {
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <Badge variant="secondary" className="mb-3">
          Документация
        </Badge>
        <h1 className="text-4xl font-bold mb-6">Документация DevTalk</h1>
        <p className="text-muted-foreground mb-12 text-lg">
          Изучите наши руководства и справочные материалы по разработке программного обеспечения.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold mb-3">Frontend</h2>
            <p className="text-muted-foreground mb-4">
              Руководства по HTML, CSS, JavaScript, React, Vue и другим фронтенд-технологиям.
            </p>
            <ul className="space-y-2 mb-4">
              <li>• HTML/CSS основы</li>
              <li>• JavaScript ES6+</li>
              <li>• React и его экосистема</li>
              <li>• Стилизация компонентов</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold mb-3">Backend</h2>
            <p className="text-muted-foreground mb-4">
              Руководства по Node.js, Express, Django, базам данных и серверным технологиям.
            </p>
            <ul className="space-y-2 mb-4">
              <li>• Node.js и Express</li>
              <li>• Работа с REST API</li>
              <li>• SQL и NoSQL базы данных</li>
              <li>• Аутентификация и безопасность</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold mb-3">Fullstack</h2>
            <p className="text-muted-foreground mb-4">
              Руководства по полному стеку технологий для разработки веб-приложений.
            </p>
            <ul className="space-y-2 mb-4">
              <li>• MERN стек (MongoDB, Express, React, Node)</li>
              <li>• Архитектура приложений</li>
              <li>• Развертывание приложений</li>
              <li>• CI/CD и тестирование</li>
            </ul>
          </div>
          
          <div className="border rounded-lg p-6 hover:shadow-md transition-shadow">
            <h2 className="text-2xl font-bold mb-3">Инструменты</h2>
            <p className="text-muted-foreground mb-4">
              Руководства по инструментам разработки, системам контроля версий и IDE.
            </p>
            <ul className="space-y-2 mb-4">
              <li>• Git и GitHub</li>
              <li>• VSCode и его расширения</li>
              <li>• Webpack, Vite, и другие сборщики</li>
              <li>• Docker для разработчиков</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
