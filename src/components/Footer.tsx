
import React from "react";
import { NavLink } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code, Github, Mail, MessageCircle, Twitter, Monitor, Database, Layers } from "lucide-react";

const Footer = () => {
  return <footer className="bg-background border-t border-border/50 py-12 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Code className="text-primary" />
              <span className="font-semibold text-xl">DevTalk</span>
            </div>
            <p className="text-muted-foreground text-sm">
              Сообщество русскоязычных разработчиков, где мы делимся знаниями, 
              опытом и помогаем друг другу расти профессионально.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Github size={18} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Twitter size={18} />
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Mail size={18} />
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4">Направления</h3>
            <ul className="space-y-2">
              <li>
                <NavLink to="/frontend" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-2">
                  <Monitor size={14} />
                  Frontend разработка
                </NavLink>
              </li>
              <li>
                <NavLink to="/backend" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-2">
                  <Database size={14} />
                  Backend разработка
                </NavLink>
              </li>
              <li>
                <NavLink to="/fullstack" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-2">
                  <Layers size={14} />
                  Fullstack разработка
                </NavLink>
              </li>
              <li>
                <NavLink to="/forum" className="text-muted-foreground hover:text-foreground text-sm flex items-center gap-2">
                  <MessageCircle size={14} />
                  Форум разработчиков
                </NavLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Ресурсы</h3>
            <ul className="space-y-2">
              <li>
                <NavLink to="/documentation" className="text-muted-foreground hover:text-foreground text-sm">Документация</NavLink>
              </li>
              <li>
                <NavLink to="/blog" className="text-muted-foreground hover:text-foreground text-sm">Блог</NavLink>
              </li>
              <li>
                <NavLink to="/video-tutorials" className="text-muted-foreground hover:text-foreground text-sm">Видеоуроки</NavLink>
              </li>
              <li>
                <NavLink to="/career" className="text-muted-foreground hover:text-foreground text-sm">Карьера</NavLink>
              </li>
              <li>
                <NavLink to="/jobs" className="text-muted-foreground hover:text-foreground text-sm">Вакансии</NavLink>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-medium mb-4">Сообщество</h3>
            <ul className="space-y-2">
              <li>
                <NavLink to="/about-us" className="text-muted-foreground hover:text-foreground text-sm">О нас</NavLink>
              </li>
              <li>
                <NavLink to="/forum-rules" className="text-muted-foreground hover:text-foreground text-sm">Правила форума</NavLink>
              </li>
              <li>
                <NavLink to="/contacts" className="text-muted-foreground hover:text-foreground text-sm">Контакты</NavLink>
              </li>
              <li>
                <NavLink to="/help" className="text-muted-foreground hover:text-foreground text-sm">Помощь</NavLink>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} РусДев. Все права защищены.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <NavLink to="/terms" className="text-sm text-muted-foreground hover:text-foreground">
              Условия использования
            </NavLink>
            <NavLink to="/privacy" className="text-sm text-muted-foreground hover:text-foreground">
              Политика конфиденциальности
            </NavLink>
          </div>
        </div>
      </div>
    </footer>;
};

export default Footer;
