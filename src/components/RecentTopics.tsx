
import React from "react";
import TopicCard from "./TopicCard";

const recentTopics = [
  {
    id: 1,
    title: "React или Vue: что выбрать для нового проекта в 2023?",
    preview: "Планирую новый проект и хочу выбрать фреймворк между React и Vue. Какие плюсы и минусы у каждого в 2023 году?",
    author: "Алексей К.",
    authorRole: "Frontend разработчик",
    authorAvatar: "",
    repliesCount: 24,
    likesCount: 18,
    viewsCount: 356,
    tags: ["React", "Vue", "JavaScript", "Frontend"],
    lastActivity: "2023-08-15T14:23:00",
    category: "frontend" as const
  },
  {
    id: 2,
    title: "Оптимизация SQL запросов в больших проектах на PostgreSQL",
    preview: "Работаю с базой данных, где таблицы содержат миллионы записей. Какие есть практики оптимизации запросов?",
    author: "Михаил В.",
    authorRole: "Backend разработчик",
    authorAvatar: "",
    repliesCount: 13,
    likesCount: 21,
    viewsCount: 274,
    tags: ["SQL", "PostgreSQL", "Оптимизация"],
    lastActivity: "2023-08-12T09:45:00",
    category: "backend" as const
  },
  {
    id: 3,
    title: "Микросервисная архитектура на Go: поделитесь опытом",
    preview: "Собираюсь переписать большой монолит на микросервисы с использованием Go. Ищу советы и подводные камни.",
    author: "Дмитрий С.",
    authorRole: "Fullstack разработчик",
    authorAvatar: "",
    repliesCount: 29,
    likesCount: 32,
    viewsCount: 487,
    tags: ["Go", "Микросервисы", "Архитектура"],
    lastActivity: "2023-08-10T16:15:00",
    category: "fullstack" as const
  }
];

const RecentTopics = () => {
  return (
    <div className="space-y-4">
      {recentTopics.map((topic) => (
        <TopicCard key={topic.id} {...topic} />
      ))}
    </div>
  );
};

export default RecentTopics;
