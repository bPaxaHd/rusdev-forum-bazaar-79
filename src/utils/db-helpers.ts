
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
