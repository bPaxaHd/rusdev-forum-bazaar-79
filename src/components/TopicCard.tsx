
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Heart, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Link } from "react-router-dom";

interface TopicCardProps {
  id: number;
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
  category
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
    <Link to={`/topic/${category}/${id}`}>
      <Card className="card-glass p-4 md:p-6 hover:translate-y-[-2px] transition-all duration-300">
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
              <Avatar className="h-7 w-7">
                <AvatarImage src={authorAvatar} alt={author} />
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                  {fallbackInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{author}</span>
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
