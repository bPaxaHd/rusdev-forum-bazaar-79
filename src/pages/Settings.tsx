
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const Settings = () => {
  const { user, loading } = useAuth();
  const [username, setUsername] = useState("");
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
          .select("username")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching profile:", error);
        } else {
          setUsername(data.username);
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
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Настройки профиля</CardTitle>
          <CardDescription>
            Здесь вы можете изменить настройки вашего аккаунта на DevTalk
          </CardDescription>
        </CardHeader>
        <CardContent>
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
            
            <Button type="submit" disabled={updating}>
              {updating ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
