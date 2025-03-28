
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Award, BookOpen, Briefcase, GraduationCap, Users } from "lucide-react";

const Career = () => {
  const resources = [
    {
      title: "Резюме и портфолио",
      description: "Советы по составлению привлекательного резюме и созданию впечатляющего портфолио для разработчика.",
      icon: <Briefcase className="h-6 w-6" />,
      cta: "Подробнее"
    },
    {
      title: "Собеседования",
      description: "Подготовка к техническим собеседованиям, типичные вопросы и задачи для разных специальностей.",
      icon: <Users className="h-6 w-6" />,
      cta: "Изучить вопросы"
    },
    {
      title: "Курсы и сертификации",
      description: "Рекомендации по курсам, тренингам и сертификациям, которые повысят вашу ценность на рынке труда.",
      icon: <GraduationCap className="h-6 w-6" />,
      cta: "Выбрать курс"
    },
    {
      title: "Карьерный рост",
      description: "Стратегии профессионального развития и продвижения по карьерной лестнице в IT-индустрии.",
      icon: <Award className="h-6 w-6" />,
      cta: "Узнать больше"
    }
  ];

  const roadmaps = [
    {
      title: "Frontend разработчик",
      description: "Путь от новичка до профессионального frontend разработчика с полным описанием необходимых навыков и технологий.",
      skills: ["HTML/CSS", "JavaScript", "React", "TypeScript", "Redux", "Webpack"],
      level: "Начинающий - Продвинутый"
    },
    {
      title: "Backend разработчик",
      description: "Подробный план развития в backend разработке, включая серверные языки, базы данных и DevOps практики.",
      skills: ["Node.js", "Python", "SQL", "NoSQL", "API Design", "Docker"],
      level: "Начинающий - Продвинутый"
    },
    {
      title: "Fullstack разработчик",
      description: "Комплексная карта навыков и технологий для полноценной fullstack разработки современных веб-приложений.",
      skills: ["JavaScript", "React", "Node.js", "Express", "MongoDB", "Git"],
      level: "Средний - Продвинутый"
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <Badge variant="secondary" className="mb-3">
          Карьера
        </Badge>
        <h1 className="text-4xl font-bold mb-6">Развитие карьеры разработчика</h1>
        <p className="text-muted-foreground mb-12 text-lg">
          Ресурсы, советы и инструменты для успешного развития вашей карьеры в области разработки программного обеспечения.
        </p>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Ресурсы для развития карьеры</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resources.map((resource, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="bg-primary/10 w-12 h-12 flex items-center justify-center rounded-full mb-4">
                    <div className="text-primary">{resource.icon}</div>
                  </div>
                  <CardTitle>{resource.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {resource.description}
                  </CardDescription>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="group">
                    {resource.cta}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Карьерные маршруты</h2>
          <div className="space-y-6">
            {roadmaps.map((roadmap, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle>{roadmap.title}</CardTitle>
                  <CardDescription>{roadmap.level}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{roadmap.description}</p>
                  <div>
                    <p className="font-medium mb-2">Ключевые навыки:</p>
                    <div className="flex flex-wrap gap-2">
                      {roadmap.skills.map((skill, skillIndex) => (
                        <Badge key={skillIndex} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Посмотреть полный маршрут</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <div className="border rounded-lg p-8 bg-muted/30 flex flex-col md:flex-row gap-6 items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-4">Поиск работы</h2>
              <p className="text-muted-foreground mb-6">
                Готовы начать поиск работы своей мечты? Просмотрите актуальные вакансии для разработчиков в нашем разделе вакансий или получите помощь в составлении резюме и подготовке к собеседованию.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button>Найти вакансию</Button>
                <Button variant="outline">Получить консультацию</Button>
              </div>
            </div>
            <div className="shrink-0">
              <BookOpen className="h-24 w-24 text-primary/50" />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Career;
