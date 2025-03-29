
import React, { createContext, useContext, useEffect } from "react";
import { Session, User } from "@supabase/supabase-js";
import { UserRole } from "@/utils/auth-helpers";
import { useAuthSession } from "@/hooks/useAuthSession";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useAuthMethods } from "@/hooks/useAuthMethods";

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
  // Use our custom hooks
  const { user, session, loading } = useAuthSession();
  const { 
    userRoles, 
    isCreator, 
    isAdmin, 
    isModerator, 
    canAccessAdmin,
    effectiveSubscriptionType,
    hasPremiumAccess,
    fetchUserRoles,
    resetRoles
  } = useUserRoles(user?.id);
  
  const { 
    authLoading, 
    signUp, 
    signIn, 
    signInWithGoogle, 
    signOut 
  } = useAuthMethods();

  // Fetch user roles when user changes
  useEffect(() => {
    if (user) {
      fetchUserRoles();
    } else {
      resetRoles();
    }
  }, [user, fetchUserRoles, resetRoles]);

  // Function to manually refresh user roles
  const refreshUserRoles = async () => {
    if (user) {
      await fetchUserRoles();
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
