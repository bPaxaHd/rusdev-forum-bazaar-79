
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Layers, Code, ArrowRight, BookOpen, Cloud, Activity } from "lucide-react";
import TopicCard from "@/components/TopicCard";

// Пример данных для Fullstack
const fullstackTopics = [
  {
    id: 3,
    title: "Микросервисная архитектура на Go: поделитесь опытом",
    preview: "Собираюсь переписать большой монолит на микросервисы с использованием Go. Ищу советы и подводные камни.",
    author: "Дмитрий С.",
    authorRole: "Fullstack разработчик",
    authorAvatar: "",
    repliesCount: 29,
    likesCount: 32,
    viewsCount: 487,
    tags: ["Go", "Микросервисы", "Архитектура"],
    lastActivity: "2023-08-10T16:15:00",
    category: "fullstack" as const
  },
  {
    id: 9,
    title: "MERN стек в 2023: актуален ли?",
    preview: "Начинаю новый проект и рассматриваю MERN стек (MongoDB, Express, React, Node.js). Насколько он актуален в 2023 году?",
    author: "Игорь Л.",
    authorRole: "Fullstack разработчик",
    authorAvatar: "",
    repliesCount: 18,
    likesCount: 25,
    viewsCount: 412,
    tags: ["MERN", "MongoDB", "React", "Node.js"],
    lastActivity: "2023-07-15T11:30:00",
    category: "fullstack" as const
  },
  {
    id: 10,
    title: "Опыт внедрения TypeScript в полный стек проекта",
    preview: "Хотим мигрировать существующий JS проект (React + Node.js) на TypeScript. Какие подводные камни и best practices?",
    author: "Анна В.",
    authorRole: "Tech Lead",
    authorAvatar: "",
    repliesCount: 15,
    likesCount: 27,
    viewsCount: 329,
    tags: ["TypeScript", "React", "Node.js", "Миграция"],
    lastActivity: "2023-07-08T15:45:00",
    category: "fullstack" as const
  }
];

const fullstackResources = [
  {
    title: "Архитектура приложений",
    description: "Архитектурные паттерны, проектирование полного стека и лучшие практики.",
    icon: <Layers size={24} className="text-purple-500" />,
    link: "#"
  },
  {
    title: "Современные стеки",
    description: "Изучите популярные стеки: MERN, MEAN, JAMstack и другие современные комбинации.",
    icon: <Code size={24} className="text-purple-500" />,
    link: "#"
  },
  {
    title: "Облачные технологии",
    description: "Развертывание и масштабирование приложений в облаке, serverless и DevOps.",
    icon: <Cloud size={24} className="text-purple-500" />,
    link: "#"
  },
  {
    title: "Производительность",
    description: "Оптимизация производительности на всех уровнях приложения, от базы данных до интерфейса.",
    icon: <Activity size={24} className="text-purple-500" />,
    link: "#"
  }
];

const Fullstack = () => {
  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <section className="bg-secondary/50 py-16 md:py-20">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/2">
              <Badge className="mb-3" variant="secondary">
                Fullstack разработка
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Создавайте полноценные приложения от начала до конца
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                Обсуждайте всё, что связано с разработкой полного стека: 
                архитектуру, взаимодействие клиента и сервера, DevOps и многое другое.
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
                  <Layers size={48} className="text-purple-500" />
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
              Учебные материалы по Fullstack разработке
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Подборка полезных материалов для изучения и совершенствования навыков в Fullstack разработке.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {fullstackResources.map((resource, index) => (
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
                Популярные темы по Fullstack
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Присоединяйтесь к обсуждениям актуальных тем в мире Fullstack разработки.
              </p>
            </div>
            
            <Button variant="outline" className="gap-2 mt-4 md:mt-0">
              Все темы
              <ArrowRight size={16} />
            </Button>
          </div>
          
          <div className="space-y-4">
            {fullstackTopics.map(topic => (
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
              Подпишитесь на новости Fullstack
            </h2>
            
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Получайте уведомления о новых темах, ресурсах и событиях в мире Fullstack разработки.
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

export default Fullstack;
