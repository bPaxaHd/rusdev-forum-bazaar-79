
import React, { useEffect, useState } from "react";
import TopicCard from "./TopicCard";
import CreateTopicDialog from "./CreateTopicDialog";
import PremiumTopicDialog from "./PremiumTopicDialog";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
  is_premium?: boolean;
  profiles?: {
    username: string;
    avatar_url: string | null;
    subscription_type?: string | null;
  };
  user_roles?: { role: string }[] | null; // Updated to be optional and nullable
  comments?: { id: string }[];
}

const RecentTopics = () => {
  const [topics, setTopics] = useState<TopicData[]>([]);
  const [premiumTopics, setPremiumTopics] = useState<TopicData[]>([]);
  const [loading, setLoading] = useState(true);
  const [premiumLoading, setPremiumLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"regular" | "premium">("regular");
  const { toast } = useToast();
  const { user } = useAuth();

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
            is_premium,
            profiles:profiles!topics_user_id_fkey(username, avatar_url, subscription_type),
            user_roles:user_roles(role),
            comments:comments(id)
          `)
          .eq('is_premium', false)
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
        
        console.log("Fetched topics:", data);
        
        // Process the data to ensure user_roles is properly formatted
        const processedData = data.map(topic => ({
          ...topic,
          user_roles: Array.isArray(topic.user_roles) ? topic.user_roles : null
        }));
        
        setTopics(processedData as TopicData[]);
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
    
    const fetchPremiumTopics = async () => {
      try {
        setPremiumLoading(true);
        
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
            is_premium,
            profiles:profiles!topics_user_id_fkey(username, avatar_url, subscription_type),
            user_roles:user_roles(role),
            comments:comments(id)
          `)
          .eq('is_premium', true)
          .order('created_at', { ascending: false })
          .limit(5);
        
        if (error) {
          console.error("Ошибка при загрузке премиум тем:", error);
          return;
        }
        
        // Проверяем, что данные не пустые
        if (!data || data.length === 0) {
          setPremiumTopics([]);
          return;
        }
        
        // Process the data to ensure user_roles is properly formatted
        const processedData = data.map(topic => ({
          ...topic,
          user_roles: Array.isArray(topic.user_roles) ? topic.user_roles : null
        }));
        
        setPremiumTopics(processedData as TopicData[]);
      } catch (error) {
        console.error("Ошибка при загрузке премиум тем:", error);
      } finally {
        setPremiumLoading(false);
      }
    };
    
    fetchTopics();
    fetchPremiumTopics();
    
    // Подписываемся на изменения в таблице topics
    const subscription = supabase
      .channel('topics_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'topics' }, (payload) => {
        console.log('Received realtime update:', payload);
        const newTopic = payload.new as any;
        if (newTopic && newTopic.is_premium) {
          fetchPremiumTopics();
        } else {
          fetchTopics();
        }
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
    
    // Get profile from the joined profiles data
    const profile = topic.profiles || null;
    
    // Проверяем роли пользователя
    const isAdmin = topic.user_roles?.some(role => role.role === 'admin') || false;
    const isCreator = topic.user_roles?.some(role => role.role === 'creator') || false;
    const isModerator = topic.user_roles?.some(role => role.role === 'moderator') || false;
    const sponsorLevel = profile?.subscription_type as 'premium' | 'business' | 'sponsor' | undefined;
    const isPremium = topic.is_premium || false;
      
    return {
      id: topic.id, // Use the UUID directly instead of converting to number
      title: topic.title,
      preview: preview,
      author: profile?.username || "Неизвестный пользователь",
      authorRole: typedCategory === "frontend" 
        ? "Frontend разработчик" 
        : typedCategory === "backend" 
          ? "Backend разработчик" 
          : "Fullstack разработчик",
      authorAvatar: profile?.avatar_url || "",
      repliesCount: topic.comments?.length || 0,
      likesCount: topic.likes || 0,
      viewsCount: topic.views || 0,
      tags: [typedCategory, ...(isPremium ? ["premium"] : [])], // Добавляем базовый тег из категории и premium если нужно
      lastActivity: topic.updated_at || topic.created_at,
      category: typedCategory,
      isAdmin: isAdmin,
      isCreator: isCreator,
      isModerator: isModerator,
      sponsorLevel: sponsorLevel,
      isPremium: isPremium,
      userId: topic.user_id // Добавляем ID пользователя-создателя темы
    };
  };

  // Проверка, имеет ли пользователь премиум-подписку
  const hasPremiumAccess = user ? true : false; // В реальном приложении проверяйте подписку

  return (
    <div>
      <Tabs defaultValue="regular" className="mb-6" onValueChange={(value) => setActiveTab(value as "regular" | "premium")}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="regular">Обычные темы</TabsTrigger>
          <TabsTrigger value="premium" className="flex items-center gap-1">
            <Crown size={14} className="text-amber-500" />
            Премиум темы
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="regular" className="mt-0">
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
        </TabsContent>
        
        <TabsContent value="premium" className="mt-0">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-medium flex items-center gap-2">
              <Crown size={18} className="text-amber-500" />
              Премиум темы
            </h3>
            <PremiumTopicDialog />
          </div>
          
          {premiumLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((_, index) => (
                <div key={index} className="p-6 rounded-lg border border-amber-200">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <Skeleton className="h-4 w-20 mb-2 bg-amber-100" />
                      <Skeleton className="h-6 w-64 mb-2 bg-amber-100" />
                    </div>
                    <Skeleton className="h-4 w-16 bg-amber-100" />
                  </div>
                  <Skeleton className="h-4 w-full mb-6 bg-amber-100" />
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-8 w-8 rounded-full bg-amber-100" />
                      <div>
                        <Skeleton className="h-4 w-20 mb-1 bg-amber-100" />
                        <Skeleton className="h-3 w-24 bg-amber-100" />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Skeleton className="h-4 w-8 bg-amber-100" />
                      <Skeleton className="h-4 w-8 bg-amber-100" />
                      <Skeleton className="h-4 w-8 bg-amber-100" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : hasPremiumAccess ? (
            premiumTopics.length > 0 ? (
              <div className="space-y-4">
                {premiumTopics.map((topic) => (
                  <TopicCard key={topic.id} {...mapTopicToCardProps(topic)} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 border rounded-lg border-amber-200">
                <p className="text-muted-foreground mb-4">Пока нет премиум тем для отображения</p>
                <PremiumTopicDialog />
              </div>
            )
          ) : (
            <div className="text-center py-12 border rounded-lg border-amber-200">
              <Crown size={48} className="mx-auto mb-4 text-amber-500" />
              <h3 className="text-xl font-medium mb-2">Доступно только для премиум пользователей</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Получите приоритетную помощь от экспертов, задавая вопросы в разделе премиум-поддержки
              </p>
              <Button asChild className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
                <a href="/premium">Узнать о премиум-подписке</a>
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RecentTopics;
