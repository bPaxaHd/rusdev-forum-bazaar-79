
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Heart, Eye, Crown, Star, Diamond, Shield, Hammer, Award, Trash } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TopicCardProps {
  id: number | string;
  title: string;
  preview: string;
  author: string;
  authorRole: string;
  authorAvatar?: string;
  repliesCount: number;
  likesCount: number;
  viewsCount: number;
  tags: string[];
  lastActivity: string;
  category: "frontend" | "backend" | "fullstack";
  isPremium?: boolean;
  isCreator?: boolean;
  isModerator?: boolean;
  isAdmin?: boolean;
  sponsorLevel?: 'premium' | 'business' | 'sponsor';
  userId?: string; // ID пользователя-создателя темы
}

const categoryColors = {
  frontend: "bg-blue-100 text-blue-600",
  backend: "bg-green-100 text-green-600",
  fullstack: "bg-purple-100 text-purple-600"
};

const TopicCard: React.FC<TopicCardProps> = ({
  id,
  title,
  preview,
  author,
  authorRole,
  authorAvatar,
  repliesCount,
  likesCount,
  viewsCount,
  tags,
  lastActivity,
  category,
  isPremium,
  isCreator,
  isModerator,
  isAdmin,
  sponsorLevel,
  userId
}) => {
  const fallbackInitial = author.charAt(0).toUpperCase();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Определим стили для разных типов пользователей
  let cardStyles = "card-glass p-4 md:p-6 hover:translate-y-[-2px] transition-all duration-300";
  let avatarStyles = "h-7 w-7";
  let badgeType = null;
  let avatarFallbackStyles = "bg-primary/10 text-primary text-xs";
  
  if (isAdmin) {
    // Стили для админа
    cardStyles += " border-red-400 shadow-md shadow-red-100 dark:shadow-red-900/20";
    avatarStyles += " ring-2 ring-red-400 ring-offset-1";
    avatarFallbackStyles = "bg-gradient-to-r from-red-300 to-red-500 text-white text-xs";
    badgeType = (
      <Badge className="ml-2 bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-300 animate-pulse">
        <Shield className="h-3 w-3 mr-1" /> Админ
      </Badge>
    );
  } else if (isCreator) {
    // Стили для создателя
    cardStyles += " border-purple-400 shadow-md shadow-purple-100 dark:shadow-purple-900/20";
    avatarStyles += " ring-2 ring-purple-400 ring-offset-1";
    avatarFallbackStyles = "bg-gradient-to-r from-purple-300 to-purple-600 text-white text-xs";
    badgeType = (
      <Badge className="ml-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
        <Award className="h-3 w-3 mr-1" /> Создатель
      </Badge>
    );
  } else if (isModerator) {
    // Стили для модератора
    cardStyles += " border-blue-400 shadow-md shadow-blue-100 dark:shadow-blue-900/20";
    avatarStyles += " ring-2 ring-blue-400 ring-offset-1";
    avatarFallbackStyles = "bg-gradient-to-r from-blue-300 to-blue-500 text-white text-xs";
    badgeType = (
      <Badge className="ml-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
        <Hammer className="h-3 w-3 mr-1" /> Модератор
      </Badge>
    );
  } else if (sponsorLevel === 'sponsor') {
    // Стили для спонсора - самые красивые
    cardStyles += " border-amber-300 shadow-md shadow-amber-100 dark:shadow-amber-900/20 border-2";
    avatarStyles += " ring-3 ring-amber-300 ring-offset-2";
    avatarFallbackStyles = "bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900 text-xs";
    badgeType = (
      <Badge className="ml-2 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
        <Diamond className="h-3 w-3 mr-1" /> Спонсор
      </Badge>
    );
  } else if (sponsorLevel === 'business') {
    // Стили для бизнес-подписки
    cardStyles += " border-purple-300/50 shadow-sm";
    avatarStyles += " ring-1 ring-purple-300 ring-offset-1";
    avatarFallbackStyles = "bg-gradient-to-r from-purple-200 to-purple-300 text-purple-900 text-xs";
    badgeType = (
      <Badge className="ml-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
        <Star className="h-3 w-3 mr-1" /> Бизнес
      </Badge>
    );
  } else if (sponsorLevel === 'premium' || isPremium) {
    // Стили для премиум-подписки
    cardStyles += " border-blue-300/50 shadow-sm";
    avatarStyles += " ring-1 ring-blue-300 ring-offset-1";
    avatarFallbackStyles = "bg-gradient-to-r from-blue-200 to-blue-300 text-blue-900 text-xs";
    badgeType = (
      <Badge className="ml-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
        <Crown className="h-3 w-3 mr-1" /> Премиум
      </Badge>
    );
  }

  // Function to format date as "X time ago"
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return `${interval} г. назад`;
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return `${interval} мес. назад`;
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return `${interval} д. назад`;
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return `${interval} ч. назад`;
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return `${interval} мин. назад`;
    }
    
    return `только что`;
  };

  // Проверка, может ли текущий пользователь удалить тему
  const canDeleteTopic = () => {
    if (!user) return false;
    return userId === user.id || isAdmin || isModerator;
  };

  // Обработчик удаления темы
  const handleDeleteTopic = async (e: React.MouseEvent) => {
    e.preventDefault(); // Предотвращаем переход по ссылке
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Необходима авторизация",
        description: "Пожалуйста, войдите в аккаунт для удаления темы",
        variant: "destructive"
      });
      return;
    }
    
    if (!canDeleteTopic()) {
      toast({
        title: "Недостаточно прав",
        description: "У вас нет прав на удаление этой темы",
        variant: "destructive"
      });
      return;
    }
    
    if (!confirm("Вы уверены, что хотите удалить эту тему?")) {
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from("topics")
        .delete()
        .eq("id", id);
        
      if (error) {
        console.error("Ошибка при удалении темы:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось удалить тему",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Тема удалена",
        description: "Тема была успешно удалена",
        variant: "default"
      });
    } catch (error) {
      console.error("Ошибка при удалении темы:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при удалении темы",
        variant: "destructive"
      });
    }
  };

  return (
    <Link to={`/topic/${id}`}>
      <Card className={cardStyles}>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <div className="mb-1 flex items-center gap-2">
                <Badge className={`${categoryColors[category]} font-medium`}>
                  {category === "frontend" ? "Frontend" : category === "backend" ? "Backend" : "Fullstack"}
                </Badge>
                {tags.slice(0, 2).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs font-normal">
                    {tag}
                  </Badge>
                ))}
                {tags.length > 2 && (
                  <span className="text-xs text-muted-foreground">+{tags.length - 2}</span>
                )}
              </div>
              <h3 className="text-lg font-medium leading-tight hover:text-primary transition-colors">
                {title}
              </h3>
            </div>
            <div className="ml-4 text-xs text-muted-foreground whitespace-nowrap">
              {formatTimeAgo(lastActivity)}
            </div>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2">{preview}</p>
          
          <div className="flex justify-between items-center pt-2">
            <div className="flex items-center gap-2">
              <Avatar className={avatarStyles}>
                <AvatarImage src={authorAvatar} alt={author} />
                <AvatarFallback className={avatarFallbackStyles}>
                  {fallbackInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium flex items-center gap-1">
                  {author}
                  {badgeType}
                </span>
                <span className="text-xs text-muted-foreground">{authorRole}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-muted-foreground">
              {canDeleteTopic() && (
                <button 
                  onClick={handleDeleteTopic} 
                  className="text-red-500 hover:text-red-700 transition-colors"
                  aria-label="Удалить тему"
                >
                  <Trash size={15} />
                </button>
              )}
              <div className="flex items-center gap-1">
                <MessageCircle size={15} />
                <span className="text-xs">{repliesCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Heart size={15} />
                <span className="text-xs">{likesCount}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye size={15} />
                <span className="text-xs">{viewsCount}</span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default TopicCard;
