
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Settings, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

const NavbarUserMenu = () => {
  const { user, signOut, loading } = useAuth();
  const [profile, setProfile] = useState<{ username: string; avatar_url: string | null } | null>(null);
  const [fetchingProfile, setFetchingProfile] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        setFetchingProfile(true);
        
        const { data, error } = await supabase
          .from("profiles")
          .select("username, avatar_url")
          .eq("id", user.id)
          .single();
          
        if (error) {
          console.error("Ошибка при загрузке профиля:", error);
          return;
        }
        
        setProfile(data);
      } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
      } finally {
        setFetchingProfile(false);
      }
    };
    
    if (user) {
      fetchProfile();
    }
    
    // Подписка на изменения профиля пользователя
    const subscription = supabase
      .channel(`profile:${user?.id}`)
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'profiles',
        filter: `id=eq.${user?.id}` 
      }, (payload) => {
        setProfile(payload.new as any);
      })
      .subscribe();
      
    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  if (loading || fetchingProfile) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-8 w-20" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link to="/login">
          <Button variant="outline" size="sm">
            Войти
          </Button>
        </Link>
        <Link to="/register">
          <Button size="sm">Регистрация</Button>
        </Link>
      </div>
    );
  }

  const avatarUrl = profile?.avatar_url || user.user_metadata?.avatar_url;
  const username = profile?.username || user.user_metadata?.username || user.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl} alt={username} />
            <AvatarFallback>{getInitials(username)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex flex-col space-y-1 p-2">
          <p className="text-sm font-medium leading-none">{username}</p>
          <p className="text-xs leading-none text-muted-foreground">
            {user.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <Link to="/profile">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Профиль</span>
          </DropdownMenuItem>
        </Link>
        <Link to="/settings">
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Настройки</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Выйти</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// Helper function to get initials from name or email
function getInitials(name: string): string {
  if (!name) return "U";
  
  // If it's an email, use the first character of the local part
  if (name.includes("@")) {
    return name.split("@")[0].charAt(0).toUpperCase();
  }
  
  // Otherwise, get initials from name
  return name
    .split(" ")
    .map(part => part.charAt(0).toUpperCase())
    .join("")
    .substring(0, 2);
}

export default NavbarUserMenu;
