
import React, { useState } from "react";
import { useParams, NavLink } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Heart, MessageCircle, Share, BookmarkPlus, ChevronLeft, Send, ThumbsUp } from "lucide-react";

// Пример данных для демонстрации
const topicData = {
  frontend: {
    id: 1,
    title: "Стоит ли учить WebAssembly в 2023 году для frontend разработчика?",
    content: `
      <p>Привет, РусДев сообщество!</p>
      
      <p>Начинаю погружаться глубже во frontend и задумываюсь об изучении WebAssembly. Будет ли это полезным навыком или лучше сосредоточиться на чем-то другом?</p>
      
      <p>Сейчас я владею React, TypeScript и стандартным набором фронтенд-инструментов. Но часто слышу, что WebAssembly — это будущее веба и может дать серьезное преимущество перед другими разработчиками.</p>
      
      <p>Кто-нибудь использует WebAssembly в реальных проектах? Какие есть примеры практического применения? Стоит ли тратить время на его изучение сейчас или это пока слишком экзотично для большинства проектов?</p>
      
      <p>Заранее благодарю за ответы!</p>
    `,
    author: "Марк С.",
    authorRole: "Junior Frontend разработчик",
    authorAvatar: "",
    date: "2023-09-18T14:23:00",
    tags: ["WebAssembly", "Frontend", "JavaScript", "Карьера"],
    category: "frontend",
    replies: [
      {
        id: 1,
        author: "Александр К.",
        authorRole: "Senior Frontend Developer",
        authorAvatar: "",
        content: "По моему опыту, WebAssembly действительно мощная технология, но не каждому проекту она нужна. Я использую её для задач с интенсивными вычислениями, обработки изображений и сложных алгоритмов. Если ваш проект включает что-то подобное — определенно стоит изучить. Для обычных CRUD-приложений пока не так востребовано.",
        date: "2023-09-18T16:05:00",
        likes: 12
      },
      {
        id: 2,
        author: "Ирина В.",
        authorRole: "Frontend Developer",
        authorAvatar: "",
        content: "Начала изучать WebAssembly полгода назад, пока в личных проектах его применяю. На работе еще не пригодилось, но технология точно перспективная. Моя рекомендация — посмотрите основы и оцените, насколько это соответствует вашим текущим задачам. В любом случае, знание не будет лишним.",
        date: "2023-09-19T10:15:00",
        likes: 8
      }
    ],
    likesCount: 24,
    viewsCount: 326
  },
  
  backend: {
    id: 2,
    title: "Практики оптимизации MongoDB для высоконагруженных проектов",
    content: `
      <p>Добрый день!</p>
      
      <p>Столкнулся с проблемой производительности на проекте с MongoDB при большом объеме данных. Сейчас у нас около 5 млн документов в основной коллекции и количество быстро растет.</p>
      
      <p>Какие есть проверенные стратегии оптимизации для такого случая? В частности, интересуют:</p>
      
      <ul>
        <li>Оптимальные индексы для сложных запросов</li>
        <li>Стратегии шардинга данных</li>
        <li>Кэширование на уровне приложения vs. кэширование MongoDB</li>
        <li>Настройка WiredTiger для высоконагруженных сценариев</li>
      </ul>
      
      <p>Буду благодарен за любой практический опыт!</p>
    `,
    author: "Алексей В.",
    authorRole: "Senior Backend разработчик",
    authorAvatar: "",
    date: "2023-09-15T10:45:00",
    tags: ["MongoDB", "NoSQL", "Оптимизация", "Backend"],
    category: "backend",
    replies: [
      {
        id: 1,
        author: "Михаил Д.",
        authorRole: "Database Engineer",
        authorAvatar: "",
        content: "Для MongoDB с таким объемом данных я бы рекомендовал: 1) Обязательно использовать составные индексы для ваших запросов, 2) Настроить шардинг по ключу, который обеспечит равномерное распределение нагрузки, 3) Использовать aggregation pipeline вместо find+iterate где возможно, 4) Настроить ReadPreference в зависимости от сценария использования. Если поделитесь типичными запросами, могу дать более конкретные советы.",
        date: "2023-09-15T11:30:00",
        likes: 15
      }
    ],
    likesCount: 30,
    viewsCount: 405
  },
  
  fullstack: {
    id: 3,
    title: "Архитектура микрофронтендов: опыт и подводные камни",
    content: `
      <p>Всем привет!</p>
      
      <p>Наша команда планирует миграцию от монолитного фронтенда к микрофронтендам. Интересен опыт тех, кто уже прошел через это.</p>
      
      <p>Рассматриваем следующие варианты:</p>
      <ul>
        <li>Single-SPA</li>
        <li>Module Federation (Webpack 5)</li>
        <li>Nx монорепозиторий</li>
      </ul>
      
      <p>С какими проблемами вы столкнулись при внедрении? Как решали вопросы:</p>
      <ul>
        <li>Общего состояния между микрофронтендами</li>
        <li>Единого дизайн-система</li>
        <li>Масштабирования команд (Conway's law)</li>
        <li>CI/CD для отдельных частей</li>
      </ul>
      
      <p>Буду рад любому опыту!</p>
    `,
    author: "Игорь М.",
    authorRole: "Lead Fullstack разработчик",
    authorAvatar: "",
    date: "2023-09-10T16:30:00",
    tags: ["Микрофронтенды", "Архитектура", "Fullstack", "Масштабирование"],
    category: "fullstack",
    replies: [
      {
        id: 1,
        author: "Светлана Р.",
        authorRole: "Senior Frontend Developer",
        authorAvatar: "",
        content: "У нас успешный опыт с Module Federation на большом проекте. Ключевые моменты: 1) Четкие границы между микрофронтендами, 2) Общая библиотека UI компонентов, 3) Федерированное хранилище состояния. Главные сложности были с координацией работы разных команд и обеспечением согласованности UX. Предлагаю сначала выделить небольшой экспериментальный микрофронтенд, не трогая основное приложение, чтобы проверить подход.",
        date: "2023-09-10T17:45:00",
        likes: 18
      },
      {
        id: 2,
        author: "Дмитрий К.",
        authorRole: "DevOps Engineer",
        authorAvatar: "",
        content: "По поводу CI/CD: мы настроили отдельные пайплайны для каждого микрофронтенда с возможностью их независимого деплоя. Используем GitLab CI с динамическими окружениями для каждой фичи. Рекомендую также настроить визуальное тестирование, чтобы отлавливать проблемы совместимости разных версий микрофронтендов.",
        date: "2023-09-11T09:20:00",
        likes: 10
      }
    ],
    likesCount: 42,
    viewsCount: 510
  }
};

