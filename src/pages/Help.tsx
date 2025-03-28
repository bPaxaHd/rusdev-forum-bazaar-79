
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpCircle, ChevronDown, Search, MessageCircle, Book, Video } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const Help = () => {
  const faqs = [
    {
      id: 1,
      question: "Как зарегистрироваться на форуме?",
      answer: "Для регистрации на форуме нажмите кнопку 'Зарегистрироваться' в правом верхнем углу страницы. Заполните необходимые поля в форме регистрации, подтвердите свой email и следуйте инструкциям для завершения процесса регистрации."
    },
    {
      id: 2,
      question: "Как создать новую тему на форуме?",
      answer: "Чтобы создать новую тему, перейдите в соответствующий раздел форума (Frontend, Backend или Fullstack). Нажмите кнопку 'Создать тему', заполните заголовок, содержание вашего вопроса или темы для обсуждения и нажмите 'Опубликовать'."
    },
    {
      id: 3,
      question: "Как отредактировать свой профиль?",
      answer: "Для редактирования профиля нажмите на свой аватар в правом верхнем углу страницы и выберите 'Профиль'. На странице профиля вы найдете кнопку редактирования, которая позволит вам изменить вашу информацию, аватар и настройки."
    },
    {
      id: 4,
      question: "Как загрузить аватар?",
      answer: "Чтобы загрузить аватар, перейдите в свой профиль, нажав на иконку профиля в правом верхнем углу. Выберите 'Редактировать профиль', затем найдите раздел загрузки аватара и следуйте инструкциям для загрузки изображения."
    },
    {
      id: 5,
      question: "Как подписаться на тему?",
      answer: "Чтобы подписаться на тему и получать уведомления о новых ответах, откройте интересующую вас тему и нажмите кнопку 'Подписаться' или соответствующий значок колокольчика рядом с заголовком темы."
    },
    {
      id: 6,
      question: "Как изменить настройки уведомлений?",
      answer: "Для изменения настроек уведомлений перейдите в свой профиль, выберите раздел 'Настройки', затем 'Уведомления'. Здесь вы можете выбрать типы уведомлений, которые хотите получать, и способы их доставки."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <Badge variant="secondary" className="mb-3">
          Помощь
        </Badge>
        <h1 className="text-4xl font-bold mb-6">Центр помощи DevTalk</h1>
        <p className="text-muted-foreground mb-12 text-lg">
          Здесь вы найдете ответы на распространенные вопросы и руководства по использованию платформы DevTalk.
        </p>

        <div className="relative mb-12">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Поиск по часто задаваемым вопросам..."
            className="w-full pl-12 pr-4 py-3 border rounded-lg"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="border rounded-lg p-6 text-center space-y-4 bg-muted/20">
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
              <Book className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-semibold">Документация</h3>
            <p className="text-muted-foreground">
              Подробная документация по всем функциям и возможностям платформы DevTalk.
            </p>
            <Button variant="outline" className="w-full">Перейти к документации</Button>
          </div>
          
          <div className="border rounded-lg p-6 text-center space-y-4 bg-muted/20">
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
              <Video className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-semibold">Видеоуроки</h3>
            <p className="text-muted-foreground">
              Обучающие видео о том, как использовать различные функции DevTalk.
            </p>
            <Button variant="outline" className="w-full">Смотреть видеоуроки</Button>
          </div>
          
          <div className="border rounded-lg p-6 text-center space-y-4 bg-muted/20">
            <div className="mx-auto w-12 h-12 flex items-center justify-center rounded-full bg-primary/10">
              <MessageCircle className="text-primary" size={24} />
            </div>
            <h3 className="text-xl font-semibold">Обратная связь</h3>
            <p className="text-muted-foreground">
              Не нашли ответ на свой вопрос? Свяжитесь с нашей службой поддержки.
            </p>
            <Button variant="outline" className="w-full">Связаться с поддержкой</Button>
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-6">Часто задаваемые вопросы</h2>
        <div className="space-y-4 mb-12">
          {faqs.map(faq => (
            <div key={faq.id} className="border rounded-lg overflow-hidden">
              <details className="group">
                <summary className="flex justify-between items-center p-6 cursor-pointer">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <HelpCircle className="text-primary" size={20} />
                    {faq.question}
                  </h3>
                  <ChevronDown className="transform group-open:rotate-180 transition-transform" />
                </summary>
                <div className="p-6 pt-0 border-t">
                  <p className="text-muted-foreground">{faq.answer}</p>
                </div>
              </details>
            </div>
          ))}
        </div>

        <div className="bg-muted/30 rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Не нашли ответ на свой вопрос?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Если вы не нашли ответ на свой вопрос, наша команда поддержки готова помочь вам.
            Свяжитесь с нами, и мы ответим вам в кратчайшие сроки.
          </p>
          <Button size="lg">Связаться с поддержкой</Button>
        </div>
      </div>
    </div>
  );
};

export default Help;
