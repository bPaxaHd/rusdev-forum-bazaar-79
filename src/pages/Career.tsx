
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, TrendingUp, Award, Clock, Calendar } from "lucide-react";

const Career = () => {
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <Badge variant="secondary" className="mb-3">
          Карьера
        </Badge>
        <h1 className="text-4xl font-bold mb-6">Развитие карьеры в IT</h1>
        <p className="text-muted-foreground mb-12 text-lg">
          Полезные ресурсы и рекомендации для развития вашей карьеры в области разработки программного обеспечения.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="border rounded-lg p-8 space-y-6">
            <TrendingUp className="text-primary" size={36} />
            <h2 className="text-2xl font-bold">Карьерный рост</h2>
            <p className="text-muted-foreground">
              Узнайте, как планировать свой карьерный рост в IT и какие навыки нужно развивать для различных позиций.
            </p>
            <Button>Подробнее</Button>
          </div>
          
          <div className="border rounded-lg p-8 space-y-6">
            <Award className="text-primary" size={36} />
            <h2 className="text-2xl font-bold">Сертификации</h2>
            <p className="text-muted-foreground">
              Обзор полезных сертификаций для разработчиков и как они могут помочь в продвижении по карьерной лестнице.
            </p>
            <Button>Подробнее</Button>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Предстоящие карьерные мероприятия</h2>
        <div className="space-y-6 mb-12">
          <div className="border rounded-lg p-6 flex flex-col md:flex-row gap-6">
            <div className="shrink-0 flex flex-col items-center justify-center border rounded-lg p-4 md:p-6 bg-muted/50">
              <span className="text-3xl font-bold">15</span>
              <span className="text-sm text-muted-foreground">Июня</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Вебинар: Как подготовиться к техническому интервью</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>19:00 - 20:30</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase size={14} />
                  <span>Онлайн</span>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Опытные технические интервьюеры поделятся советами по подготовке к собеседованиям в ведущие IT-компании.
              </p>
              <Button variant="outline">Зарегистрироваться</Button>
            </div>
          </div>
          
          <div className="border rounded-lg p-6 flex flex-col md:flex-row gap-6">
            <div className="shrink-0 flex flex-col items-center justify-center border rounded-lg p-4 md:p-6 bg-muted/50">
              <span className="text-3xl font-bold">22</span>
              <span className="text-sm text-muted-foreground">Июня</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">Мастер-класс: Составление эффективного резюме для IT-специалиста</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>18:30 - 20:00</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase size={14} />
                  <span>Онлайн</span>
                </div>
              </div>
              <p className="text-muted-foreground mb-4">
                Практические советы по созданию резюме, которое привлечет внимание рекрутеров из IT-компаний.
              </p>
              <Button variant="outline">Зарегистрироваться</Button>
            </div>
          </div>
        </div>

        <div className="bg-muted rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Остались вопросы о карьере в IT?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Наши эксперты готовы ответить на ваши вопросы и помочь с планированием карьеры.
          </p>
          <Button size="lg">Получить консультацию</Button>
        </div>
      </div>
    </div>
  );
};

export default Career;