const TopicView = () => {
  const { category, id } = useParams();
  const { toast } = useToast();
  const [newReply, setNewReply] = useState("");
  const [repliesData, setRepliesData] = useState(
    category && topicData[category as keyof typeof topicData]?.replies || []
  );
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(
    category && topicData[category as keyof typeof topicData]?.likesCount || 0
  );
  
  // Получаем данные выбранной темы
  const topic = category 
    ? topicData[category as keyof typeof topicData] 
    : null;

  if (!topic) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Тема не найдена</h2>
          <p className="text-muted-foreground mb-4">Запрашиваемая тема не существует или была удалена.</p>
          <NavLink to="/forum">
            <Button>Вернуться к списку тем</Button>
          </NavLink>
        </div>
      </div>
    );
  }

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('ru-RU', options);
  };

  // Обработчик отправки ответа
  const handleSubmitReply = () => {
    if (!newReply.trim()) return;
    
    // Создаем новый ответ
    const newReplyObj = {
      id: repliesData.length + 1,
      author: "Текущий пользователь",
      authorRole: "Участник форума",
      authorAvatar: "",
      content: newReply,
      date: new Date().toISOString(),
      likes: 0
    };
    
    // Добавляем новый ответ к существующим
    setRepliesData([...repliesData, newReplyObj]);
    setNewReply("");
    
    toast({
      title: "Ответ отправлен",
      description: "Ваш ответ успешно добавлен в обсуждение.",
    });
  };

  // Обработчик лайка темы
  const handleLikeTopic = () => {
    setIsLiked(!isLiked);
    setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    
    toast({
      title: isLiked ? "Лайк отменен" : "Тема понравилась",
      description: isLiked 
        ? "Вы отменили свой лайк этой темы." 
        : "Вы отметили эту тему как понравившуюся.",
    });
  };

  // Обработчик лайка ответа
  const handleLikeReply = (replyId: number) => {
    setRepliesData(
      repliesData.map(reply => 
        reply.id === replyId 
          ? { ...reply, likes: reply.likes + 1 } 
          : reply
      )
    );
    
    toast({
      description: "Вы отметили этот ответ как полезный.",
    });
  };

  // Обработчик сохранения темы
  const handleSaveTopic = () => {
    toast({
      title: "Тема сохранена",
      description: "Тема добавлена в ваши закладки.",
    });
  };

  // Обработчик поделиться темой
  const handleShareTopic = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Ссылка скопирована",
      description: "Ссылка на тему скопирована в буфер обмена.",
    });
  };

  return (
    <div className="animate-fade-in py-8 md:py-12">
      <div className="container px-4 mx-auto">
        {/* Хлебные крошки */}
        <div className="mb-6">
          <div className="flex items-center text-sm text-muted-foreground">
            <NavLink to="/forum" className="hover:text-primary flex items-center gap-1">
              <ChevronLeft size={14} />
              Назад к форуму
            </NavLink>
            <span className="mx-2">/</span>
            <NavLink to={`/${topic.category}`} className="hover:text-primary">
              {topic.category === "frontend" 
                ? "Frontend" 
                : topic.category === "backend" 
                  ? "Backend" 
                  : "Fullstack"}
            </NavLink>
          </div>
        </div>

        {/* Заголовок темы */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{topic.title}</h1>
          <div className="flex flex-wrap gap-2 mb-4">
            {topic.tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Основной контент темы */}
        <Card className="mb-8 p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={topic.authorAvatar} />
              <AvatarFallback>{topic.author.charAt(0)}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-medium">{topic.author}</div>
                  <div className="text-sm text-muted-foreground">{topic.authorRole}</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(topic.date)}
                </div>
              </div>
              
              <div className="mt-4 prose prose-sm dark:prose-invert max-w-none" 
                dangerouslySetInnerHTML={{ __html: topic.content }} />
              
              <div className="mt-6 flex items-center gap-4 pt-2 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={`gap-2 ${isLiked ? 'text-primary' : ''}`}
                  onClick={handleLikeTopic}
                >
                  <Heart size={16} className={isLiked ? "fill-primary" : ""} />
                  <span>{likesCount}</span>
                </Button>
                
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageCircle size={16} />
                  <span>{repliesData.length}</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2 ml-auto"
                  onClick={handleSaveTopic}
                >
                  <BookmarkPlus size={16} />
                  <span className="sr-only md:not-sr-only">Сохранить</span>
                </Button>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="gap-2"
                  onClick={handleShareTopic}
                >
                  <Share size={16} />
                  <span className="sr-only md:not-sr-only">Поделиться</span>
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Ответы */}
        <div className="mb-8">
          <h2 className="text-xl font-medium mb-4">
            Ответы <span className="text-muted-foreground">({repliesData.length})</span>
          </h2>
          
          {repliesData.length > 0 ? (
            <div className="space-y-4">
              {repliesData.map((reply) => (
                <Card key={reply.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={reply.authorAvatar} />
                      <AvatarFallback>{reply.author.charAt(0)}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <div className="font-medium">{reply.author}</div>
                          <div className="text-xs text-muted-foreground">{reply.authorRole}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(reply.date)}
                        </div>
                      </div>
                      
                      <div className="mt-2">{reply.content}</div>
                      
                      <div className="mt-4 flex items-center gap-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => handleLikeReply(reply.id)}
                        >
                          <ThumbsUp size={14} />
                          <span>{reply.likes}</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-secondary/30 rounded-lg">
              <MessageCircle className="mx-auto mb-2 text-muted-foreground" size={24} />
              <p className="text-muted-foreground">Ещё нет ответов в этой теме. Будьте первым!</p>
            </div>
          )}
        </div>

        {/* Форма ответа */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Ваш ответ</h3>
          <Textarea 
            className="min-h-[120px] mb-4" 
            placeholder="Напишите ваш ответ здесь..."
            value={newReply}
            onChange={(e) => setNewReply(e.target.value)}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitReply}
              disabled={!newReply.trim()}
              className="gap-2"
            >
              Отправить
              <Send size={16} />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TopicView;
