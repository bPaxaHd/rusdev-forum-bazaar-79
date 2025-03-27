
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import TopicCard from "@/components/TopicCard";
import { MessageCircle, Search, Plus, Filter, Monitor, Database, Layers } from "lucide-react";

// Пример данных форума
const forumTopics = [
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
    id: 2,
    title: "Оптимизация SQL запросов в больших проектах на PostgreSQL",
    preview: "Работаю с базой данных, где таблицы содержат миллионы записей. Какие есть практики оптимизации запросов?",
    author: "Михаил В.",
    authorRole: "Backend разработчик",
    authorAvatar: "",
    repliesCount: 13,
    likesCount: 21,
    viewsCount: 274,
    tags: ["SQL", "PostgreSQL", "Оптимизация"],
    lastActivity: "2023-08-12T09:45:00",
    category: "backend" as const
  },
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
  },
  {
    id: 6,
    title: "Оптимальный стек для построения высоконагруженного API",
    preview: "Планируем API с высокой нагрузкой (~5к запросов в секунду). Какой стек технологий посоветуете для максимальной производительности?",
    author: "Артем П.",
    authorRole: "Fullstack разработчик",
    authorAvatar: "",
    repliesCount: 31,
    likesCount: 28,
    viewsCount: 542,
    tags: ["API", "Performance", "Высокие нагрузки"],
    lastActivity: "2023-07-28T09:15:00",
    category: "backend" as const
  },
  {
    id: 7,
    title: "Опыт миграции с REST на GraphQL: стоит ли?",
    preview: "Рассматриваем возможность перехода с REST на GraphQL. Кто уже прошел этот путь? Какие подводные камни и преимущества?",
    author: "Павел К.",
    authorRole: "Backend разработчик",
    authorAvatar: "",
    repliesCount: 22,
    likesCount: 19,
    viewsCount: 389,
    tags: ["GraphQL", "REST", "API", "Миграция"],
    lastActivity: "2023-07-25T14:20:00",
    category: "backend" as const
  },
  {
    id: 8,
    title: "Стратегии кэширования для NextJS приложений",
    preview: "Работаем над масштабированием NextJS приложения. Интересуют стратегии кэширования для улучшения производительности фронтенда.",
    author: "Николай Т.",
    authorRole: "Frontend разработчик",
    authorAvatar: "",
    repliesCount: 11,
    likesCount: 17,
    viewsCount: 256,
    tags: ["NextJS", "Кэширование", "Performance", "React"],
    lastActivity: "2023-07-20T10:35:00",
    category: "frontend" as const
  }
];

const Forum = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "frontend" | "backend" | "fullstack">("all");
  
  // Фильтрация тем по поисковому запросу и категории
  const filteredTopics = forumTopics.filter(topic => {
    const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         topic.preview.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         topic.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
                         
    const matchesCategory = activeFilter === "all" || topic.category === activeFilter;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <section className="bg-secondary/50 py-16 md:py-20">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl">
            <Badge variant="secondary" className="mb-3">
              Форум разработчиков
            </Badge>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Обсуждения и вопросы
            </h1>
            <p className="text-muted-foreground text-lg mb-6">
              Задавайте вопросы, делитесь опытом и участвуйте в дискуссиях с русскоязычными разработчиками.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="gap-2">
                <Plus size={18} />
                Создать тему
              </Button>
              
              <div className="relative flex-grow">
                <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input 
                  className="pl-10 h-10 w-full" 
                  placeholder="Поиск по темам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Forum Content */}
      <section className="py-12 md:py-16">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Sidebar */}
            <div className="w-full md:w-1/4">
              <div className="card-glass p-6 sticky top-24">
                <h3 className="font-medium mb-4 flex items-center gap-2">
                  <Filter size={16} />
                  Фильтры
                </h3>
                
                <div className="space-y-2">
                  <Button 
                    variant={activeFilter === "all" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveFilter("all")}
                  >
                    <MessageCircle size={16} className="mr-2" />
                    Все темы
                  </Button>
                  <Button 
                    variant={activeFilter === "frontend" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveFilter("frontend")}
                  >
                    <Monitor size={16} className="mr-2" />
                    Frontend
                  </Button>
                  <Button 
                    variant={activeFilter === "backend" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveFilter("backend")}
                  >
                    <Database size={16} className="mr-2" />
                    Backend
                  </Button>
                  <Button 
                    variant={activeFilter === "fullstack" ? "default" : "ghost"} 
                    className="w-full justify-start"
                    onClick={() => setActiveFilter("fullstack")}
                  >
                    <Layers size={16} className="mr-2" />
                    Fullstack
                  </Button>
                </div>
                
                <div className="mt-6 pt-6 border-t border-border/50">
                  <h3 className="font-medium mb-3">Популярные теги</h3>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      React
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      JavaScript
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      Node.js
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      Python
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      API
                    </Badge>
                    <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80">
                      TypeScript
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="w-full md:w-3/4">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-medium">
                  {activeFilter === "all" 
                    ? "Все темы" 
                    : activeFilter === "frontend" 
                      ? "Frontend темы" 
                      : activeFilter === "backend" 
                        ? "Backend темы" 
                        : "Fullstack темы"}
                </h2>
                <div className="text-sm text-muted-foreground">
                  {filteredTopics.length} {filteredTopics.length === 1 ? "тема" : filteredTopics.length > 1 && filteredTopics.length < 5 ? "темы" : "тем"}
                </div>
              </div>
              
              <div className="space-y-4">
                {filteredTopics.length > 0 ? (
                  filteredTopics.map(topic => (
                    <TopicCard key={topic.id} {...topic} />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">Темы не найдены</h3>
                    <p className="text-muted-foreground">
                      Попробуйте изменить критерии поиска или создайте новую тему
                    </p>
                    <Button className="mt-4 gap-2">
                      <Plus size={18} />
                      Создать тему
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Forum;
