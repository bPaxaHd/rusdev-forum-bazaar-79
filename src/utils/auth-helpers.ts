
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
