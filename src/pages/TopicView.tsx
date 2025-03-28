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
  Send, ThumbsUp, Loader2, Crown, Star, Diamond
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
  profiles?: {
    username: string;
    avatar_url: string | null;
    subscription_type?: string | null;
  };
}

interface CommentData {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  likes: number;
  profiles?: {
    username: string;
    avatar_url: string | null;
    subscription_type?: string | null;
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
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>({});
  const [viewIncrementDone, setViewIncrementDone] = useState(false);
  
  useEffect(() => {
    if (user && topic) {
      const checkTopicLike = async () => {
        const { data } = await supabase
          .from('topic_likes')
          .select('*')
          .eq('topic_id', id)
          .eq('user_id', user.id)
          .single();
          
        setIsLiked(!!data);
      };
      
      checkTopicLike();
    }
  }, [user, topic, id]);
  
  useEffect(() => {
    if (user && comments.length > 0) {
      const checkCommentLikes = async () => {
        const { data } = await supabase
          .from('comment_likes')
          .select('comment_id')
          .eq('user_id', user.id);
          
        if (data) {
          const likedCommentsMap: Record<string, boolean> = {};
          data.forEach(like => {
            likedCommentsMap[like.comment_id] = true;
          });
          setLikedComments(likedCommentsMap);
        }
      };
      
      checkCommentLikes();
    }
  }, [user, comments]);
  
  useEffect(() => {
    const fetchTopic = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        
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
            profiles:profiles!topics_user_id_fkey(username, avatar_url, subscription_type)
          `)
          .eq("id", id)
          .single();
        
        if (topicError) {
          console.error("Ошибка при загрузке темы:", topicError);
          toast({
            title: "Ошибка",
            description: "Не удалось загрузить тему. Пожалуйста, попробуйте позже.",
            variant: "destructive",
          });
          navigate("/forum");
          return;
        }
        
        if (!viewIncrementDone && topicData) {
          await supabase
            .from("topics")
            .update({ views: (topicData.views || 0) + 1 })
            .eq("id", id);
          
          setViewIncrementDone(true);
        }
        
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select(`
            id,
            content,
            user_id,
            created_at,
            likes,
            profiles:profiles!comments_user_id_fkey(username, avatar_url, subscription_type)
          `)
          .eq("topic_id", id)
          .order("created_at", { ascending: true });
          
        if (commentsError) {
          console.error("Ошибка при загрузке комментариев:", commentsError);
        }
        
        console.log("Topic data:", topicData);
        console.log("Comments data:", commentsData);
        
        setTopic(topicData as TopicData);
        setLikesCount(topicData.likes || 0);
        setComments(commentsData as CommentData[] || []);
      } catch (error) {
        console.error("Ошибка при загрузке данных:", error);
        toast({
          title: "Ошибка",
          description: "Произошла ошибка при загрузке данных.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopic();
    
    const commentsSubscription = supabase
      .channel('comments_changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'comments',
        filter: `topic_id=eq.${id}`
      }, (payload) => {
        if (payload.eventType === 'INSERT') {
          const fetchCommentWithProfile = async () => {
            const { data: commentWithProfile } = await supabase
              .from("comments")
              .select(`
                id,
                content,
                user_id,
                created_at,
                likes,
                profiles:profiles!comments_user_id_fkey(username, avatar_url, subscription_type)
              `)
              .eq("id", payload.new.id)
              .single();
              
            if (commentWithProfile) {
              setComments(prev => [...prev, commentWithProfile as CommentData]);
            }
          };
          
          fetchCommentWithProfile();
        } else if (payload.eventType === 'UPDATE') {
          setComments(prev => 
            prev.map(comment => 
              comment.id === payload.new.id 
                ? { ...comment, likes: payload.new.likes } 
                : comment
            )
          );
        }
      })
      .subscribe();
    
    const topicSubscription = supabase
      .channel('topic_changes')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'topics',
        filter: `id=eq.${id}`
      }, (payload) => {
        if (payload.new && payload.new.likes !== undefined) {
          setLikesCount(payload.new.likes);
        }
      })
      .subscribe();
    
    return () => {
      commentsSubscription.unsubscribe();
      topicSubscription.unsubscribe();
    };
  }, [id, navigate, viewIncrementDone, toast]);

  const getSubscriptionBadge = (type?: string | null) => {
    if (!type || type === 'free') return null;
    
    switch(type) {
      case 'premium':
        return (
          <Badge className="ml-2 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300">
            <Crown className="h-3 w-3 mr-1" /> Premium
          </Badge>
        );
      case 'business':
        return (
          <Badge className="ml-2 bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-300">
            <Star className="h-3 w-3 mr-1" /> Бизнес
          </Badge>
        );
      case 'sponsor':
        return (
          <Badge className="ml-2 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">
            <Diamond className="h-3 w-3 mr-1" /> Спонсор
          </Badge>
        );
      default:
        return null;
    }
  };

  const getAvatarStyles = (subscriptionType?: string | null) => {
    if (!subscriptionType || subscriptionType === 'free') return '';
    
    switch(subscriptionType) {
      case 'premium':
        return 'ring-2 ring-amber-300 ring-offset-1';
      case 'business':
        return 'ring-2 ring-purple-400 ring-offset-1';
      case 'sponsor':
        return 'ring-2 ring-blue-400 ring-offset-1';
      default:
        return '';
    }
  };

  const getAvatarFallbackStyles = (subscriptionType?: string | null) => {
    if (!subscriptionType || subscriptionType === 'free') return 'bg-muted';
    
    switch(subscriptionType) {
      case 'premium':
        return 'bg-gradient-to-r from-amber-200 to-amber-400 text-amber-900';
      case 'business':
        return 'bg-gradient-to-r from-purple-200 to-purple-400 text-purple-900';
      case 'sponsor':
        return 'bg-gradient-to-r from-blue-200 to-blue-400 text-blue-900';
      default:
        return 'bg-muted';
    }
  };

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

  const handleLikeTopic = async () => {
    if (!user) {
      toast({
        title: "Необходима авторизация",
        description: "Войдите в систему, чтобы оценивать темы.",
        variant: "destructive",
      });
      return;
    }
    
    if (isLiked) {
      toast({
        title: "Вы уже оценили эту тему",
        description: "Вы можете оценить тему только один раз.",
      });
      return;
    }
    
    try {
      const newLikesCount = likesCount + 1;
      
      const { error: updateError } = await supabase
        .from("topics")
        .update({ likes: newLikesCount })
        .eq("id", id);
        
      if (updateError) {
        console.error("Ошибка при лайке темы:", updateError);
        return;
      }
      
      const { error: insertError } = await supabase
        .from("topic_likes")
        .insert({
          topic_id: id,
          user_id: user.id
        });
        
      if (insertError) {
        console.error("Ошибка при записи лайка:", insertError);
        return;
      }
      
      setIsLiked(true);
      setLikesCount(newLikesCount);
      
      toast({
        title: "Тема понравилась",
        description: "Вы отметили эту тему как понравившуюся.",
      });
    } catch (error) {
      console.error("Ошибка при лайке темы:", error);
    }
  };

  const handleLikeComment = async (commentId: string, currentLikes: number) => {
    if (!user) {
      toast({
        title: "Необходима авторизация",
        description: "Войдите в систему, чтобы оценивать комментарии.",
        variant: "destructive",
      });
      return;
    }
    
    if (likedComments[commentId]) {
      toast({
        title: "Вы уже оценили этот комментарий",
        description: "Вы можете оценить комментарий только один раз.",
      });
      return;
    }
    
    try {
      const { error: updateError } = await supabase
        .from("comments")
        .update({ likes: currentLikes + 1 })
        .eq("id", commentId);
        
      if (updateError) {
        console.error("Ошибка при лайке комментария:", updateError);
        return;
      }
      
      const { error: insertError } = await supabase
        .from("comment_likes")
        .insert({
          comment_id: commentId,
          user_id: user.id
        });
        
      if (insertError) {
        console.error("Ошибка при записи лайка:", insertError);
        return;
      }
      
      setLikedComments(prev => ({
        ...prev,
        [commentId]: true
      }));
      
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

  const handleSaveTopic = () => {
    toast({
      title: "Тема сохранена",
      description: "Тема добавлена в ваши закладки.",
    });
  };

  const handleShareTopic = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Ссылка скопирована",
      description: "Ссылка на тему скопирована в буфер обмена.",
    });
  };

  const navigateToUserProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
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

  const topicProfile = topic.profiles || null;
  const isPremiumUser = topicProfile?.subscription_type && 
    ["premium", "business", "sponsor"].includes(topicProfile.subscription_type);

  return (
    <div className="animate-fade-in py-8 md:py-12">
      <div className="container px-4 mx-auto">
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

        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4">{topic.title}</h1>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="mb-4">
              {topic.category === "frontend" 
                ? "Frontend" 
                : topic.category === "backend" 
                  ? "Backend" 
                  : "Fullstack"}
            </Badge>
            {topicProfile && getSubscriptionBadge(topicProfile.subscription_type)}
          </div>
        </div>

        <Card className={`mb-8 p-6 ${isPremiumUser ? 'border-amber-300 dark:border-amber-700' : ''}`}>
          <div className="flex items-start gap-4">
            <div 
              onClick={() => navigateToUserProfile(topic.user_id)} 
              className="cursor-pointer"
              title="Перейти к профилю пользователя"
            >
              <Avatar className={`h-10 w-10 ${getAvatarStyles(topicProfile?.subscription_type)}`}>
                <AvatarImage src={topicProfile?.avatar_url || ""} alt={topicProfile?.username || "User"} />
                <AvatarFallback className={getAvatarFallbackStyles(topicProfile?.subscription_type)}>
                  {(topicProfile?.username?.[0] || "U").toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <div 
                    className="font-medium flex items-center cursor-pointer hover:underline" 
                    onClick={() => navigateToUserProfile(topic.user_id)}
                    title="Перейти к профилю пользователя"
                  >
                    {topicProfile?.username || "Пользователь"}
                    {isPremiumUser && (
                      <span className="ml-2">
                        {topicProfile?.subscription_type === 'premium' && <Crown className="h-4 w-4 text-amber-400" />}
                        {topicProfile?.subscription_type === 'business' && <Star className="h-4 w-4 text-purple-400" />}
                        {topicProfile?.subscription_type === 'sponsor' && <Diamond className="h-4 w-4 text-blue-400" />}
                      </span>
                    )}
                  </div>
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
              
              <div className={`mt-4 prose prose-sm dark:prose-invert max-w-none ${isPremiumUser ? 'prose-headings:text-amber-700 dark:prose-headings:text-amber-300' : ''}`}>
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

        <div className="mb-8">
          <h2 className="text-xl font-medium mb-4">
            Комментарии <span className="text-muted-foreground">({comments.length})</span>
          </h2>
          
          {comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => {
                const commentProfile = comment.profiles || null;
                const isCommentPremium = commentProfile?.subscription_type && 
                  ["premium", "business", "sponsor"].includes(commentProfile.subscription_type);
                  
                return (
                  <Card key={comment.id} className={`p-6 ${isCommentPremium ? 'border-amber-200 dark:border-amber-800' : ''}`}>
                    <div className="flex items-start gap-4">
                      <div 
                        onClick={() => navigateToUserProfile(comment.user_id)}
                        className="cursor-pointer"
                        title="Перейти к профилю пользователя"
                      >
                        <Avatar className={`h-8 w-8 ${getAvatarStyles(commentProfile?.subscription_type)}`}>
                          <AvatarImage src={commentProfile?.avatar_url || ""} alt={commentProfile?.username || "User"} />
                          <AvatarFallback className={getAvatarFallbackStyles(commentProfile?.subscription_type)}>
                            {(commentProfile?.username?.[0] || "U").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <div 
                              className="font-medium cursor-pointer hover:underline"
                              onClick={() => navigateToUserProfile(comment.user_id)}
                              title="Перейти к профилю пользователя"
                            >
                              {commentProfile?.username || "Пользователь"}
                            </div>
                            {commentProfile && getSubscriptionBadge(commentProfile.subscription_type)}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(comment.created_at)}
                          </div>
                        </div>
                        
                        <div className={`mt-2 ${isCommentPremium ? 'text-gray-800 dark:text-gray-100' : ''}`}>
                          {comment.content}
                        </div>
                        
                        <div className="mt-4 flex items-center gap-4">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`gap-2 ${likedComments[comment.id] ? 'text-primary' : ''}`}
                            onClick={() => handleLikeComment(comment.id, comment.likes)}
                          >
                            <ThumbsUp size={14} className={likedComments[comment.id] ? "fill-primary" : ""} />
                            <span>{comment.likes || 0}</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 bg-secondary/30 rounded-lg">
              <MessageCircle className="mx-auto mb-2 text-muted-foreground" size={24} />
              <p className="text-muted-foreground">Ещё нет комментариев в этой теме. Будьте первым!</p>
            </div>
          )}
        </div>

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
