
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Code, Users, Target, Heart } from "lucide-react";

const AboutUs = () => {
  const teamMembers = [
    {
      name: "Алексей Петров",
      role: "Основатель и CEO",
      bio: "Опытный разработчик с 15-летним стажем в области веб-технологий. Основал DevTalk с целью создания сообщества для русскоязычных разработчиков.",
      avatar: "https://via.placeholder.com/150"
    },
    {
      name: "Мария Иванова",
      role: "Технический директор",
      bio: "Специалист по архитектуре программного обеспечения и лидер технической команды DevTalk. Отвечает за разработку и поддержку платформы.",
      avatar: "https://via.placeholder.com/150"
    },
    {
      name: "Дмитрий Сидоров",
      role: "Руководитель сообщества",
      bio: "Координирует работу модераторов и развитие сообщества. Помогает поддерживать дружественную и профессиональную атмосферу на форуме.",
      avatar: "https://via.placeholder.com/150"
    },
    {
      name: "Елена Козлова",
      role: "Редактор контента",
      bio: "Отвечает за качество образовательных материалов и публикаций на платформе. Имеет опыт работы в области технической документации.",
      avatar: "https://via.placeholder.com/150"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <Badge variant="secondary" className="mb-3">
          О нас
        </Badge>
        <h1 className="text-4xl font-bold mb-6">О проекте DevTalk</h1>
        <p className="text-muted-foreground mb-12 text-lg">
          DevTalk — это сообщество русскоязычных разработчиков программного обеспечения, 
          объединенных общими интересами и стремлением к профессиональному росту.
        </p>

        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8">Наша миссия</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center p-6 border rounded-lg text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Code className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Делиться знаниями</h3>
              <p className="text-muted-foreground">
                Мы создаем платформу, где разработчики могут делиться своими знаниями, 
                опытом и лучшими практиками в области программирования.
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 border rounded-lg text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Развивать сообщество</h3>
              <p className="text-muted-foreground">
                Мы стремимся создать дружественное и инклюзивное сообщество, 
                где каждый разработчик может найти поддержку и единомышленников.
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 border rounded-lg text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Помогать в развитии</h3>
              <p className="text-muted-foreground">
                Мы помогаем разработчикам всех уровней развивать свои навыки, 
                узнавать о новых технологиях и расти профессионально.
              </p>
            </div>
            
            <div className="flex flex-col items-center p-6 border rounded-lg text-center">
              <div className="bg-primary/10 p-4 rounded-full mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Вдохновлять на творчество</h3>
              <p className="text-muted-foreground">
                Мы вдохновляем разработчиков на создание инновационных проектов, 
                экспериментирование с новыми идеями и технологиями.
              </p>
            </div>
          </div>
        </div>

        <Separator className="my-16" />

        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Наша команда</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-4 items-center sm:items-start border rounded-lg p-6">
                <div className="shrink-0">
                  <img src={member.avatar} alt={member.name} className="w-24 h-24 rounded-full object-cover" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-primary mb-2">{member.role}</p>
                  <p className="text-muted-foreground">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-16" />

        <div>
          <h2 className="text-3xl font-bold mb-8">История проекта</h2>
          <div className="space-y-6 text-muted-foreground">
            <p>
              DevTalk был основан в 2022 году группой энтузиастов, которые хотели создать русскоязычную платформу для обмена опытом и знаниями в области разработки программного обеспечения.
            </p>
            <p>
              Начав как небольшой форум для обсуждения вопросов программирования, проект быстро вырос в полноценную платформу, предлагающую разнообразные ресурсы для разработчиков: форум, блог, документацию, видеоуроки и многое другое.
            </p>
            <p>
              Сегодня DevTalk — это активное сообщество тысяч разработчиков, которые ежедневно общаются, решают технические проблемы, делятся опытом и помогают друг другу развиваться в профессиональном плане.
            </p>
            <p>
              Мы постоянно работаем над улучшением платформы, добавляем новые функции и разделы, чтобы сделать ваш опыт использования DevTalk еще более полезным и приятным.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
