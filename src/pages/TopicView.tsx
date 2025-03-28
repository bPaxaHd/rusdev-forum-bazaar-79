
import React, { useState, useEffect } from "react";
import { useParams, NavLink, useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  Heart, MessageCircle, Share, BookmarkPlus, ChevronLeft, 
  Send, ThumbsUp, Loader2 
} from "lucide-react";

interface TopicData {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category: string;
  created_at: string;
  updated_at: string;
  likes: number;
  views: number;
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}

interface CommentData {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  likes: number;
  profile?: {
    username: string;
    avatar_url: string | null;
  };
}

const TopicView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [topic, setTopic] = useState<TopicData | null>(null);
  const [comments, setComments] = useState<CommentData[]>([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  
  useEffect(() => {
    const fetchTopic = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
        // Увеличиваем счетчик просмотров
        await supabase
          .from("topics")
          .update({ views: topic?.views ? topic.views + 1 : 1 })
          .eq("id", id);
          
        // Получаем данные темы
        const { data: topicData, error: topicError } = await supabase
          .from("topics")
          .select(`
            id, 
            title, 
            content, 
            user_id, 
            category, 
            created_at, 
            updated_at, 
            likes, 
            views,
            profiles:user_id(username, avatar_url)
          `)
          .eq("id", id)
          .single();
        
        if (topicError) {
          console.error("Ошибка при загрузке темы:", topicError);
          navigate("/forum");
          return;
        }
        
        // Получаем комментарии к теме
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select(`
            id,
            content,
            user_id,
            created_at,
            likes,
            profiles:user_id(username, avatar_url)
          `)
          .eq("topic_id", id)
          .order("created_at", { ascending: true });
          
        if (commentsError) {
          console.error("Ошибка при загрузке комментариев:", commentsError);
        }
        
        setTopic(topicData);
        setLikesCount(topicData.likes || 0);
        setComments(commentsData || []);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopic();
    
    // Подписываемся на изменения в комментариях
    const commentsSubscription = supabase
      .channel('comments_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'comments',
        filter: `topic_id=eq.${id}`
      }, (payload) => {
        // Обновляем список комментариев при изменениях
        fetchTopic();
      })
      .subscribe();
    
    return () => {
      commentsSubscription.unsubscribe();
    };
  }, [id, navigate]);

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

  // Обработчик отправки комментария
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !user) return;
    
    try {
      setCommentLoading(true);
      
      const { error } = await supabase
        .from("comments")
        .insert({
          topic_id: id,
          user_id: user.id,
          content: newComment
        });
        
      if (error) {
        console.error("Ошибка при отправке комментария:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось отправить комментарий",
          variant: "destructive",
        });
        return;
      }
      
      setNewComment("");
      toast({
        title: "Комментарий отправлен",
        description: "Ваш комментарий успешно добавлен в обсуждение.",
      });
    } catch (error) {
      console.error("Ошибка при отправке комментария:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  // Обработчик лайка темы
  const handleLikeTopic = async () => {
    if (!user) {
      toast({
        title: "Необходима авторизация",
        description: "Войдите в систему, чтобы оценивать темы.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newLikesCount = isLiked ? likesCount - 1 : likesCount + 1;
      
      const { error } = await supabase
        .from("topics")
        .update({ likes: newLikesCount })
        .eq("id", id);
        
      if (error) {
        console.error("Ошибка при лайке темы:", error);
        return;
      }
      
      setIsLiked(!isLiked);
      setLikesCount(newLikesCount);
      
      toast({
        title: isLiked ? "Лайк отменен" : "Тема понравилась",
        description: isLiked 
          ? "Вы отменили свой лайк этой темы." 
          : "Вы отметили эту тему как понравившуюся.",
      });
    } catch (error) {
      console.error("Ошибка при лайке темы:", error);
    }
  };

  // Обработчик лайка комментария
  const handleLikeComment = async (commentId: string, currentLikes: number) => {
    if (!user) {
      toast({
        title: "Необходима авторизация",
        description: "Войдите в систему, чтобы оценивать комментарии.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from("comments")
        .update({ likes: currentLikes + 1 })
        .eq("id", commentId);
        
      if (error) {
        console.error("Ошибка при лайке комментария:", error);
        return;
      }
      
      // Обновляем локальный список комментариев
      setComments(
        comments.map(comment => 
          comment.id === commentId 
            ? { ...comment, likes: comment.likes + 1 } 
            : comment
        )
      );
      
      toast({
        description: "Вы отметили этот комментарий как полезный.",
      });
    } catch (error) {
      console.error("Ошибка при лайке комментария:", error);
    }
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

  if (loading) {
    return (
      <div className="container max-w-4xl mx-auto py-20 flex justify-center items-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Загрузка темы...</p>
        </div>
      </div>
    );
  }

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
          <Badge variant="secondary" className="mb-4">
            {topic.category === "frontend" 
              ? "Frontend" 
              : topic.category === "backend" 
                ? "Backend" 
                : "Fullstack"}
          </Badge>
        </div>

        {/* Основной контент темы */}
        <Card className="mb-8 p-6">
          <div className="flex items-start gap-4">
            <Avatar className="h-10 w-10">
              <AvatarImage src={topic.profile?.avatar_url || ""} />
              <AvatarFallback>{topic.profile?.username?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div className="font-medium">{topic.profile?.username || "Пользователь"}</div>
                  <div className="text-sm text-muted-foreground">
                    {topic.category === "frontend" 
                      ? "Frontend разработчик" 
                      : topic.category === "backend" 
                        ? "Backend разработчик" 
                        : "Fullstack разработчик"}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDate(topic.created_at)}
                </div>
              </div>
              
              <div className="mt-4 prose prose-sm dark:prose-invert max-w-none">
                {topic.content}
              </div>
              
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
                  <span>{comments.length}</span>
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
            Комментарии <span className="text-muted-foreground">({comments.length})</span>
          </h2>
          
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <Card key={comment.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.profile?.avatar_url || ""} />
                      <AvatarFallback>{comment.profile?.username?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <div className="font-medium">{comment.profile?.username || "Пользователь"}</div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {formatDate(comment.created_at)}
                        </div>
                      </div>
                      
                      <div className="mt-2">{comment.content}</div>
                      
                      <div className="mt-4 flex items-center gap-4">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-2"
                          onClick={() => handleLikeComment(comment.id, comment.likes)}
                        >
                          <ThumbsUp size={14} />
                          <span>{comment.likes || 0}</span>
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
              <p className="text-muted-foreground">Ещё нет комментариев в этой теме. Будьте первым!</p>
            </div>
          )}
        </div>

        {/* Форма ответа */}
        <Card className="p-6">
          <h3 className="text-lg font-medium mb-4">Ваш комментарий</h3>
          {user ? (
            <>
              <Textarea 
                className="min-h-[120px] mb-4" 
                placeholder="Напишите ваш комментарий здесь..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              />
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || commentLoading}
                  className="gap-2"
                >
                  {commentLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Отправка...
                    </>
                  ) : (
                    <>
                      Отправить
                      <Send size={16} />
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <div className="text-center py-4 bg-muted/30 rounded-md">
              <p className="text-muted-foreground mb-2">Войдите в систему, чтобы оставить комментарий</p>
              <NavLink to="/login">
                <Button variant="outline" size="sm">
                  Войти
                </Button>
              </NavLink>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default TopicView;
