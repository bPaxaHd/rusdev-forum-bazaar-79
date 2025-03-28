import { supabase } from "@/integrations/supabase/client";

// Admin login attempt interface
export interface AdminLoginAttempt {
  id: string;
  ip_address: string;
  timestamp: string;
  attempts: number;
  is_resolved: boolean;
}

// Support message interface
export interface SupportMessage {
  id: string;
  user_id: string;
  content: string;
  is_admin: boolean;
  read: boolean;
  created_at: string;
}

// Функция для обновления структуры базы данных (вызывается при необходимости)
export const setupRequiredTables = async () => {
  try {
    // Создаем таблицу topic_likes, если она не существует
    const { error: topicLikesError } = await supabase.rpc('create_topic_likes_if_not_exists');
    if (topicLikesError) console.error("Error creating topic_likes table:", topicLikesError);
    
    // Создаем таблицу comment_likes, если она не существует
    const { error: commentLikesError } = await supabase.rpc('create_comment_likes_if_not_exists');
    if (commentLikesError) console.error("Error creating comment_likes table:", commentLikesError);
    
    // Создаем таблицу admins, если она не существует
    const { error: adminsError } = await supabase.rpc('create_admins_if_not_exists');
    if (adminsError) console.error("Error creating admins table:", adminsError);
    
    // Добавляем поле subscription_type в таблицу profiles, если оно не существует
    const { error: subscriptionTypeError } = await supabase.rpc('add_subscription_type_to_profiles');
    if (subscriptionTypeError) console.error("Error adding subscription_type to profiles:", subscriptionTypeError);
    
    // Добавляем поле user_tag в таблицу profiles, если оно не существует
    const { error: userTagError } = await supabase.rpc('add_user_tag_to_profiles');
    if (userTagError) console.error("Error adding user_tag to profiles:", userTagError);
    
    return true;
  } catch (error) {
    console.error("Error during DB setup:", error);
    return false;
  }
};

// Проверка и создание таблиц при инициализации
export const initDb = async () => {
  return await setupRequiredTables();
};

// Функция для получения информации о пользователе по тегу
export const getUserByTag = async (userTag: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_tag", userTag)
      .single();
      
    if (error) {
      console.error("Error fetching user by tag:", error);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error("Error fetching user by tag:", error);
    return null;
  }
};

// Функция для обновления подписки пользователя по тегу
export const updateSubscriptionByTag = async (userTag: string, subscriptionType: string) => {
  try {
    const user = await getUserByTag(userTag);
    
    if (!user) {
      return { success: false, message: "Пользователь с таким тегом не найден" };
    }
    
    const { error } = await supabase
      .from("profiles")
      .update({ subscription_type: subscriptionType })
      .eq("id", user.id);
      
    if (error) {
      console.error("Error updating subscription:", error);
      return { success: false, message: "Не удалось обновить подписку" };
    }
    
    return { 
      success: true, 
      message: `Подписка для пользователя ${user.username} (${userTag}) обновлена на ${subscriptionType}` 
    };
  } catch (error) {
    console.error("Error updating subscription by tag:", error);
    return { success: false, message: "Произошла ошибка при обновлении подписки" };
  }
};

// Функции для работы с admin_login_attempts
// Функция для регистрации попытки входа
export const recordLoginAttempt = async (ipAddress: string) => {
  try {
    // Проверяем, существует ли уже запись для данного IP
    const { data: existingRecord } = await supabase
      .from("admin_login_attempts")
      .select("*")
      .eq("ip_address", ipAddress)
      .eq("is_resolved", false)
      .single();
    
    if (existingRecord) {
      // Увеличиваем счетчик попыток
      const { error } = await supabase
        .from("admin_login_attempts")
        .update({ attempts: existingRecord.attempts + 1 })
        .eq("id", existingRecord.id);
        
      if (error) {
        console.error("Error updating login attempts:", error);
      }
      
      return existingRecord.attempts + 1;
    } else {
      // Создаем новую запись
      const { error } = await supabase
        .from("admin_login_attempts")
        .insert({ ip_address: ipAddress });
        
      if (error) {
        console.error("Error creating login attempt record:", error);
      }
      
      return 1;
    }
  } catch (error) {
    console.error("Error recording login attempt:", error);
    return 0;
  }
};

// Функция для получения всех нерешенных попыток входа
export const getUnresolvedLoginAttempts = async (): Promise<AdminLoginAttempt[]> => {
  try {
    const { data, error } = await supabase
      .from("admin_login_attempts")
      .select("*")
      .eq("is_resolved", false)
      .order("timestamp", { ascending: false });
      
    if (error) {
      console.error("Error fetching unresolved login attempts:", error);
      return [];
    }
    
    return data as AdminLoginAttempt[];
  } catch (error) {
    console.error("Error fetching unresolved login attempts:", error);
    return [];
  }
};

// Функция для разрешения инцидента
export const resolveLoginAttempt = async (id: string) => {
  try {
    const { error } = await supabase
      .from("admin_login_attempts")
      .update({ is_resolved: true })
      .eq("id", id);
      
    if (error) {
      console.error("Error resolving login attempt:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error resolving login attempt:", error);
    return false;
  }
};

// Функции для работы с сообщениями поддержки

// Получение всех непрочитанных сообщений (для админов)
export const getUnreadSupportMessages = async (): Promise<SupportMessage[]> => {
  try {
    const { data, error } = await supabase
      .from("support_messages")
      .select("*, profiles!inner(*)")
      .eq("read", false)
      .eq("is_admin", false)
      .order("created_at");
      
    if (error) {
      console.error("Error fetching unread support messages:", error);
      return [];
    }
    
    return data as SupportMessage[];
  } catch (error) {
    console.error("Error fetching unread support messages:", error);
    return [];
  }
};

// Отметить сообщение как прочитанное
export const markSupportMessageAsRead = async (messageId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("support_messages")
      .update({ read: true })
      .eq("id", messageId);
      
    if (error) {
      console.error("Error marking support message as read:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error marking support message as read:", error);
    return false;
  }
};

// Отправка сообщения от имени администратора
export const sendAdminSupportMessage = async (
  userId: string, 
  content: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("support_messages")
      .insert({
        user_id: userId,
        content,
        is_admin: true,
        read: false
      });
      
    if (error) {
      console.error("Error sending admin support message:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error sending admin support message:", error);
    return false;
  }
};

// Получение диалога с пользователем
export const getUserSupportDialog = async (userId: string): Promise<SupportMessage[]> => {
  try {
    const { data, error } = await supabase
      .from("support_messages")
      .select("*")
      .eq("user_id", userId)
      .order("created_at");
      
    if (error) {
      console.error("Error fetching user support dialog:", error);
      return [];
    }
    
    return data as SupportMessage[];
  } catch (error) {
    console.error("Error fetching user support dialog:", error);
    return [];
  }
};
