
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import AvatarUpload from "@/components/AvatarUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";

const Settings = () => {
  const { user, loading } = useAuth();
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
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
          .select("username, avatar_url")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
        } else {
          setUsername(data.username);
          setAvatarUrl(data.avatar_url);
        }
      } catch (error) {
        console.error("Error in fetchProfile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    if (!username.trim()) {
      toast({
        title: "Ошибка валидации",
        description: "Имя пользователя не может быть пустым",
        variant: "destructive",
      });
      return;
    }
    
    setUpdating(true);
    
    try {
      // Обновить в таблице профилей
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ username })
        .eq("id", user.id);
      
      if (profileError) {
        toast({
          title: "Ошибка обновления профиля",
          description: profileError.message,
          variant: "destructive",
        });
        return;
      }
      
      // Обновить в user_metadata
      const { error: userError } = await supabase.auth.updateUser({
        data: { username }
      });
      
      if (userError) {
        toast({
          title: "Ошибка обновления пользователя",
          description: userError.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Профиль обновлен",
        description: "Ваши настройки были успешно сохранены",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при обновлении профиля",
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
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
            <div className="space-y-4">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-1/3" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Профиль</TabsTrigger>
          <TabsTrigger value="notifications">Уведомления</TabsTrigger>
          <TabsTrigger value="account">Аккаунт</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Настройки профиля</CardTitle>
              <CardDescription>
                Управляйте информацией профиля и аватаром
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
                <div className="flex flex-col items-center gap-4">
                  <AvatarUpload 
                    userId={user!.id} 
                    url={avatarUrl} 
                    onAvatarChange={handleAvatarChange}
                    size="lg"
                    username={username}
                  />
                </div>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Имя пользователя</Label>
                    <Input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Введите имя пользователя"
                      disabled={updating}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email адрес</Label>
                    <Input
                      id="email"
                      value={user?.email || ""}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email не может быть изменен
                    </p>
                  </div>
                  
                  <Button type="submit" disabled={updating} className="mt-4">
                    {updating ? "Сохранение..." : "Сохранить изменения"}
                  </Button>
                </form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Настройки уведомлений</CardTitle>
              <CardDescription>
                Выберите, какие уведомления вы хотите получать
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="email-notifications" 
                    checked={emailNotifications}
                    onCheckedChange={(checked) => 
                      setEmailNotifications(checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor="email-notifications"
                    className="font-normal"
                  >
                    Получать уведомления на email
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button disabled>Скоро будет доступно</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Управление аккаунтом</CardTitle>
              <CardDescription>
                Настройки безопасности и управление аккаунтом
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Аутентификация</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Вы авторизованы через: 
                  <span className="font-medium ml-1">
                    {user?.app_metadata?.provider === "google" ? "Google" : "Email/Пароль"}
                  </span>
                </p>
                
                {user?.app_metadata?.provider !== "google" && (
                  <Button variant="outline" size="sm" disabled>
                    Изменить пароль
                  </Button>
                )}
              </div>
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="font-medium text-destructive mb-2">Опасная зона</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Удаление аккаунта приведет к потере всех данных
                </p>
                <Button variant="destructive" size="sm" disabled>
                  Удалить аккаунт
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
