
import { supabase } from "@/integrations/supabase/client";

export type UserRole = 'user' | 'moderator' | 'admin' | 'creator';

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
