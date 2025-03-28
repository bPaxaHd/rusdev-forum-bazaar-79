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

// Интерфейс для темы форума
export interface Topic {
  id: string;
  title: string;
  content: string;
  user_id: string;
  category: string;
  created_at: string;
  updated_at: string;
  likes: number;
  views: number;
}

// Интерфейс для комментария
export interface Comment {
  id: string;
  topic_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  likes: number;
}

// Удаление темы
export const deleteTopic = async (topicId: string, userId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Проверяем право на удаление темы
    const { data: topic } = await supabase
      .from("topics")
      .select("user_id")
      .eq("id", topicId)
      .single();
      
    if (!topic) {
      return { success: false, message: "Тема не найдена" };
    }
    
    const { error } = await supabase
      .from("topics")
      .delete()
      .eq("id", topicId);
      
    if (error) {
      console.error("Error deleting topic:", error);
      
      if (error.code === "42501") {
        return { success: false, message: "У вас нет прав на удаление этой темы" };
      }
      
      return { success: false, message: "Не удалось удалить тему" };
    }
    
    return { success: true, message: "Тема успешно удалена" };
  } catch (error) {
    console.error("Error deleting topic:", error);
    return { success: false, message: "Произошла ошибка при удалении темы" };
  }
};

// Обновление темы
export const updateTopic = async (
  topicId: string, 
  userId: string, 
  data: { title?: string; content?: string; category?: string }
): Promise<{ success: boolean; message: string }> => {
  try {
    // Проверяем право на редактирование темы
    const { data: topic } = await supabase
      .from("topics")
      .select("user_id")
      .eq("id", topicId)
      .single();
      
    if (!topic) {
      return { success: false, message: "Тема не найдена" };
    }
    
    const { error } = await supabase
      .from("topics")
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq("id", topicId);
      
    if (error) {
      console.error("Error updating topic:", error);
      
      if (error.code === "42501") {
        return { success: false, message: "У вас нет прав на редактирование этой темы" };
      }
      
      return { success: false, message: "Не удалось обновить тему" };
    }
    
    return { success: true, message: "Тема успешно обновлена" };
  } catch (error) {
    console.error("Error updating topic:", error);
    return { success: false, message: "Произошла ошибка при обновлении темы" };
  }
};

// Удаление комментария
export const deleteComment = async (commentId: string, userId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Проверяем право на удаление комментария
    const { data: comment } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single();
      
    if (!comment) {
      return { success: false, message: "Комментарий не найден" };
    }
    
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);
      
    if (error) {
      console.error("Error deleting comment:", error);
      
      if (error.code === "42501") {
        return { success: false, message: "У вас нет прав на удаление этого комментария" };
      }
      
      return { success: false, message: "Не удалось удалить комментарий" };
    }
    
    return { success: true, message: "Комментарий успешно удален" };
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { success: false, message: "Произошла ошибка при удалении комментария" };
  }
};

// Обновление комментария
export const updateComment = async (
  commentId: string, 
  userId: string, 
  content: string
): Promise<{ success: boolean; message: string }> => {
  try {
    // Проверяем право на редактирование комментария
    const { data: comment } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single();
      
    if (!comment) {
      return { success: false, message: "Комментарий не найден" };
    }
    
    const { error } = await supabase
      .from("comments")
      .update({
        content,
        updated_at: new Date().toISOString()
      })
      .eq("id", commentId);
      
    if (error) {
      console.error("Error updating comment:", error);
      
      if (error.code === "42501") {
        return { success: false, message: "У вас нет прав на редактирование этого комментария" };
      }
      
      return { success: false, message: "Не удалось обновить комментарий" };
    }
    
    return { success: true, message: "Комментарий успешно обновлен" };
  } catch (error) {
    console.error("Error updating comment:", error);
    return { success: false, message: "Произошла ошибка при обновлении комментария" };
  }
};

// Удаление вакансии
export const deleteJobListing = async (jobId: string, userId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Проверяем право на удаление вакансии
    const { data: job } = await supabase
      .from("job_listings")
      .select("user_id")
      .eq("id", jobId)
      .single();
      
    if (!job) {
      return { success: false, message: "Вакансия не найдена" };
    }
    
    const { error } = await supabase
      .from("job_listings")
      .delete()
      .eq("id", jobId);
      
    if (error) {
      console.error("Error deleting job listing:", error);
      
      if (error.code === "42501") {
        return { success: false, message: "У вас нет прав на удаление этой вакансии" };
      }
      
      return { success: false, message: "Не удалось удалить вакансию" };
    }
    
    return { success: true, message: "Вакансия успешно удалена" };
  } catch (error) {
    console.error("Error deleting job listing:", error);
    return { success: false, message: "Произошла ошибка при удалении вакансии" };
  }
};

// Обновление вакансии
export const updateJobListing = async (
  jobId: string, 
  userId: string, 
  data: Partial<{
    company_name: string;
    title: string;
    location: string;
    type: string;
    salary: string;
    description: string;
    logo_url: string;
    requirements: string[];
  }>
): Promise<{ success: boolean; message: string }> => {
  try {
    // Проверяем право на редактирование вакансии
    const { data: job } = await supabase
      .from("job_listings")
      .select("user_id")
      .eq("id", jobId)
      .single();
      
    if (!job) {
      return { success: false, message: "Вакансия не найдена" };
    }
    
    const { error } = await supabase
      .from("job_listings")
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq("id", jobId);
      
    if (error) {
      console.error("Error updating job listing:", error);
      
      if (error.code === "42501") {
        return { success: false, message: "У вас нет прав на редактирование этой вакансии" };
      }
      
      return { success: false, message: "Не удалось обновить вакансию" };
    }
    
    return { success: true, message: "Вакансия успешно обновлена" };
  } catch (error) {
    console.error("Error updating job listing:", error);
    return { success: false, message: "Произошла ошибка при обновлении вакансии" };
  }
};
