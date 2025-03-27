
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MessageCircle, MapPin, Send } from "lucide-react";

const Contacts = () => {
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <Badge variant="secondary" className="mb-3">
          Контакты
        </Badge>
        <h1 className="text-4xl font-bold mb-6">Свяжитесь с нами</h1>
        <p className="text-muted-foreground mb-12 text-lg">
          Есть вопросы, предложения или нужна помощь? Мы всегда готовы помочь вам.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold mb-6">Наши контакты</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Mail className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Email</h3>
                  <p className="text-muted-foreground mb-1">Для общих вопросов:</p>
                  <a href="mailto:info@devtalk.ru" className="text-primary hover:underline">
                    info@devtalk.ru
                  </a>
                  <p className="text-muted-foreground mb-1 mt-2">Техническая поддержка:</p>
                  <a href="mailto:support@devtalk.ru" className="text-primary hover:underline">
                    support@devtalk.ru
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <Phone className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Телефон</h3>
                  <p className="text-muted-foreground mb-1">Офис:</p>
                  <a href="tel:+74951234567" className="text-primary hover:underline">
                    +7 (495) 123-45-67
                  </a>
                  <p className="text-muted-foreground mb-1 mt-2">Поддержка пользователей:</p>
                  <a href="tel:+74957654321" className="text-primary hover:underline">
                    +7 (495) 765-43-21
                  </a>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <MessageCircle className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Социальные сети</h3>
                  <p className="text-muted-foreground mb-3">Следите за нами в социальных сетях:</p>
                  <div className="flex gap-3">
                    <a href="#" className="p-2 border rounded-full hover:bg-muted transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                      </svg>
                    </a>
                    <a href="#" className="p-2 border rounded-full hover:bg-muted transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                      </svg>
                    </a>
                    <a href="#" className="p-2 border rounded-full hover:bg-muted transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                      </svg>
                    </a>
                    <a href="#" className="p-2 border rounded-full hover:bg-muted transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                        <rect x="2" y="9" width="4" height="12"></rect>
                        <circle cx="4" cy="4" r="2"></circle>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-full bg-primary/10">
                  <MapPin className="text-primary" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Адрес</h3>
                  <p className="text-muted-foreground">
                    Россия, г. Москва,<br />
                    ул. Технологическая, д. 42,<br />
                    БЦ "Цифровой", офис 307
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-6">Напишите нам</h2>
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Ваше имя</label>
                <input type="text" className="w-full border rounded-md p-2" placeholder="Введите ваше имя" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input type="email" className="w-full border rounded-md p-2" placeholder="Введите ваш email" />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Тема</label>
                <select className="w-full border rounded-md p-2">
                  <option>Общий вопрос</option>
                  <option>Техническая поддержка</option>
                  <option>Сотрудничество</option>
                  <option>Предложение</option>
                  <option>Другое</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Сообщение</label>
                <textarea className="w-full border rounded-md p-2 min-h-[150px]" placeholder="Введите ваше сообщение"></textarea>
              </div>
              
              <Button type="submit" className="w-full gap-2">
                Отправить сообщение
                <Send size={16} />
              </Button>
            </form>
          </div>
        </div>

        <div className="border rounded-lg overflow-hidden h-[400px] w-full">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2245.3776121741037!2d37.617564377006394!3d55.75603497987339!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46b54a50b315e573%3A0xa886bf5a3d9b2e68!2z0JzQvtGB0LrQvtCy0YHQutC40Lkg0JrRgNC10LzQu9GM!5e0!3m2!1sru!2sru!4v1649323826458!5m2!1sru!2sru" 
            width="100%" 
            height="100%" 
            style={{ border: 0 }} 
            allowFullScreen 
            loading="lazy" 
            referrerPolicy="no-referrer-when-downgrade">
          </iframe>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
