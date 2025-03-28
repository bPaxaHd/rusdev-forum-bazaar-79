
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";

const Contacts = () => {
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <Badge variant="secondary" className="mb-3">
          Контакты
        </Badge>
        <h1 className="text-4xl font-bold mb-6">Свяжитесь с нами</h1>
        <p className="text-muted-foreground mb-12 text-lg">
          Есть вопросы или предложения? Мы всегда рады вам помочь.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="flex flex-col items-center text-center p-6 border rounded-lg">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Email</h3>
            <p className="text-muted-foreground">info@devtalk.ru</p>
            <p className="text-muted-foreground">support@devtalk.ru</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 border rounded-lg">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Телефон</h3>
            <p className="text-muted-foreground">+7 (495) 123-45-67</p>
            <p className="text-muted-foreground">Пн-Пт: 10:00 - 19:00</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 border rounded-lg">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Адрес</h3>
            <p className="text-muted-foreground">г. Москва, ул. Программистов, д. 42</p>
            <p className="text-muted-foreground">БЦ "Код Плаза", 3 этаж</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">Напишите нам</h2>
            <form className="space-y-4">
              <div>
                <Input placeholder="Ваше имя" />
              </div>
              <div>
                <Input type="email" placeholder="Ваш email" />
              </div>
              <div>
                <Input placeholder="Тема" />
              </div>
              <div>
                <Textarea placeholder="Ваше сообщение" className="min-h-[150px]" />
              </div>
              <Button>Отправить сообщение</Button>
            </form>
          </div>
          
          <div className="h-[400px] bg-gray-200 rounded-lg overflow-hidden">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2245.215570562365!2d37.6172!3d55.7522!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTXCsDQ1JzA4LjAiTiAzN8KwMzcnMDEuOSJF!5e0!3m2!1sru!2sru!4v1617356777694!5m2!1sru!2sru" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy"
              title="Карта"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
