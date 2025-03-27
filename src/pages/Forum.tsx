
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import TopicCard from "@/components/TopicCard";
import CreateTopicDialog from "@/components/CreateTopicDialog";
import { MessageCircle, Search, Filter, Monitor, Database, Layers } from "lucide-react";

// Пример данных форума, добавляем новые посты с одним на каждую категорию
const forumTopics = [
  {
    id: 1,
    title: "Стоит ли учить WebAssembly в 2023 году для frontend разработчика?",
    preview: "Начинаю погружаться глубже во frontend и задумываюсь об изучении WebAssembly. Будет ли это полезным навыком или лучше сосредоточиться на чем-то другом?",
    author: "Марк С.",
    authorRole: "Junior Frontend разработчик",
    authorAvatar: "",
    repliesCount: 8,
    likesCount: 12,
    viewsCount: 245,
    tags: ["WebAssembly", "Frontend", "JavaScript", "Карьера"],
    lastActivity: "2023-09-18T14:23:00",
    category: "frontend" as const
  },
  {
    id: 2,
    title: "Практики оптимизации MongoDB для высоконагруженных проектов",
    preview: "Столкнулся с проблемой производительности на проекте с MongoDB при большом объеме данных. Какие есть проверенные стратегии оптимизации?",
    author: "Алексей В.",
    authorRole: "Senior Backend разработчик",
    authorAvatar: "",
    repliesCount: 15,
    likesCount: 23,
    viewsCount: 340,
    tags: ["MongoDB", "NoSQL", "Оптимизация", "Backend"],
    lastActivity: "2023-09-15T10:45:00",
    category: "backend" as const
  },
  {
    id: 3,
    title: "Архитектура микрофронтендов: опыт и подводные камни",
    preview: "Наша команда планирует миграцию от монолитного фронтенда к микрофронтендам. Интересен опыт тех, кто уже прошел через это. Какие инструменты использовали? С какими проблемами столкнулись?",
    author: "Игорь М.",
    authorRole: "Lead Fullstack разработчик",
    authorAvatar: "",
    repliesCount: 19,
    likesCount: 31,
    viewsCount: 420,
    tags: ["Микрофронтенды", "Архитектура", "Fullstack", "Масштабирование"],
    lastActivity: "2023-09-10T16:30:00",
    category: "fullstack" as const
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
              <CreateTopicDialog />
              
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
                    <CreateTopicDialog />
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
