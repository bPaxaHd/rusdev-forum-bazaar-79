
import React, { useEffect, useState } from "react";
import TopicCard from "./TopicCard";
import CreateTopicDialog from "./CreateTopicDialog";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

interface TopicData {
  id: string; // String to match Supabase UUID format
  title: string;
  content: string;
  user_id: string;
  category: string; // Changed from union type to string
  created_at: string;
  updated_at: string;
  likes: number;
  views: number;
  profile?: {
    username: string;
    avatar_url: string | null;
  };
  comments?: { id: string }[];
  profiles?: {
    username: string;
    avatar_url: string | null;
  };
}

const RecentTopics = () => {
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
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
            profiles:user_id(username, avatar_url),
            comments:comments(id)
          `)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) {
          console.error("Ошибка при загрузке тем:", error);
          setError("Не удалось загрузить темы");
          return;
        }
        
        // Проверяем, что данные не пустые
        if (!data || data.length === 0) {
          setTopics([]);
          return;
        }
        
        // Преобразуем данные в формат, который ожидает TopicCard
        const formattedTopics = data.map(topic => ({
          ...topic,
          profile: {
            username: topic.profiles?.username || "Unknown",
            avatar_url: topic.profiles?.avatar_url
          },
          comments: topic.comments || []
        }));
        
        setTopics(formattedTopics as TopicData[]);
      } catch (error) {
        console.error("Ошибка при загрузке тем:", error);
        setError("Произошла ошибка при загрузке тем");
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить последние темы",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchTopics();
    
    // Подписываемся на изменения в таблице topics
    const subscription = supabase
      .channel('public:topics')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'topics' }, (payload) => {
        fetchTopics();
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  // Функция для преобразования темы в формат для компонента TopicCard
  const mapTopicToCardProps = (topic: TopicData) => {
    const preview = topic.content.length > 150 
      ? topic.content.substring(0, 150) + '...'
      : topic.content;
      
    // Cast category to the specific type for the TopicCard component
    const typedCategory = topic.category as "frontend" | "backend" | "fullstack";
      
    return {
      id: topic.id, // Use the UUID directly instead of converting to number
      title: topic.title,
      preview: preview,
      author: topic.profile?.username || "Неизвестный пользователь",
      authorRole: typedCategory === "frontend" 
        ? "Frontend разработчик" 
        : typedCategory === "backend" 
          ? "Backend разработчик" 
          : "Fullstack разработчик",
      authorAvatar: topic.profile?.avatar_url || "",
      repliesCount: topic.comments?.length || 0,
      likesCount: topic.likes || 0,
      viewsCount: topic.views || 0,
      tags: [typedCategory], // Добавляем базовый тег из категории
      lastActivity: topic.updated_at || topic.created_at,
      category: typedCategory
    };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium">Недавние темы</h3>
        <CreateTopicDialog />
      </div>
      
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((_, index) => (
            <div key={index} className="p-6 rounded-lg border">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-6 w-64 mb-2" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
              <Skeleton className="h-4 w-full mb-6" />
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-20 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-8" />
                  <Skeleton className="h-4 w-8" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground mb-4">{error}</p>
          <CreateTopicDialog />
        </div>
      ) : topics.length > 0 ? (
        <div className="space-y-4">
          {topics.map((topic) => (
            <TopicCard key={topic.id} {...mapTopicToCardProps(topic)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground mb-4">Пока нет тем для отображения</p>
          <CreateTopicDialog />
        </div>
      )}
    </div>
  );
};

export default RecentTopics;
