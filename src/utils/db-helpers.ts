
import { supabase } from "@/integrations/supabase/client";

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
