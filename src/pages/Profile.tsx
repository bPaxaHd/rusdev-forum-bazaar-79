
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  id: string;
  username: string;
  avatar_url: string | null;
  created_at: string;
}

const Profile = () => {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const navigate = useNavigate();

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
        }
      } catch (error) {
        console.error("Error in fetchProfile:", error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user]);

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

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Профиль пользователя</CardTitle>
          <CardDescription>
            Ваша персональная информация на DevTalk
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="h-32 w-32">
              <AvatarImage 
                src={user?.user_metadata?.avatar_url || profile?.avatar_url || undefined} 
                alt={profile?.username || user?.email || ""} 
              />
              <AvatarFallback className="text-3xl">
                {getInitials(profile?.username || user?.email || "")}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-4 flex-1">
              <div>
                <h3 className="text-lg font-semibold">
                  {profile?.username || user?.user_metadata?.username || user?.email}
                </h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              {profile?.created_at && (
                <div>
                  <h4 className="text-sm font-medium">Дата регистрации</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(profile.created_at)}
                  </p>
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium">Провайдер аутентификации</h4>
                <p className="text-sm text-muted-foreground">
                  {user?.app_metadata?.provider === "google" ? "Google" : "Email/Пароль"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
