
import React from "react";
import TopicCard from "./TopicCard";
import CreateTopicDialog from "./CreateTopicDialog";

const recentTopics = [
  {
    id: 1,
    title: "Стоит ли учить WebAssembly в 2023 году для frontend разработчика?",
    preview: "Начинаю погружаться глубже во frontend и задумываюсь об изучении WebAssembly. Будет ли это полезным навыком или лучше сосредоточиться на чем-то другом?",
    author: "Марк С.",
    authorRole: "Junior Frontend разработчик",
    authorAvatar: "",
    repliesCount: 8,
    likesCount: 12,
    viewsCount: 245,
    tags: ["WebAssembly", "Frontend", "JavaScript", "Карьера"],
    lastActivity: "2023-09-18T14:23:00",
    category: "frontend" as const
  },
  {
    id: 2,
    title: "Практики оптимизации MongoDB для высоконагруженных проектов",
    preview: "Столкнулся с проблемой производительности на проекте с MongoDB при большом объеме данных. Какие есть проверенные стратегии оптимизации?",
    author: "Алексей В.",
    authorRole: "Senior Backend разработчик",
    authorAvatar: "",
    repliesCount: 15,
    likesCount: 23,
    viewsCount: 340,
    tags: ["MongoDB", "NoSQL", "Оптимизация", "Backend"],
    lastActivity: "2023-09-15T10:45:00",
    category: "backend" as const
  },
  {
    id: 3,
    title: "Архитектура микрофронтендов: опыт и подводные камни",
    preview: "Наша команда планирует миграцию от монолитного фронтенда к микрофронтендам. Интересен опыт тех, кто уже прошел через это. Какие инструменты использовали? С какими проблемами столкнулись?",
    author: "Игорь М.",
    authorRole: "Lead Fullstack разработчик",
    authorAvatar: "",
    repliesCount: 19,
    likesCount: 31,
    viewsCount: 420,
    tags: ["Микрофронтенды", "Архитектура", "Fullstack", "Масштабирование"],
    lastActivity: "2023-09-10T16:30:00",
    category: "fullstack" as const
  }
];

const RecentTopics = () => {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium">Недавние темы</h3>
        <CreateTopicDialog />
      </div>
      <div className="space-y-4">
        {recentTopics.map((topic) => (
          <TopicCard key={topic.id} {...topic} />
        ))}
      </div>
    </div>
  );
};

export default RecentTopics;
