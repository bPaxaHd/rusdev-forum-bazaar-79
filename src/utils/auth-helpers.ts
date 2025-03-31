
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'user' | 'moderator' | 'admin' | 'creator';
export type SubscriptionType = 'free' | 'premium' | 'business' | 'sponsor';

// Map roles and subscription types to numeric access levels
// Order: free < premium < business < sponsor < moderator < admin < creator
const ACCESS_LEVELS = {
  'free': 0,
  'premium': 1,
  'business': 2,
  'sponsor': 3,
  'moderator': 4,
  'admin': 5,
  'creator': 6
};

// Проверка, имеет ли пользователь определенную роль
export const hasRole = async (userId: string, role: UserRole): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", role)
      .single();
      
    if (error) {
      console.error("Error checking user role:", error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
};

// Проверка, является ли пользователь модератором, админом или создателем
export const isStaff = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["moderator", "admin", "creator"]);
      
    if (error) {
      console.error("Error checking staff status:", error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking staff status:", error);
    return false;
  }
};

// Проверка, имеет ли пользователь право модифицировать контент
export const canModifyContent = async (contentUserId: string, currentUserId: string): Promise<boolean> => {
  if (!currentUserId) return false;
  
  // Если пользователь - владелец контента
  if (contentUserId === currentUserId) return true;
  
  // Если пользователь - модератор, админ или создатель
  return await isStaff(currentUserId);
};

// Получение всех ролей пользователя
export const getUserRoles = async (userId: string): Promise<UserRole[]> => {
  if (!userId) return [];
  
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);
      
    if (error) {
      console.error("Error fetching user roles:", error);
      return [];
    }
    
    return (data || []).map(item => item.role as UserRole);
  } catch (error) {
    console.error("Error fetching user roles:", error);
    return [];
  }
};

// Проверка, является ли пользователь создателем
export const isCreator = async (userId: string): Promise<boolean> => {
  return await hasRole(userId, 'creator');
};

// Проверка, является ли пользователь админом
export const isAdmin = async (userId: string): Promise<boolean> => {
  return await hasRole(userId, 'admin');
};

// Проверка, является ли пользователь модератором
export const isModerator = async (userId: string): Promise<boolean> => {
  return await hasRole(userId, 'moderator');
};

// Проверка доступа к админ-панели (только админы и создатели)
export const canAccessAdminPanel = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .in("role", ["admin", "creator"]);
      
    if (error) {
      console.error("Error checking admin panel access:", error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking admin panel access:", error);
    return false;
  }
};

// Проверка, может ли пользователь присваивать определенную роль
export const canAssignRole = async (userId: string, roleToAssign: UserRole): Promise<boolean> => {
  if (!userId) return false;
  
  // Проверяем, является ли пользователь создателем (может назначать любые роли)
  const userIsCreator = await isCreator(userId);
  if (userIsCreator) return true;
  
  // Проверяем, является ли пользователь админом
  const userIsAdmin = await isAdmin(userId);
  
  // Админы могут назначать роли модераторов, но не создателей
  if (userIsAdmin && roleToAssign !== 'creator') return true;
  
  return false;
};

// Проверка доступа к функционалу с определенным уровнем подписки
// Учитывает иерархию - если у пользователя есть доступ level 3, то у него есть доступ ко всем level < 3
export const hasSubscriptionAccess = async (
  userId: string, 
  requiredLevel: UserRole | SubscriptionType
): Promise<boolean> => {
  if (!userId) return false;

  try {
    // Получаем роли пользователя
    const userRoles = await getUserRoles(userId);
    
    // Получаем информацию о подписке пользователя
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("subscription_type")
      .eq("id", userId)
      .single();
      
    if (profileError) {
      console.error("Error fetching user subscription:", profileError);
      return false;
    }

    const userSubscription = profileData?.subscription_type || 'free';
    
    // Определяем максимальный уровень доступа пользователя
    // (может быть основан на роли или на подписке)
    let userAccessLevel = ACCESS_LEVELS['free']; // По умолчанию - базовый уровень
    
    // Проверяем уровень доступа на основе ролей
    userRoles.forEach(role => {
      if (ACCESS_LEVELS[role] > userAccessLevel) {
        userAccessLevel = ACCESS_LEVELS[role];
      }
    });
    
    // Проверяем уровень доступа на основе подписки
    if (ACCESS_LEVELS[userSubscription] > userAccessLevel) {
      userAccessLevel = ACCESS_LEVELS[userSubscription];
    }
    
    // Проверяем, достаточен ли уровень доступа пользователя для требуемого уровня
    const requiredAccessLevel = ACCESS_LEVELS[requiredLevel];
    
    return userAccessLevel >= requiredAccessLevel;
  } catch (error) {
    console.error("Error checking subscription access:", error);
    return false;
  }
};

// Проверка доступа к премиум функциям
export const hasPremiumAccess = async (userId: string): Promise<boolean> => {
  return await hasSubscriptionAccess(userId, 'premium');
};

// Получение типа подписки пользователя с учетом ролей
export const getEffectiveSubscriptionType = async (userId: string): Promise<string> => {
  if (!userId) return 'free';

  try {
    // Получаем роли пользователя
    const userRoles = await getUserRoles(userId);
    
    // Получаем информацию о подписке пользователя
    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("subscription_type")
      .eq("id", userId)
      .single();
      
    if (profileError) {
      console.error("Error fetching user subscription:", profileError);
      return 'free';
    }

    const userSubscription = profileData?.subscription_type || 'free';
    
    // Определяем максимальный уровень доступа пользователя
    let highestAccessKey = 'free';
    let highestAccessLevel = ACCESS_LEVELS['free'];
    
    // Проверяем уровень доступа на основе ролей
    userRoles.forEach(role => {
      if (ACCESS_LEVELS[role] > highestAccessLevel) {
        highestAccessLevel = ACCESS_LEVELS[role];
        highestAccessKey = role;
      }
    });
    
    // Проверяем уровень доступа на основе подписки
    if (ACCESS_LEVELS[userSubscription] > highestAccessLevel) {
      highestAccessLevel = ACCESS_LEVELS[userSubscription];
      highestAccessKey = userSubscription;
    }
    
    return highestAccessKey;
  } catch (error) {
    console.error("Error getting effective subscription type:", error);
    return 'free';
  }
};
