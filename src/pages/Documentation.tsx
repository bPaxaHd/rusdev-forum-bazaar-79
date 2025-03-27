
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, File, HelpCircle } from "lucide-react";

const Documentation = () => {
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <Badge variant="secondary" className="mb-3">
          Документация
        </Badge>
        <h1 className="text-4xl font-bold mb-6">Документация DevTalk</h1>
        <p className="text-muted-foreground mb-8">
          Ознакомьтесь с нашей документацией, которая поможет вам максимально эффективно использовать платформу DevTalk.
        </p>

        <Tabs defaultValue="platform" className="w-full mb-12">
          <TabsList>
            <TabsTrigger value="platform">Платформа</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="guides">Руководства</TabsTrigger>
          </TabsList>
          <TabsContent value="platform" className="space-y-6 pt-4">
            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Book className="text-primary" size={24} />
                <h3 className="text-xl font-medium">Начало работы</h3>
              </div>
              <p className="text-muted-foreground">
                Узнайте, как начать работу с платформой DevTalk, создать учетную запись и настроить свой профиль.
              </p>
              <a href="#" className="text-primary hover:underline">Читать документацию →</a>
            </div>
            
            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <File className="text-primary" size={24} />
                <h3 className="text-xl font-medium">Форумы и дискуссии</h3>
              </div>
              <p className="text-muted-foreground">
                Узнайте, как участвовать в обсуждениях, создавать темы и отвечать на вопросы других пользователей.
              </p>
              <a href="#" className="text-primary hover:underline">Читать документацию →</a>
            </div>
            
            <div className="border rounded-lg p-6 space-y-4">
              <div className="flex items-center gap-3">
                <HelpCircle className="text-primary" size={24} />
                <h3 className="text-xl font-medium">Часто задаваемые вопросы</h3>
              </div>
              <p className="text-muted-foreground">
                Ответы на наиболее распространенные вопросы о использовании платформы DevTalk.
              </p>
              <a href="#" className="text-primary hover:underline">Читать документацию →</a>
            </div>
          </TabsContent>
          
          <TabsContent value="api" className="space-y-4 pt-4">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-medium mb-4">API документация</h3>
              <p className="text-muted-foreground mb-4">
                Наш REST API позволяет интегрировать ваши приложения с платформой DevTalk. 
                Полная документация доступна ниже.
              </p>
              <div className="bg-muted p-4 rounded-md mb-4">
                <pre className="text-sm overflow-x-auto">
                  <code>GET /api/topics - Получить список тем</code>
                </pre>
              </div>
              <div className="bg-muted p-4 rounded-md mb-4">
                <pre className="text-sm overflow-x-auto">
                  <code>POST /api/topics - Создать новую тему</code>
                </pre>
              </div>
              <a href="#" className="text-primary hover:underline">Полная API документация →</a>
            </div>
          </TabsContent>
          
          <TabsContent value="guides" className="space-y-4 pt-4">
            <div className="border rounded-lg p-6">
              <h3 className="text-xl font-medium mb-4">Руководства для разработчиков</h3>
              <p className="text-muted-foreground mb-4">
                Пошаговые руководства по различным аспектам разработки.
              </p>
              <ul className="space-y-2 mb-4">
                <li>
                  <a href="#" className="text-primary hover:underline">Руководство по Frontend разработке</a>
                </li>
                <li>
                  <a href="#" className="text-primary hover:underline">Руководство по Backend разработке</a>
                </li>
                <li>
                  <a href="#" className="text-primary hover:underline">Руководство по Fullstack разработке</a>
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Documentation;
