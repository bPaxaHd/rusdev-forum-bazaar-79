
import React from "react";
import { Link } from "react-router-dom";
import { Github, Twitter, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
interface FooterProps {
  className?: string;
}
const Footer: React.FC<FooterProps> = ({
  className
}) => {
  return <footer className={cn("w-full bg-card py-8 border-t", className)}>
      <div className="container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4L20 8.5V15.5L12 20L4 15.5V8.5L12 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xl font-bold">DevTalk</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Сообщество русскоязычных разработчиков, где мы делимся знаниями, опытом и помогаем друг другу расти профессионально.
            </p>
            <div className="flex space-x-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Github size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Twitter size={20} />
              </a>
              <a href="mailto:contact@devtalk.ru" className="text-muted-foreground hover:text-foreground">
                <Mail size={20} />
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Направления</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/frontend" className="text-muted-foreground hover:text-foreground text-sm">Frontend разработка</Link>
              </li>
              <li>
                <Link to="/backend" className="text-muted-foreground hover:text-foreground text-sm">Backend разработка</Link>
              </li>
              <li>
                <Link to="/fullstack" className="text-muted-foreground hover:text-foreground text-sm">Fullstack разработка</Link>
              </li>
              <li>
                <Link to="/forum" className="text-muted-foreground hover:text-foreground text-sm">Форум разработчиков</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Ресурсы</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/documentation" className="text-muted-foreground hover:text-foreground text-sm">Документация</Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground text-sm">Блог</Link>
              </li>
              <li>
                <Link to="/video-tutorials" className="text-muted-foreground hover:text-foreground text-sm">Видеоуроки</Link>
              </li>
              <li>
                <Link to="/career" className="text-muted-foreground hover:text-foreground text-sm">Карьера</Link>
              </li>
              <li>
                <Link to="/jobs" className="text-muted-foreground hover:text-foreground text-sm">Вакансии</Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-medium mb-4">Сообщество</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about-us" className="text-muted-foreground hover:text-foreground text-sm">О нас</Link>
              </li>
              <li>
                <Link to="/forum-rules" className="text-muted-foreground hover:text-foreground text-sm">Правила форума</Link>
              </li>
              <li>
                <Link to="/contacts" className="text-muted-foreground hover:text-foreground text-sm">Контакты</Link>
              </li>
              <li>
                <Link to="/help" className="text-muted-foreground hover:text-foreground text-sm">Помощь</Link>
              </li>
              <li>
                <Link to="/premium" className="text-muted-foreground hover:text-foreground text-sm">Подписки</Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-6 flex flex-col md:flex-row justify-center items-center text-sm text-muted-foreground">
          <div className="mb-4 md:mb-0">© 2025 DevTalk. Все права защищены.</div>
          <div className="flex gap-4 mx-auto">
            <Link to="/terms" className="hover:text-foreground">Условия использования</Link>
            <Link to="/privacy" className="hover:text-foreground">Политика конфиденциальности</Link>
          </div>
        </div>
      </div>
    </footer>;
};
export default Footer;
