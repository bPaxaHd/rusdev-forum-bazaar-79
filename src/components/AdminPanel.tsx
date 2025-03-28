
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";
import {
  Trash2,
  User,
  Shield,
  Ban,
  Lock,
  UserX,
  ShieldAlert,
  Tag
} from "lucide-react";
import "../styles/admin.css";

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  profile: UserProfile;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ open, onOpenChange }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Fetch profiles from the profiles table
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*");
      
      if (profileError) {
        console.error("Error fetching profiles:", profileError);
        toast({
          title: "Ошибка загрузки пользователей",
          description: profileError.message,
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      if (!profiles || profiles.length === 0) {
        setLoading(false);
        return;
      }
      
      // Create user objects with profiles
      const formattedUsers = profiles.map(profile => ({
        id: profile.id,
        email: profile.username, // We don't have direct access to emails, so using username as a fallback
        created_at: profile.created_at,
        profile: profile as UserProfile
      }));
      
      setUsers(formattedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Ошибка загрузки пользователей",
        description: "Произошла ошибка при загрузке списка пользователей",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setEditedProfile({
      username: user.profile.username,
      subscription_type: user.profile.subscription_type || "free",
      user_tag: user.profile.user_tag || "",
      is_banned: user.profile.is_banned || false,
      is_muted: user.profile.is_muted || false,
      is_frozen: user.profile.is_frozen || false
    });
  };

  const handleUpdateProfile = async () => {
    if (!selectedUser) return;
    
    try {
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
      
      // Update the local user list with the changes
      setUsers(prev => 
        prev.map(user => 
          user.id === selectedUser.id 
            ? {
                ...user,
                profile: {
                  ...user.profile,
                  username: editedProfile.username || user.profile.username,
                  subscription_type: editedProfile.subscription_type || user.profile.subscription_type,
                  user_tag: editedProfile.user_tag || user.profile.user_tag,
                  is_banned: editedProfile.is_banned,
                  is_muted: editedProfile.is_muted,
                  is_frozen: editedProfile.is_frozen
                }
              }
            : user
        )
      );
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Ошибка обновления",
        description: "Произошла ошибка при обновлении профиля",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
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
      
      setUsers(prev => prev.filter(user => user.id !== selectedUser.id));
      setSelectedUser(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Ошибка удаления",
        description: "Произошла ошибка при удалении пользователя",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.profile.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.profile.user_tag && user.profile.user_tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-purple-500" />
            <span>Панель администратора</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-grow overflow-hidden">
          <Tabs defaultValue="users" className="w-full h-full">
            <TabsList>
              <TabsTrigger value="users" className="flex items-center gap-1">
                <User size={16} />
                <span>Пользователи</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-1">
                <Shield size={16} />
                <span>Настройки</span>
              </TabsTrigger>
              <TabsTrigger value="stats" className="flex items-center gap-1">
                <ChartBar size={16} />
                <span>Статистика</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-1">
                <MessageCircle size={16} />
                <span>Поддержка</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users" className="h-[70vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <Input 
                  placeholder="Поиск пользователей..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Button variant="outline" onClick={fetchUsers}>Обновить</Button>
              </div>
              
              <div className="flex gap-4 flex-grow overflow-hidden">
                <Card className="w-1/2 overflow-hidden flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users size={16} className="text-purple-500" />
                      <span>Список пользователей</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-0 flex-grow overflow-hidden">
                    <ScrollArea className="h-[calc(70vh-130px)] p-4">
                      {loading ? (
                        <div className="flex flex-col gap-2">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center p-2 animate-pulse">
                              <div className="bg-muted rounded-full h-10 w-10 mr-2" />
                              <div className="space-y-2 flex-1">
                                <div className="h-4 bg-muted rounded w-3/4" />
                                <div className="h-3 bg-muted rounded w-1/2" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : filteredUsers.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {filteredUsers.map((user) => (
                            <div
                              key={user.id}
                              className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-accent transition-colors ${
                                selectedUser?.id === user.id ? 'bg-accent' : ''
                              } ${user.profile.is_banned ? 'opacity-70 border-l-4 border-red-500' : ''}
                                ${user.profile.is_muted ? 'border-l-4 border-orange-500' : ''}
                                ${user.profile.is_frozen ? 'border-l-4 border-blue-500' : ''}`}
                              onClick={() => handleSelectUser(user)}
                            >
                              <Avatar className="h-10 w-10 mr-2 ring-2 ring-offset-2 ring-offset-background" 
                                style={{
                                  ringColor: user.profile.subscription_type === "admin" ? 'rgb(220, 38, 38)' : 
                                    user.profile.subscription_type === "premium" ? 'rgb(234, 179, 8)' :
                                    user.profile.subscription_type === "business" ? 'rgb(59, 130, 246)' :
                                    user.profile.subscription_type === "sponsor" ? 'rgb(139, 92, 246)' : 'transparent'
                                }}>
                                <AvatarImage src={user.profile.avatar_url || ""} />
                                <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white">
                                  {user.profile.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium">{user.profile.username}</p>
                                  {user.profile.subscription_type && user.profile.subscription_type !== "free" && (
                                    <Badge 
                                      variant="outline" 
                                      className={
                                        user.profile.subscription_type === "admin" ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800" :
                                        user.profile.subscription_type === "premium" ? "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800" :
                                        user.profile.subscription_type === "business" ? "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800" :
                                        user.profile.subscription_type === "sponsor" ? "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800" :
                                        ""
                                      }
                                    >
                                      {user.profile.subscription_type}
                                    </Badge>
                                  )}
                                  {user.profile.is_banned && (
                                    <Badge variant="destructive" className="flex items-center gap-1">
                                      <Ban size={12} />
                                      <span>Забанен</span>
                                    </Badge>
                                  )}
                                  {user.profile.is_muted && (
                                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800 flex items-center gap-1">
                                      <Volume2Off size={12} />
                                      <span>Мут</span>
                                    </Badge>
                                  )}
                                  {user.profile.is_frozen && (
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 flex items-center gap-1">
                                      <Snow size={12} />
                                      <span>Заморожен</span>
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground gap-2">
                                  <span>{formatDate(user.profile.created_at)}</span>
                                  {user.profile.user_tag && (
                                    <Badge variant="secondary" className="text-xs">
                                      {user.profile.user_tag}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">Пользователи не найдены</p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
                
                <Card className="w-1/2 overflow-hidden flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <UserCog size={16} className="text-purple-500" />
                      <span>Управление пользователем</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-grow overflow-auto">
                    <ScrollArea className="h-[calc(70vh-130px)]">
                      {selectedUser ? (
                        <div>
                          <div className="flex items-center mb-6">
                            <Avatar className="h-16 w-16 mr-4 ring-2 ring-offset-2 ring-offset-background" 
                              style={{
                                ringColor: selectedUser.profile.subscription_type === "admin" ? 'rgb(220, 38, 38)' : 
                                  selectedUser.profile.subscription_type === "premium" ? 'rgb(234, 179, 8)' :
                                  selectedUser.profile.subscription_type === "business" ? 'rgb(59, 130, 246)' :
                                  selectedUser.profile.subscription_type === "sponsor" ? 'rgb(139, 92, 246)' : 'transparent'
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
                                  <Volume2Off size={18} className="text-orange-500" />
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
                                  <Snow size={18} className="text-blue-500" />
                                  <div>
                                    <Label htmlFor="freeze-switch">Заморозить аккаунт</Label>
                                    <p className="text-sm text-muted-foreground">Аккаунт будет временно недоступен</p>
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
                            
                            <div className="flex gap-2 mt-6">
                              <Button 
                                className="flex-1"
                                onClick={handleUpdateProfile}
                                variant="default"
                              >
                                Сохранить изменения
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="destructive" size="icon">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Удаление пользователя</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.
                                      Все данные пользователя будут удалены из системы.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Отмена</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteUser} className="bg-red-600 hover:bg-red-700">
                                      Удалить
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <UserCog className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                          <p className="text-muted-foreground">Выберите пользователя из списка</p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings size={16} className="text-purple-500" />
                    <span>Настройки сайта</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertOctagon size={18} className="text-orange-500" />
                        <div>
                          <Label htmlFor="maintenance-mode">Режим обслуживания</Label>
                          <p className="text-sm text-muted-foreground">Временно закрыть доступ к сайту</p>
                        </div>
                      </div>
                      <Switch id="maintenance-mode" />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <UserPlus size={18} className="text-green-500" />
                        <div>
                          <Label htmlFor="registration">Регистрация новых пользователей</Label>
                          <p className="text-sm text-muted-foreground">Разрешить регистрацию новых пользователей</p>
                        </div>
                      </div>
                      <Switch id="registration" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <MessageSquare size={18} className="text-blue-500" />
                        <div>
                          <Label htmlFor="comments">Комментарии</Label>
                          <p className="text-sm text-muted-foreground">Разрешить комментарии на сайте</p>
                        </div>
                      </div>
                      <Switch id="comments" defaultChecked />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart size={16} className="text-purple-500" />
                    <span>Статистика сайта</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Users size={24} className="text-purple-600 dark:text-purple-300" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Пользователей</p>
                        <h3 className="text-2xl font-bold">{users.length}</h3>
                      </div>
                    </div>
                    
                    <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                        <Crown size={24} className="text-yellow-600 dark:text-yellow-300" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Премиум подписок</p>
                        <h3 className="text-2xl font-bold">
                          {users.filter(u => u.profile.subscription_type && u.profile.subscription_type !== "free").length}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="bg-card border rounded-lg p-4 flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <FileText size={24} className="text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Активных тем</p>
                        <h3 className="text-2xl font-bold">-</h3>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="support">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle size={16} className="text-purple-500" />
                    <span>Сообщения поддержки</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground/30" />
                    <p className="text-muted-foreground">Функционал управления поддержкой находится в разработке</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { 
  Users, 
  MessageSquare, 
  Settings,
  Volume2Off,
  Snow,
  UserCog,
  AlertOctagon,
  UserPlus,
  Crown,
  FileText,
  ChartBar,
  BarChart
} from "lucide-react";

export default AdminPanel;
