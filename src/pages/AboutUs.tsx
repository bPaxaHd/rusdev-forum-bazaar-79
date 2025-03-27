
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Code, Users, MessageCircle, BookOpen, Lightbulb } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const AboutUs = () => {
  const teamMembers = [
    {
      id: 1,
      name: "Алексей Петров",
      role: "Основатель & CEO",
      bio: "Более 15 лет опыта в разработке ПО. Основал DevTalk с целью создания качественного русскоязычного сообщества разработчиков.",
      image: "https://via.placeholder.com/200"
    },
    {
      id: 2,
      name: "Мария Иванова",
      role: "CTO",
      bio: "Эксперт в области backend-разработки и архитектуры. Руководит технической стороной платформы DevTalk.",
      image: "https://via.placeholder.com/200"
    },
    {
      id: 3,
      name: "Дмитрий Сидоров",
      role: "Frontend Lead",
      bio: "Опытный frontend-разработчик с глубоким пониманием современных технологий. Ответственен за пользовательский интерфейс DevTalk.",
      image: "https://via.placeholder.com/200"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <Badge variant="secondary" className="mb-3">
          О нас
        </Badge>
        <h1 className="text-4xl font-bold mb-6">О проекте DevTalk</h1>

        <div className="space-y-12">
          <section className="space-y-4">
            <p className="text-xl text-muted-foreground">
              DevTalk — это сообщество русскоязычных разработчиков, созданное с целью обмена знаниями, опытом и 
              поддержки профессионального роста в области разработки программного обеспечения.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">Наша миссия</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <MessageCircle className="text-primary" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold">Коммуникация</h3>
                </div>
                <p className="text-muted-foreground">
                  Создать пространство для общения, обмена идеями и совместного решения технических проблем.
                </p>
              </div>
              
              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <BookOpen className="text-primary" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold">Образование</h3>
                </div>
                <p className="text-muted-foreground">
                  Делиться знаниями и ресурсами, которые помогают разработчикам осваивать новые технологии.
                </p>
              </div>
              
              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Users className="text-primary" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold">Сообщество</h3>
                </div>
                <p className="text-muted-foreground">
                  Сформировать дружественное и поддерживающее сообщество профессионалов и начинающих разработчиков.
                </p>
              </div>
              
              <div className="border rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Lightbulb className="text-primary" size={24} />
                  </div>
                  <h3 className="text-xl font-semibold">Инновации</h3>
                </div>
                <p className="text-muted-foreground">
                  Поощрять новаторское мышление и разработку оригинальных решений в сфере программирования.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-bold mb-6">Наша команда</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.map(member => (
                <div key={member.id} className="text-center space-y-4">
                  <div className="mx-auto w-32 h-32 rounded-full overflow-hidden">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p className="text-primary font-medium">{member.role}</p>
                  <p className="text-muted-foreground">{member.bio}</p>
                </div>
              ))}
            </div>
          </section>

          <Separator />

          <section className="text-center space-y-6">
            <h2 className="text-2xl font-bold">Присоединяйтесь к нашему сообществу</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              DevTalk — это не просто форум, это сообщество единомышленников, 
              готовых поделиться знаниями и помочь в решении сложных задач.
            </p>
            <div className="flex justify-center">
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="outline" className="px-3 py-1">
                  Frontend
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  Backend
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  Fullstack
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  DevOps
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  Mobile
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  Data Science
                </Badge>
                <Badge variant="outline" className="px-3 py-1">
                  Machine Learning
                </Badge>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
