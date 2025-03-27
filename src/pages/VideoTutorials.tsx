
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const VideoTutorials = () => {
  const frontendVideos = [
    {
      id: 1,
      title: "Основы React и построение SPA",
      duration: "45:22",
      author: "Алексей Петров",
      thumbnail: "https://via.placeholder.com/640x360",
      views: 12540
    },
    {
      id: 2,
      title: "Продвинутое управление состоянием в React",
      duration: "38:15",
      author: "Мария Иванова",
      thumbnail: "https://via.placeholder.com/640x360",
      views: 8320
    },
    {
      id: 3,
      title: "CSS Grid и Flexbox: создание современных макетов",
      duration: "32:10",
      author: "Дмитрий Сидоров",
      thumbnail: "https://via.placeholder.com/640x360",
      views: 15670
    }
  ];
  
  const backendVideos = [
    {
      id: 1,
      title: "Node.js и Express: создание REST API",
      duration: "52:18",
      author: "Иван Смирнов",
      thumbnail: "https://via.placeholder.com/640x360",
      views: 9870
    },
    {
      id: 2,
      title: "Работа с базами данных в Python",
      duration: "41:30",
      author: "Анна Кузнецова",
      thumbnail: "https://via.placeholder.com/640x360",
      views: 7650
    },
    {
      id: 3,
      title: "Микросервисная архитектура с Docker",
      duration: "56:45",
      author: "Павел Николаев",
      thumbnail: "https://via.placeholder.com/640x360",
      views: 11230
    }
  ];
  
  const fullstackVideos = [
    {
      id: 1,
      title: "MERN Stack: создание полноценного приложения",
      duration: "1:15:40",
      author: "Сергей Козлов",
      thumbnail: "https://via.placeholder.com/640x360",
      views: 14520
    },
    {
      id: 2,
      title: "Аутентификация и авторизация в веб-приложениях",
      duration: "48:25",
      author: "Елена Морозова",
      thumbnail: "https://via.placeholder.com/640x360",
      views: 10340
    },
    {
      id: 3,
      title: "Деплой приложения на AWS",
      duration: "37:55",
      author: "Максим Волков",
      thumbnail: "https://via.placeholder.com/640x360",
      views: 8760
    }
  ];

  const VideoCard = ({ video }) => (
    <div className="border rounded-lg overflow-hidden">
      <div className="relative aspect-video">
        <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="rounded-full bg-white/90 p-3">
            <Play className="text-primary" size={24} fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">{video.title}</h3>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <User size={14} />
            <span>{video.author}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={14} />
            <span>{video.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <Badge variant="secondary" className="mb-3">
          Видеоуроки
        </Badge>
        <h1 className="text-4xl font-bold mb-6">Видеоуроки DevTalk</h1>
        <p className="text-muted-foreground mb-12 text-lg">
          Наши видеоуроки помогут вам изучить новые технологии и улучшить свои навыки разработки.
        </p>

        <Tabs defaultValue="frontend" className="w-full mb-12">
          <TabsList className="w-full justify-start mb-6 bg-transparent">
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
            <TabsTrigger value="fullstack">Fullstack</TabsTrigger>
          </TabsList>
          
          <TabsContent value="frontend" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {frontendVideos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="backend" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {backendVideos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="fullstack" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {fullstackVideos.map(video => (
                <VideoCard key={video.id} video={video} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VideoTutorials;
