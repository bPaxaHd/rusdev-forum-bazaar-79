
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Code, BookOpen, ArrowRight, PlayCircle, Github } from "lucide-react";
import TopicCard from "@/components/TopicCard";

// Пример данных для Frontend
const frontendTopics = [
  {
    id: 1,
    title: "React или Vue: что выбрать для нового проекта в 2023?",
    preview: "Планирую новый проект и хочу выбрать фреймворк между React и Vue. Какие плюсы и минусы у каждого в 2023 году?",
    author: "Алексей К.",
    authorRole: "Frontend разработчик",
    authorAvatar: "",
    repliesCount: 24,
    likesCount: 18,
    viewsCount: 356,
    tags: ["React", "Vue", "JavaScript", "Frontend"],
    lastActivity: "2023-08-15T14:23:00",
    category: "frontend" as const
  },
  {
    id: 4,
    title: "Настройка CI/CD пайплайна для React проекта с использованием GitHub Actions",
    preview: "Ищу оптимальный способ настроить CI/CD для React приложения. Какие шаги включить в пайплайн для максимальной автоматизации?",
    author: "Иван М.",
    authorRole: "DevOps инженер",
    authorAvatar: "",
    repliesCount: 8,
    likesCount: 15,
    viewsCount: 203,
    tags: ["CI/CD", "GitHub Actions", "DevOps", "React"],
    lastActivity: "2023-08-05T11:30:00",
    category: "frontend" as const
  },
  {
    id: 5,
    title: "Практики обработки ошибок в асинхронном JavaScript",
    preview: "Какие паттерны и практики вы используете для обработки ошибок в асинхронном коде на JavaScript? Интересуют подходы в промышленной разработке.",
    author: "Елена С.",
    authorRole: "Senior JavaScript разработчик",
    authorAvatar: "",
    repliesCount: 17,
    likesCount: 23,
    viewsCount: 312,
    tags: ["JavaScript", "Async/Await", "Error Handling"],
    lastActivity: "2023-08-02T16:45:00",
    category: "frontend" as const
  }
];

const frontendResources = [
  {
    title: "Современный JavaScript",
    description: "Изучите современные возможности JavaScript, асинхронное программирование и новые API.",
    icon: <Code size={24} className="text-blue-500" />,
    link: "#"
  },
  {
    title: "Фреймворки и библиотеки",
    description: "Руководства по React, Vue, Angular и другим популярным фреймворкам.",
    icon: <Monitor size={24} className="text-blue-500" />,
    link: "#"
  },
  {
    title: "Производительность и оптимизация",
    description: "Техники и инструменты для оптимизации клиентских приложений.",
    icon: <PlayCircle size={24} className="text-blue-500" />,
    link: "#"
  },
  {
    title: "Open Source проекты",
    description: "Как внести вклад в open source frontend проекты и улучшить свои навыки.",
    icon: <Github size={24} className="text-blue-500" />,
    link: "#"
  }
];

const Frontend = () => {
  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <section className="bg-secondary/50 py-16 md:py-20">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/2">
              <Badge className="mb-3" variant="secondary">
                Frontend разработка
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Создавайте красивые и функциональные интерфейсы
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                Обсуждайте современные инструменты и подходы в Frontend разработке: 
                от JavaScript и CSS до React, Vue и других фреймворков.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button className="gap-2">
                  <BookOpen size={18} />
                  Учебные материалы
                </Button>
                
                <Button variant="outline" className="gap-2">
                  <ArrowRight size={18} />
                  Перейти к форуму
                </Button>
              </div>
            </div>
            
            <div className="md:w-1/2 flex items-center justify-center">
              <div className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden card-glass">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Monitor size={48} className="text-blue-500" />
                </div>
                <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">
              Ресурсы для изучения
            </Badge>
            <h2 className="text-3xl font-bold mb-4">
              Учебные материалы по Frontend разработке
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Подборка полезных материалов для изучения и совершенствования навыков в Frontend разработке.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {frontendResources.map((resource, index) => (
              <Card key={index} className="card-glass h-full">
                <CardContent className="pt-6">
                  <div className="mb-4">
                    {resource.icon}
                  </div>
                  <h3 className="text-lg font-medium mb-2">{resource.title}</h3>
                  <p className="text-muted-foreground text-sm mb-4">{resource.description}</p>
                  <Button variant="ghost" className="p-0 h-auto text-primary flex items-center gap-1 text-sm">
                    Подробнее
                    <ArrowRight size={14} />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Topics Section */}
      <section className="py-16 bg-secondary/50">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <Badge variant="secondary" className="mb-3">
                Обсуждения
              </Badge>
              <h2 className="text-3xl font-bold mb-2">
                Популярные темы по Frontend
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Присоединяйтесь к обсуждениям актуальных тем в мире Frontend разработки.
              </p>
            </div>
            
            <Button variant="outline" className="gap-2 mt-4 md:mt-0">
              Все темы
              <ArrowRight size={16} />
            </Button>
          </div>
          
          <div className="space-y-4">
            {frontendTopics.map(topic => (
              <TopicCard key={topic.id} {...topic} />
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-16">
        <div className="container px-4 mx-auto">
          <div className="card-glass p-8 md:p-12 rounded-2xl max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Будьте в курсе
            </Badge>
            
            <h2 className="text-3xl font-bold mb-4">
              Подпишитесь на новости Frontend
            </h2>
            
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Получайте уведомления о новых темах, ресурсах и событиях в мире Frontend разработки.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Ваш email" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button className="whitespace-nowrap">Подписаться</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Frontend;
