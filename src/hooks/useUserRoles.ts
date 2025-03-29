
import { useState, useCallback } from "react";
import { 
  getUserRoles, 
  UserRole, 
  canAccessAdminPanel, 
  getEffectiveSubscriptionType,
  hasPremiumAccess
} from "@/utils/auth-helpers";

export function useUserRoles(userId: string | undefined) {
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [canAccessAdmin, setCanAccessAdmin] = useState(false);
  const [effectiveSubscriptionType, setEffectiveSubscriptionType] = useState<string>('free');
  const [hasPremium, setHasPremium] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserRoles = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
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
      setHasPremium(Boolean(premiumAccess === true));
    } catch (error) {
      console.error("Error fetching user roles:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const resetRoles = useCallback(() => {
    setUserRoles([]);
    setIsCreator(false);
    setIsAdmin(false);
    setIsModerator(false);
    setCanAccessAdmin(false);
    setEffectiveSubscriptionType('free');
    setHasPremium(false);
  }, []);

  return {
    userRoles,
    isCreator,
    isAdmin,
    isModerator,
    canAccessAdmin,
    effectiveSubscriptionType,
    hasPremiumAccess: hasPremium,
    isLoading,
    fetchUserRoles,
    resetRoles
  };
}
