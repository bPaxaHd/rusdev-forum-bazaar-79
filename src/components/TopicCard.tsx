
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Heart, Eye, Crown, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

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
  isPremium
}) => {
  const fallbackInitial = author.charAt(0).toUpperCase();
  
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

  return (
    <Link to={`/topic/${id}`}>
      <Card className={`card-glass p-4 md:p-6 hover:translate-y-[-2px] transition-all duration-300 ${isPremium ? 'border-amber-300 shadow-md shadow-amber-100 dark:shadow-amber-900/20' : ''}`}>
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="flex flex-col">
              <div className="mb-1 flex items-center gap-2">
                <Badge className={`${categoryColors[category]} font-medium`}>
                  {category === "frontend" ? "Frontend" : category === "backend" ? "Backend" : "Fullstack"}
                </Badge>
                {isPremium && (
                  <Badge className="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300 font-medium">
                    <Crown className="h-3 w-3 mr-1" /> Premium
                  </Badge>
                )}
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
              <Avatar className={`h-7 w-7 ${isPremium ? 'ring-2 ring-amber-300 ring-offset-1' : ''}`}>
                <AvatarImage src={authorAvatar} alt={author} />
                <AvatarFallback className={`${isPremium ? 'bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900' : 'bg-primary/10 text-primary'} text-xs`}>
                  {fallbackInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium flex items-center gap-1">
                  {author}
                  {isPremium && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                </span>
                <span className="text-xs text-muted-foreground">{authorRole}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-muted-foreground">
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
