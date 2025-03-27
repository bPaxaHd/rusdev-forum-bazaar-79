
import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Upload, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AvatarUploadProps {
  userId: string;
  url: string | null;
  onAvatarChange: (url: string) => void;
  size?: "sm" | "md" | "lg";
  username?: string;
}

const AvatarUpload = ({ userId, url, onAvatarChange, size = "md", username }: AvatarUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();
  
  // Размеры аватарки в зависимости от параметра size
  const sizes = {
    sm: "h-16 w-16",
    md: "h-24 w-24",
    lg: "h-32 w-32"
  };
  
  // Функция для получения инициалов
  const getInitials = (name: string): string => {
    if (!name) return "U";
    
    if (name.includes("@")) {
      return name.split("@")[0].charAt(0).toUpperCase();
    }
    
    return name
      .split(" ")
      .map(part => part.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2);
  };

  // Функция загрузки файла в Supabase Storage с улучшенной безопасностью
  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        return;
      }
      
      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      
      // Используем userId в пути к файлу для обеспечения безопасности
      // Формат: userid/filename.ext
      const filePath = `${userId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Проверка типа файла
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Ошибка загрузки",
          description: "Пожалуйста, загрузите изображение.",
          variant: "destructive",
        });
        return;
      }
      
      // Проверка размера файла (макс. 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Ошибка загрузки",
          description: "Изображение не должно превышать 2MB.",
          variant: "destructive",
        });
        return;
      }

      // Удаление предыдущих аватаров пользователя перед загрузкой нового
      // Найти все файлы в папке с идентификатором пользователя
      const { data: oldAvatars } = await supabase
        .storage
        .from("avatars")
        .list(userId);
      
      // Если есть предыдущие аватары, удаляем их
      if (oldAvatars && oldAvatars.length > 0) {
        const filesToRemove = oldAvatars.map(f => `${userId}/${f.name}`);
        await supabase.storage.from("avatars").remove(filesToRemove);
      }

      // Загрузка файла в bucket avatars с метаданными
      const { error: uploadError, data } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { 
          upsert: true,
          contentType: file.type,
          // Добавляем метаданные для дополнительной безопасности
          cacheControl: "3600",
          metadata: {
            userId: userId,
            uploadTime: new Date().toISOString()
          }
        });

      if (uploadError) {
        toast({
          title: "Ошибка загрузки",
          description: uploadError.message,
          variant: "destructive",
        });
        return;
      }
      
      // Получение публичного URL
      const { data: { publicUrl } } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
        
      // Обновление аватарки в профиле
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("id", userId);
        
      if (updateError) {
        toast({
          title: "Ошибка обновления",
          description: updateError.message,
          variant: "destructive",
        });
        return;
      }
        
      // Уведомление об успешной загрузке
      toast({
        title: "Аватар обновлен",
        description: "Ваш аватар был успешно загружен.",
      });
      
      // Вызов колбека для обновления аватара в родительском компоненте
      onAvatarChange(publicUrl);
      
      // Логирование действия (можно расширить для сохранения логов в базе данных)
      console.log(`Аватар обновлен пользователем ${userId} в ${new Date().toISOString()}`);
      
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      toast({
        title: "Что-то пошло не так",
        description: "Не удалось загрузить изображение. Пожалуйста, попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Avatar className={sizes[size]}>
        <AvatarImage 
          src={url || undefined} 
          alt={username || "Аватар пользователя"} 
        />
        <AvatarFallback className={`text-${size === "sm" ? "xl" : size === "md" ? "2xl" : "3xl"}`}>
          {getInitials(username || "")}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col items-center gap-2">
        <Label 
          htmlFor="avatar-upload" 
          className="cursor-pointer flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          {uploading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Загрузка...</span>
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              <span>Изменить аватар</span>
            </>
          )}
        </Label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={uploadAvatar}
          disabled={uploading}
          className="sr-only"
        />
        <p className="text-xs text-muted-foreground">
          JPG, PNG или GIF. Макс. размер 2MB.
        </p>
      </div>
    </div>
  );
};

export default AvatarUpload;
