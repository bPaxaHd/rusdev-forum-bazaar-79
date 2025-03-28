
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Ban, VolumeX, Snowflake, Trash2, Crown, Shield, Hammer } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import RoleCheckbox from "@/components/RoleCheckbox";
import { formatDate } from "./utils";
import { UserProfile } from "@/types/auth";
import { User } from "./types";
import { UserRole } from "@/utils/auth-helpers";

interface UserProfileEditProps {
  selectedUser: User;
  editedProfile: Partial<UserProfile>;
  setEditedProfile: React.Dispatch<React.SetStateAction<Partial<UserProfile>>>;
  isCreator: boolean;
  isAdmin: boolean;
  onFetchUsers: () => Promise<void>;
}

const UserProfileEdit: React.FC<UserProfileEditProps> = ({
  selectedUser,
  editedProfile,
  setEditedProfile,
  isCreator,
  isAdmin,
  onFetchUsers
}) => {
  const { toast } = useToast();

  const handleUpdateProfile = async () => {
    try {
      // Update profile data
      const { error } = await supabase
        .from("profiles")
        .update({
          username: editedProfile.username,
          subscription_type: editedProfile.subscription_type,
          user_tag: editedProfile.user_tag,
          is_banned: editedProfile.is_banned,
          is_muted: editedProfile.is_muted,
          is_frozen: editedProfile.is_frozen
        })
        .eq("id", selectedUser.id);
      
      if (error) {
        toast({
          title: "Ошибка обновления",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Профиль обновлен",
        description: "Данные пользователя успешно обновлены",
      });
      
      // Refresh user data
      onFetchUsers();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Ошибка обновления",
        description: "Произошла ошибка при обновлении профиля",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUserRole = async (userId: string, role: UserRole, addOrRemove: boolean) => {
    if (!userId) return;
    
    // Check if the current user has permission to modify this role
    if (role === 'creator' && !isCreator) {
      toast({
        title: "Доступ запрещен",
        description: "Только создатели могут назначать роль создателя",
        variant: "destructive",
      });
      return;
    }
    
    // Admins cannot assign creator role
    if (role === 'creator' && isAdmin && !isCreator) {
      toast({
        title: "Доступ запрещен",
        description: "Администраторы не могут назначать роль создателя",
        variant: "destructive",
      });
      return;
    }
    
    // Moderators cannot assign admin or creator roles
    if ((role === 'admin' || role === 'creator') && !isAdmin && !isCreator) {
      toast({
        title: "Доступ запрещен",
        description: "Модераторы не могут назначать роли администратора или создателя",
        variant: "destructive",
      });
      return;
    }
    
    try {
      if (addOrRemove) {
        // Add role
        const { error } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: role
          });
          
        if (error) {
          // If unique constraint error, the role already exists
          if (error.code === '23505') {
            toast({
              title: "Роль уже назначена",
              description: `Пользователь уже имеет роль ${role}`,
            });
            return;
          }
          
          throw error;
        }
        
        toast({
          title: "Роль назначена",
          description: `Роль ${role} успешно назначена пользователю`,
        });
      } else {
        // Remove role
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', role);
          
        if (error) {
          throw error;
        }
        
        toast({
          title: "Роль удалена",
          description: `Роль ${role} успешно удалена у пользователя`,
        });
      }
      
      // Refresh user data
      onFetchUsers();
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast({
        title: "Ошибка",
        description: error.message || "Произошла ошибка при обновлении роли пользователя",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    try {
      const { error } = await supabase
        .from("profiles")
        .delete()
        .eq("id", selectedUser.id);
      
      if (error) {
        toast({
          title: "Ошибка удаления",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Пользователь удален",
        description: "Пользователь успешно удален из системы",
      });
      
      // Refresh user data
      onFetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Ошибка удаления",
        description: "Произошла ошибка при удалении пользователя",
        variant: "destructive",
      });
    }
  };

  return (
    <ScrollArea className="h-[calc(70vh-130px)]">
      <div>
        <div className="flex items-center mb-6">
          <Avatar className="h-16 w-16 mr-4" style={{
            borderColor: selectedUser.profile.subscription_type === "admin" ? 'rgb(220, 38, 38)' : 
              selectedUser.profile.subscription_type === "premium" ? 'rgb(234, 179, 8)' :
              selectedUser.profile.subscription_type === "business" ? 'rgb(59, 130, 246)' :
              selectedUser.profile.subscription_type === "sponsor" ? 'rgb(139, 92, 246)' : 'transparent',
            borderWidth: selectedUser.profile.subscription_type !== "free" ? '2px' : '0',
            borderStyle: 'solid'
          }}>
            <AvatarImage src={selectedUser.profile.avatar_url || ""} />
            <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white">
              {selectedUser.profile.username.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="text-xl font-bold">{selectedUser.profile.username}</h3>
            <p className="text-sm text-muted-foreground">ID: {selectedUser.id}</p>
            <p className="text-xs text-muted-foreground">
              Зарегистрирован: {formatDate(selectedUser.profile.created_at)}
            </p>
          </div>
        </div>
        
        <Separator className="my-4" />
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="username">Имя пользователя</Label>
            <Input
              id="username"
              value={editedProfile.username || ""}
              onChange={(e) => setEditedProfile(prev => ({ ...prev, username: e.target.value }))}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="subscription">Тип подписки</Label>
            <Select
              value={editedProfile.subscription_type || "free"}
              onValueChange={(value) => setEditedProfile(prev => ({ ...prev, subscription_type: value }))}
            >
              <SelectTrigger id="subscription" className="mt-1">
                <SelectValue placeholder="Выберите тип подписки" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="free">Бесплатная</SelectItem>
                <SelectItem value="premium">Премиум</SelectItem>
                <SelectItem value="business">Бизнес</SelectItem>
                <SelectItem value="sponsor">Спонсор</SelectItem>
                <SelectItem value="admin">Администратор</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="user_tag">Тег пользователя</Label>
            <Input
              id="user_tag"
              value={editedProfile.user_tag || ""}
              onChange={(e) => setEditedProfile(prev => ({ ...prev, user_tag: e.target.value }))}
              className="mt-1"
              placeholder="Например: Эксперт, Новичок, Разработчик"
            />
          </div>
          
          <Separator className="my-4" />
          
          {/* User Roles Section */}
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">Роли пользователя</h3>
            
            <div className="space-y-3 mb-4">
              {/* User role checkboxes will be rendered here from fetched roles */}
              <RoleCheckbox 
                userId={selectedUser.id}
                role="creator"
                label="Создатель"
                description="Полные права на сайте и его контент"
                onToggle={handleUpdateUserRole}
                disabled={!isCreator} // Only creators can assign creator role
                icon={<Crown className="h-4 w-4 text-amber-500" />}
              />
              
              <RoleCheckbox 
                userId={selectedUser.id}
                role="admin"
                label="Администратор"
                description="Доступ к админ-панели и управлению пользователями"
                onToggle={handleUpdateUserRole}
                disabled={!isCreator && !isAdmin} // Only creators and admins can assign admin role
                icon={<Shield className="h-4 w-4 text-red-500" />}
              />
              
              <RoleCheckbox 
                userId={selectedUser.id}
                role="moderator"
                label="Модератор"
                description="Модерация контента и сообщений"
                onToggle={handleUpdateUserRole}
                disabled={!isCreator && !isAdmin} // Only creators and admins can assign moderator role
                icon={<Hammer className="h-4 w-4 text-blue-500" />}
              />
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Ban size={18} className="text-red-500" />
                <div>
                  <Label htmlFor="ban-switch">Забанить пользователя</Label>
                  <p className="text-sm text-muted-foreground">Пользователь не сможет входить в аккаунт</p>
                </div>
              </div>
              <Switch 
                id="ban-switch" 
                checked={editedProfile.is_banned || false}
                onCheckedChange={(checked) => setEditedProfile(prev => ({ ...prev, is_banned: checked }))}
                className={editedProfile.is_banned ? "bg-red-500" : ""}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <VolumeX size={18} className="text-orange-500" />
                <div>
                  <Label htmlFor="mute-switch">Мут пользователя</Label>
                  <p className="text-sm text-muted-foreground">Пользователь не сможет писать комментарии и создавать темы</p>
                </div>
              </div>
              <Switch 
                id="mute-switch" 
                checked={editedProfile.is_muted || false}
                onCheckedChange={(checked) => setEditedProfile(prev => ({ ...prev, is_muted: checked }))}
                className={editedProfile.is_muted ? "bg-orange-500" : ""}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Snowflake size={18} className="text-blue-500" />
                <div>
                  <Label htmlFor="freeze-switch">Заморозить аккаунт</Label>
                  <p className="text-sm text-muted-foreground">Пользователь не сможет выполнять никакие действия</p>
                </div>
              </div>
              <Switch 
                id="freeze-switch" 
                checked={editedProfile.is_frozen || false}
                onCheckedChange={(checked) => setEditedProfile(prev => ({ ...prev, is_frozen: checked }))}
                className={editedProfile.is_frozen ? "bg-blue-500" : ""}
              />
            </div>
          </div>
          
          <div className="flex justify-between mt-6">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="flex items-center gap-1">
                  <Trash2 size={16} />
                  <span>Удалить пользователя</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Это действие нельзя отменить. Пользователь будет полностью удален из системы
                    вместе со всеми его данными.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDeleteUser} className="bg-red-500 hover:bg-red-600">
                    Удалить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button onClick={handleUpdateProfile}>Сохранить</Button>
          </div>
        </div>
      </div>
    </ScrollArea>
  );
};

export default UserProfileEdit;
