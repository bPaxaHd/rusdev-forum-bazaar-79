
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Play, User } from "lucide-react";

const VideoTutorials = () => {
  const tutorials = [
    {
      id: 1,
      title: "Основы React: создание первого приложения",
      description: "В этом видеоуроке мы рассмотрим основы React и создадим простое приложение с нуля.",
      author: "Алексей Петров",
      duration: "45 мин",
      thumbnail: "https://via.placeholder.com/800x450",
      views: 1250,
      category: "Frontend"
    },
    {
      id: 2,
      title: "Node.js и Express: создание REST API",
      description: "Научитесь создавать RESTful API с использованием Node.js и Express.js.",
      author: "Мария Иванова",
      duration: "55 мин",
      thumbnail: "https://via.placeholder.com/800x450",
      views: 980,
      category: "Backend"
    },
    {
      id: 3,
      title: "TypeScript для React разработчиков",
      description: "Изучите основы TypeScript и узнайте, как использовать его в React проектах.",
      author: "Дмитрий Сидоров",
      duration: "60 мин",
      thumbnail: "https://via.placeholder.com/800x450",
      views: 1420,
      category: "Frontend"
    },
    {
      id: 4,
      title: "Основы SQL для веб-разработчиков",
      description: "В этом уроке вы изучите основы SQL для работы с базами данных в веб-приложениях.",
      author: "Елена Козлова",
      duration: "50 мин",
      thumbnail: "https://via.placeholder.com/800x450",
      views: 860,
      category: "Backend"
    },
    {
      id: 5,
      title: "MERN Stack: полноценное веб-приложение",
      description: "Создайте полноценное веб-приложение с использованием MongoDB, Express, React и Node.js.",
      author: "Алексей Петров",
      duration: "2 часа 15 мин",
      thumbnail: "https://via.placeholder.com/800x450",
      views: 2200,
      category: "Fullstack"
    },
    {
      id: 6,
      title: "Docker для веб-разработчиков",
      description: "Научитесь использовать Docker для контейнеризации веб-приложений.",
      author: "Дмитрий Сидоров",
      duration: "1 час 10 мин",
      thumbnail: "https://via.placeholder.com/800x450",
      views: 980,
      category: "DevOps"
    }
  ];

  const categories = ["Все", "Frontend", "Backend", "Fullstack", "DevOps", "Мобильная разработка"];

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <Badge variant="secondary" className="mb-3">
          Видеоуроки
        </Badge>
        <h1 className="text-4xl font-bold mb-6">Видеоуроки по разработке</h1>
        <p className="text-muted-foreground mb-12 text-lg">
          Учитесь у опытных разработчиков с помощью наших подробных видеоуроков по различным темам.
        </p>

        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex gap-2">
            {categories.map((category, index) => (
              <Badge 
                key={index} 
                variant={index === 0 ? "default" : "outline"} 
                className="py-2 px-4 cursor-pointer"
              >
                {category}
              </Badge>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {tutorials.map(tutorial => (
            <div key={tutorial.id} className="border rounded-lg overflow-hidden">
              <div className="relative group cursor-pointer">
                <img 
                  src={tutorial.thumbnail} 
                  alt={tutorial.title} 
                  className="w-full aspect-video object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-primary text-primary-foreground rounded-full p-3">
                    <Play className="h-8 w-8" fill="currentColor" />
                  </div>
                </div>
                <Badge className="absolute top-3 right-3">
                  {tutorial.category}
                </Badge>
              </div>
              <div className="p-5">
                <h3 className="text-xl font-bold mb-2 line-clamp-2">{tutorial.title}</h3>
                <p className="text-muted-foreground mb-4 line-clamp-2">{tutorial.description}</p>
                <div className="flex flex-wrap items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{tutorial.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock size={14} />
                    <span>{tutorial.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Play size={14} />
                    <span>{tutorial.views} просмотров</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Badge variant="outline" className="py-2 px-4 cursor-pointer">
            Загрузить больше видеоуроков
          </Badge>
        </div>
      </div>
    </div>
  );
};

export default VideoTutorials;
