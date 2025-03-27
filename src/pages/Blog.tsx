
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const Blog = () => {
  const blogPosts = [
    {
      id: 1,
      title: "Что нового в React 18: обзор ключевых возможностей",
      summary: "Изучаем новые функции и улучшения производительности в последней версии React.",
      author: "Алексей Петров",
      date: "15 мая 2023",
      category: "Frontend",
      comments: 12,
      image: "https://via.placeholder.com/800x400"
    },
    {
      id: 2,
      title: "Оптимизация работы с базами данных в Node.js приложениях",
      summary: "Рассматриваем лучшие практики работы с базами данных для серверных приложений.",
      author: "Мария Иванова",
      date: "2 апреля 2023",
      category: "Backend",
      comments: 8,
      image: "https://via.placeholder.com/800x400"
    },
    {
      id: 3,
      title: "Fullstack разработка с использованием TypeScript",
      summary: "Как TypeScript может улучшить вашу разработку на стороне клиента и сервера.",
      author: "Дмитрий Сидоров",
      date: "20 марта 2023",
      category: "Fullstack",
      comments: 15,
      image: "https://via.placeholder.com/800x400"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <Badge variant="secondary" className="mb-3">
          Блог
        </Badge>
        <h1 className="text-4xl font-bold mb-6">Блог DevTalk</h1>
        <p className="text-muted-foreground mb-12 text-lg">
          Наш блог о разработке программного обеспечения, новых технологиях и лучших практиках в IT-индустрии.
        </p>

        <div className="grid grid-cols-1 gap-12">
          {blogPosts.map((post) => (
            <div key={post.id} className="border rounded-lg overflow-hidden">
              <div className="aspect-video w-full bg-muted">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <Badge variant="outline">{post.category}</Badge>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{post.date}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <User size={14} />
                    <span>{post.author}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare size={14} />
                    <span>{post.comments} комментариев</span>
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold hover:text-primary transition-colors">
                  <a href="#">{post.title}</a>
                </h2>
                
                <p className="text-muted-foreground">{post.summary}</p>
                
                <Button variant="link" className="p-0 h-auto font-medium flex items-center gap-1 text-primary">
                  Читать дальше
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button variant="outline" className="rounded-md">Загрузить больше статей</Button>
        </div>
      </div>
    </div>
  );
};

export default Blog;
