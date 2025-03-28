
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  ChevronDown, 
  ChevronUp, 
  Mail, 
  Calendar, 
  Clock, 
  Shield, 
  MessageSquare,
  Code,
  Save,
  Loader2
} from "lucide-react";
import AvatarUpload from "@/components/AvatarUpload";
import { useToast } from "@/hooks/use-toast";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
  specialty?: string | null;
}

interface UserStats {
  topics_count: number;
  comments_count: number;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats>({ topics_count: 0, comments_count: 0 });
  const [profileLoading, setProfileLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [activityExpanded, setActivityExpanded] = useState(false);
  const [specialty, setSpecialty] = useState<string | null>(null);
  const [savingSpecialty, setSavingSpecialty] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/login");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      try {
        setProfileLoading(true);
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
        } else {
          setProfile(data);
          setAvatarUrl(data.avatar_url);
          setSpecialty(data.specialty);
        }
      } catch (error) {
        console.error("Error in fetchProfile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  useEffect(() => {
    const fetchUserStats = async () => {
      if (!user) return;

      try {
        setStatsLoading(true);
        
        // Получаем количество тем, созданных пользователем
        const { data: topicsData, error: topicsError } = await supabase
          .from("topics")
          .select("id", { count: "exact" })
          .eq("user_id", user.id);
          
        // Получаем количество комментариев, созданных пользователем
        const { data: commentsData, error: commentsError } = await supabase
          .from("comments")
          .select("id", { count: "exact" })
          .eq("user_id", user.id);
          
        if (topicsError || commentsError) {
          console.error("Error fetching user stats:", topicsError || commentsError);
        } else {
          setStats({
            topics_count: topicsData?.length || 0,
            comments_count: commentsData?.length || 0
          });
        }
      } catch (error) {
        console.error("Error in fetchUserStats:", error);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  // Обработчик сохранения специальности
  const handleSaveSpecialty = async () => {
    if (!user) return;
    
    try {
      setSavingSpecialty(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({ specialty })
        .eq("id", user.id);
        
      if (error) {
        console.error("Error updating specialty:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось обновить вашу специальность",
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Специальность обновлена",
        description: "Ваша специальность успешно обновлена",
      });
      
      // Обновляем профиль в состоянии
      if (profile) {
        setProfile({
          ...profile,
          specialty
        });
      }
    } catch (error) {
      console.error("Error updating specialty:", error);
    } finally {
      setSavingSpecialty(false);
    }
  };

  // Функция для получения инициалов
  const getInitials = (name: string): string => {
    if (!name) return "U";
    
    if (name.includes("@")) {
      return name.split("@")[0].charAt(0).toUpperCase();
    }
    
    return name
      .split(" ")
      .map(part => part.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
  };

  // Форматировать дату регистрации
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  // Обновить URL аватара
  const handleAvatarChange = (url: string) => {
    setAvatarUrl(url);
  };

  if (loading || profileLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-10">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              <Skeleton className="h-32 w-32 rounded-full" />
              <div className="space-y-4 flex-1">
                <Skeleton className="h-6 w-1/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Получить отображаемое название специальности
  const getSpecialtyDisplayName = (specialty: string | null) => {
    switch (specialty) {
      case "frontend":
        return "Frontend разработчик";
      case "backend":
        return "Backend разработчик";
      case "fullstack":
        return "Fullstack разработчик";
      default:
        return "Не указана";
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Обзор</TabsTrigger>
            <TabsTrigger value="activity">Активность</TabsTrigger>
          </TabsList>
          <Link to="/settings">
            <Button variant="outline" size="sm" className="gap-2">
              <Settings size={16} />
              <span className="hidden sm:inline">Настройки</span>
            </Button>
          </Link>
        </div>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Профиль пользователя</CardTitle>
              <CardDescription>
                Ваша персональная информация на DevTalk
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center">
                  <AvatarUpload 
                    userId={user!.id} 
                    url={avatarUrl} 
                    onAvatarChange={handleAvatarChange}
                    size="lg"
                    username={profile?.username || user?.email || ""}
                  />
                </div>
                
                <div className="space-y-6 flex-1">
                  <div>
                    <h3 className="text-2xl font-semibold">
                      {profile?.username || user?.user_metadata?.username || user?.email}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-muted-foreground">
                      <Mail size={14} />
                      <p className="text-sm">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium flex items-center gap-2">
                      <Code size={16} />
                      Ваша специальность
                    </h4>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select
                        value={specialty || ""}
                        onValueChange={(value) => setSpecialty(value)}
                      >
                        <SelectTrigger className="w-full sm:w-[220px]">
                          <SelectValue placeholder="Выберите специальность" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="frontend">Frontend разработчик</SelectItem>
                          <SelectItem value="backend">Backend разработчик</SelectItem>
                          <SelectItem value="fullstack">Fullstack разработчик</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="outline" 
                        size="default" 
                        onClick={handleSaveSpecialty} 
                        disabled={savingSpecialty}
                        className="gap-2"
                      >
                        {savingSpecialty ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Сохранение...
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Сохранить
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Текущая специальность: <Badge variant="outline">{getSpecialtyDisplayName(profile?.specialty)}</Badge>
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {profile?.created_at && (
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar size={14} />
                          <h4 className="text-sm font-medium">Дата регистрации</h4>
                        </div>
                        <p className="text-sm pl-6">
                          {formatDate(profile.created_at)}
                        </p>
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Shield size={14} />
                        <h4 className="text-sm font-medium">Провайдер</h4>
                      </div>
                      <p className="text-sm pl-6">
                        {user?.app_metadata?.provider === "google" ? "Google" : "Email/Пароль"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <h4 className="text-sm font-medium mb-3">Статистика</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <p className="text-2xl font-semibold">{stats.topics_count}</p>
                        <p className="text-xs text-muted-foreground">Тем создано</p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg text-center">
                        <p className="text-2xl font-semibold">{stats.comments_count}</p>
                        <p className="text-xs text-muted-foreground">Комментариев</p>
                      </div>
                      <div className="bg-muted/50 p-3 rounded-lg text-center sm:col-span-1 col-span-2">
                        <p className="text-2xl font-semibold">0</p>
                        <p className="text-xs text-muted-foreground">Репутация</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Collapsible
            open={activityExpanded}
            onOpenChange={setActivityExpanded}
            className="w-full"
          >
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">Последняя активность</CardTitle>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="w-9 p-0">
                      {activityExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CardDescription>
                  История вашей недавней активности на форуме
                </CardDescription>
              </CardHeader>
              
              <CollapsibleContent>
                <CardContent className="pt-0">
                  <div className="space-y-4">
                    {statsLoading ? (
                      <>
                        <Skeleton className="h-16 w-full" />
                        <Skeleton className="h-16 w-full" />
                      </>
                    ) : stats.topics_count === 0 && stats.comments_count === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
                        <p>У вас пока нет активности на форуме</p>
                        <p className="text-sm mt-2">Создайте новую тему или оставьте комментарий</p>
                        <Button variant="outline" className="mt-4" onClick={() => navigate("/forum")}>
                          Перейти на форум
                        </Button>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-4">
                        Здесь будет отображаться ваша последняя активность
                      </p>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Card>
          </Collapsible>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Ваша активность на форуме</CardTitle>
              <CardDescription>
                История ваших тем и комментариев
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="rounded-sm">{stats.topics_count}</Badge>
                    Созданные темы
                  </h3>
                  {statsLoading ? (
                    <>
                      <Skeleton className="h-16 w-full mb-2" />
                      <Skeleton className="h-16 w-full" />
                    </>
                  ) : stats.topics_count === 0 ? (
                    <div className="text-center py-4 text-muted-foreground bg-muted/30 rounded-md">
                      <p>Вы еще не создали ни одной темы</p>
                      <Button variant="outline" className="mt-2" onClick={() => navigate("/forum")}>
                        Создать тему
                      </Button>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Здесь будут отображаться ваши темы
                    </p>
                  )}
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="font-medium flex items-center gap-2 mb-4">
                    <Badge variant="outline" className="rounded-sm">{stats.comments_count}</Badge>
                    Комментарии
                  </h3>
                  {statsLoading ? (
                    <>
                      <Skeleton className="h-16 w-full mb-2" />
                      <Skeleton className="h-16 w-full" />
                    </>
                  ) : stats.comments_count === 0 ? (
                    <div className="text-center py-4 text-muted-foreground bg-muted/30 rounded-md">
                      <p>Вы еще не оставили комментариев</p>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-4">
                      Здесь будут отображаться ваши комментарии
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
