import React, { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { 
  getUserRoles, 
  UserRole, 
  canAccessAdminPanel, 
  getEffectiveSubscriptionType,
  hasPremiumAccess
} from "@/utils/auth-helpers";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authLoading: boolean;
  userRoles: UserRole[];
  isCreator: boolean;
  isAdmin: boolean;
  isModerator: boolean;
  canAccessAdmin: boolean;
  effectiveSubscriptionType: string;
  hasPremiumAccess: boolean;
  signUp: (email: string, password: string, username: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshUserRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [canAccessAdmin, setCanAccessAdmin] = useState(false);
  const [effectiveSubscriptionType, setEffectiveSubscriptionType] = useState<string>('free');
  const [hasPremiumAccess, setHasPremiumAccess] = useState(false);
  const { toast } = useToast();

  const fetchUserRoles = async (userId: string) => {
    if (!userId) return;
    
    try {
      const roles = await getUserRoles(userId);
      setUserRoles(roles);
      setIsCreator(roles.includes('creator'));
      setIsAdmin(roles.includes('admin'));
      setIsModerator(roles.includes('moderator'));
      
      const hasAdminAccess = await canAccessAdminPanel(userId);
      setCanAccessAdmin(hasAdminAccess);

      const effectiveType = await getEffectiveSubscriptionType(userId);
      setEffectiveSubscriptionType(effectiveType);

      const premiumAccess = await hasPremiumAccess(userId);
      setHasPremiumAccess(Boolean(premiumAccess));
    } catch (error) {
      console.error("Error fetching user roles:", error);
    }
  };

  const refreshUserRoles = async () => {
    if (user) {
      await fetchUserRoles(user.id);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await fetchUserRoles(session.user.id);
      }
      
      setLoading(false);
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(() => {
          fetchUserRoles(session.user.id);
        }, 0);
      } else {
        setUserRoles([]);
        setIsCreator(false);
        setIsAdmin(false);
        setIsModerator(false);
        setCanAccessAdmin(false);
        setEffectiveSubscriptionType('free');
        setHasPremiumAccess(false);
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username
          }
        } 
      });
      
      if (error) {
        toast({
          title: "Ошибка регистрации",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Успешная регистрация",
        description: "Пожалуйста, проверьте вашу почту для подтверждения.",
      });
      
      return { error: null };
    } catch (error) {
      console.error("Error in signUp:", error);
      return { error };
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Ошибка входа",
          description: error.message,
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Успешный вход",
        description: "Добро пожаловать в DevTalk!",
      });
      
      return { error: null };
    } catch (error) {
      console.error("Error in signIn:", error);
      return { error };
    } finally {
      setAuthLoading(false);
    }
  };

  const signInWithGoogle = async () => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      
      if (error) {
        toast({
          title: "Ошибка входа через Google",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in signInWithGoogle:", error);
      toast({
        title: "Ошибка входа через Google",
        description: "Не удалось выполнить вход через Google",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    setAuthLoading(true);
    try {
      await supabase.auth.signOut();
      toast({
        title: "Выход выполнен",
        description: "Вы успешно вышли из системы",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Ошибка выхода",
        description: "Не удалось выйти из системы",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      authLoading,
      userRoles,
      isCreator,
      isAdmin,
      isModerator,
      canAccessAdmin,
      effectiveSubscriptionType,
      hasPremiumAccess,
      signUp, 
      signIn, 
      signInWithGoogle, 
      signOut,
      refreshUserRoles
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
