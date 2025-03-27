import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import TechCategoryCard from "@/components/TechCategoryCard";
import RecentTopics from "@/components/RecentTopics";
import { Monitor, Database, Layers, MessageCircle, ArrowRight, ChevronRight } from "lucide-react";
import { NavLink } from "react-router-dom";
const Index = () => {
  return <div className="animate-fade-in">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl h-[500px] bg-primary/5 rounded-full blur-[80px] -z-10"></div>
        </div>
        
        <div className="container px-4 mx-auto text-center relative z-10">
          <Badge className="mb-6 animate-slide-in" variant="secondary">
            Сообщество русскоязычных разработчиков
          </Badge>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-slide-in">
            <span className="text-gradient">DevTalk</span> — Форум для разработчиков
          </h1>
          
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-8 animate-slide-in">
            Общайтесь с единомышленниками, делитесь опытом и находите решения технических вопросов в нашем сообществе.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-slide-in">
            <NavLink to="/forum">
              <Button size="lg" className="rounded-md gap-2">
                Перейти к форуму
                <ArrowRight size={16} />
              </Button>
            </NavLink>
            
            <NavLink to="/login">
              <Button variant="outline" size="lg" className="rounded-md gap-2">
                Войти в аккаунт
                <ChevronRight size={16} />
              </Button>
            </NavLink>
          </div>
          
          <div className="flex justify-center items-center gap-8 flex-wrap">
            <div className="glass px-4 py-3 rounded-full flex items-center gap-2 animate-scale-in">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-primary/20"></div>
                <div className="w-8 h-8 rounded-full bg-blue-500/20"></div>
                <div className="w-8 h-8 rounded-full bg-green-500/20"></div>
              </div>
              <span className="font-medium">12+ участников</span>
            </div>
            
            <div className="glass px-4 py-3 rounded-full flex items-center gap-2 animate-scale-in">
              <MessageCircle className="text-primary" size={18} />
              <span className="font-medium">5+ обсуждений</span>
            </div>
            
            <div className="glass px-4 py-3 rounded-full flex items-center gap-2 animate-scale-in">
              <div className="flex items-center">
                <span className="text-sm font-semibold">4.9</span>
                <div className="flex ml-1">
                  {[1, 2, 3, 4, 5].map((_, i) => <svg key={i} xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="text-primary">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>)}
                </div>
              </div>
              <span className="font-medium">Рейтинг сообщества</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-3">
              Направления разработки
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Выберите интересующее вас направление
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Наше сообщество объединяет специалистов из разных областей разработки. 
              Найдите свое направление и присоединяйтесь к обсуждениям.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <TechCategoryCard title="Frontend" description="Обсуждение JavaScript, фреймворков и всего, что связано с клиентской разработкой." icon={<Monitor size={24} />} color="bg-blue-500" technologies={["React", "Vue", "Angular", "TypeScript", "CSS", "HTML"]} to="/frontend" />
            
            <TechCategoryCard title="Backend" description="Серверная разработка, базы данных, API и всё, что работает на стороне сервера." icon={<Database size={24} />} color="bg-green-500" technologies={["Node.js", "Python", "Go", "Java", "SQL", "NoSQL"]} to="/backend" />
            
            <TechCategoryCard title="Fullstack" description="Полный стек разработки, архитектура приложений и комплексные решения." icon={<Layers size={24} />} color="bg-purple-500" technologies={["MERN", "MEAN", "Django", "Laravel", "DevOps", "AWS"]} to="/fullstack" />
          </div>
        </div>
      </section>

      {/* Recent Topics Section */}
      <section className="py-16 md:py-24 bg-secondary/50">
        <div className="container px-4 mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <Badge variant="secondary" className="mb-3">
                Последние обсуждения
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                Актуальные темы
              </h2>
              <p className="text-muted-foreground max-w-2xl">
                Присоединяйтесь к обсуждению актуальных вопросов и проблем в мире разработки.
              </p>
            </div>
            
            <NavLink to="/forum" className="mt-4 md:mt-0">
              <Button variant="outline" className="gap-2">
                Все темы
                <ArrowRight size={16} />
              </Button>
            </NavLink>
          </div>
          
          <RecentTopics />
        </div>
      </section>

      {/* Join Community Section */}
      <section className="py-16 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="card-glass p-8 md:p-12 rounded-2xl max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-4">
              Присоединяйтесь к сообществу
            </Badge>
            
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Стать частью DevTalk сообщества
            </h2>
            
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Зарегистрируйтесь, чтобы получить доступ ко всем возможностям форума, 
              задавать вопросы, участвовать в дискуссиях и делиться своим опытом с другими разработчиками.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <NavLink to="/register">
                <Button size="lg" className="rounded-md w-full sm:w-auto gap-2">
                  Зарегистрироваться
                  <ArrowRight size={16} />
                </Button>
              </NavLink>
              
              <NavLink to="/forum">
                <Button variant="outline" size="lg" className="rounded-md w-full sm:w-auto">
                  Узнать больше
                </Button>
              </NavLink>
            </div>
          </div>
        </div>
      </section>
    </div>;
};
export default Index;