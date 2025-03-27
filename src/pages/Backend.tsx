
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Database, Code, Server, ArrowRight, BookOpen, Shield } from "lucide-react";
import TopicCard from "@/components/TopicCard";

// Пример данных для Backend
const backendTopics = [
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
  }
];

const backendResources = [
  {
    title: "Базы данных",
    description: "Изучите SQL и NoSQL базы данных, оптимизацию запросов и работу с данными.",
    icon: <Database size={24} className="text-green-500" />,
    link: "#"
  },
  {
    title: "API и микросервисы",
    description: "Разработка RESTful и GraphQL API, архитектура микросервисов.",
    icon: <Code size={24} className="text-green-500" />,
    link: "#"
  },
  {
    title: "Серверная инфраструктура",
    description: "Администрирование серверов, контейнеризация, масштабирование.",
    icon: <Server size={24} className="text-green-500" />,
    link: "#"
  },
  {
    title: "Безопасность",
    description: "Защита приложений, аутентификация, авторизация и лучшие практики безопасности.",
    icon: <Shield size={24} className="text-green-500" />,
    link: "#"
  }
];

const Backend = () => {
  return (
    <div className="animate-fade-in">
      {/* Header Section */}
      <section className="bg-secondary/50 py-16 md:py-20">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row gap-12">
            <div className="md:w-1/2">
              <Badge className="mb-3" variant="secondary">
                Backend разработка
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
                Создавайте мощные и масштабируемые серверные решения
              </h1>
              <p className="text-muted-foreground text-lg mb-6">
                Обсуждайте базы данных, API, серверную инфраструктуру и все аспекты 
                разработки надежных серверных приложений.
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
                  <Database size={48} className="text-green-500" />
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
              Учебные материалы по Backend разработке
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Подборка полезных материалов для изучения и совершенствования навыков в Backend разработке.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {backendResources.map((resource, index) => (
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
                Популярные темы по Backend
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Присоединяйтесь к обсуждениям актуальных тем в мире Backend разработки.
              </p>
            </div>
            
            <Button variant="outline" className="gap-2 mt-4 md:mt-0">
              Все темы
              <ArrowRight size={16} />
            </Button>
          </div>
          
          <div className="space-y-4">
            {backendTopics.map(topic => (
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
              Подпишитесь на новости Backend
            </h2>
            
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Получайте уведомления о новых темах, ресурсах и событиях в мире Backend разработки.
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

export default Backend;
