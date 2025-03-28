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
import { Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { UserProfile } from "@/types/auth";
import "../styles/admin.css";

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  profile: {
    id: string;
    username: string;
    avatar_url: string | null;
    subscription_type: string | null;
    user_tag: string | null;
    is_banned?: boolean;
    is_muted?: boolean;
    is_frozen?: boolean;
  };
}

const AdminPanel: React.FC<AdminPanelProps> = ({ open, onOpenChange }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editedProfile, setEditedProfile] = useState<{
    username?: string;
    subscription_type?: string;
    user_tag?: string;
    is_banned?: boolean;
    is_muted?: boolean;
    is_frozen?: boolean;
  }>({});
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select(`
          id,
          username,
          avatar_url,
          subscription_type,
          user_tag,
          is_banned,
          is_muted,
          is_frozen
        `);
      
      if (profileError) {
        console.error("Error fetching profiles:", profileError);
        return;
      }

      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("Error fetching users:", authError);
        return;
      }
      
      const combinedUsers = authData.users.map(authUser => {
        const profile = profiles.find(p => p.id === authUser.id) || {
          id: authUser.id,
          username: 'Unknown',
          avatar_url: null,
          subscription_type: 'free',
          user_tag: null,
          is_banned: false,
          is_muted: false,
          is_frozen: false
        };
        
        return {
          id: authUser.id,
          email: authUser.email || 'No email',
          created_at: authUser.created_at,
          profile: profile
        };
      });
      
      setUsers(combinedUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
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
        .eq("id", selectedUser.profile.id);
      
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
      const { error: authError } = await supabase.auth.admin.deleteUser(
        selectedUser.id
      );
      
      if (authError) {
        toast({
          title: "Ошибка удаления",
          description: authError.message,
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
    (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()))
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
          <DialogTitle>Панель администратора</DialogTitle>
        </DialogHeader>
        
        <div className="flex-grow overflow-hidden">
          <Tabs defaultValue="users" className="w-full h-full">
            <TabsList>
              <TabsTrigger value="users">Пользователи</TabsTrigger>
              <TabsTrigger value="settings">Настройки</TabsTrigger>
              <TabsTrigger value="stats">Статистика</TabsTrigger>
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
                    <CardTitle>Список пользователей</CardTitle>
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
                              className={`flex items-center p-2 rounded-md cursor-pointer hover:bg-accent ${
                                selectedUser?.id === user.id ? 'bg-accent' : ''
                              } ${user.profile.is_banned ? 'opacity-70 border-l-4 border-red-500' : ''}`}
                              onClick={() => handleSelectUser(user)}
                            >
                              <Avatar className="h-10 w-10 mr-2">
                                <AvatarImage src={user.profile.avatar_url || ""} />
                                <AvatarFallback>
                                  {user.profile.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <p className="font-medium">{user.profile.username}</p>
                                  {user.profile.subscription_type && user.profile.subscription_type !== "free" && (
                                    <Badge 
                                      variant="outline" 
                                      className={
                                        user.profile.subscription_type === "admin" ? "bg-red-100 text-red-800 border-red-200" :
                                        user.profile.subscription_type === "premium" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                                        user.profile.subscription_type === "business" ? "bg-blue-100 text-blue-800 border-blue-200" :
                                        user.profile.subscription_type === "sponsor" ? "bg-purple-100 text-purple-800 border-purple-200" :
                                        ""
                                      }
                                    >
                                      {user.profile.subscription_type}
                                    </Badge>
                                  )}
                                  {user.profile.is_banned && (
                                    <Badge variant="destructive">Забанен</Badge>
                                  )}
                                  {user.profile.is_muted && (
                                    <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">Мут</Badge>
                                  )}
                                  {user.profile.is_frozen && (
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Заморожен</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
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
                    <CardTitle>Детали пользователя</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-grow overflow-auto">
                    <ScrollArea className="h-[calc(70vh-130px)]">
                      {selectedUser ? (
                        <div>
                          <div className="flex items-center mb-6">
                            <Avatar className="h-16 w-16 mr-4">
                              <AvatarImage src={selectedUser.profile.avatar_url || ""} />
                              <AvatarFallback>
                                {selectedUser.profile.username.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h3 className="text-xl font-bold">{selectedUser.profile.username}</h3>
                              <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                              <p className="text-xs text-muted-foreground">
                                Зарегистрирован: {formatDate(selectedUser.created_at)}
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
                                <div>
                                  <Label htmlFor="ban-switch">Забанить пользователя</Label>
                                  <p className="text-sm text-muted-foreground">Пользователь не сможет входить в аккаунт</p>
                                </div>
                                <Switch 
                                  id="ban-switch" 
                                  checked={editedProfile.is_banned || false}
                                  onCheckedChange={(checked) => setEditedProfile(prev => ({ ...prev, is_banned: checked }))}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label htmlFor="mute-switch">Мут пользователя</Label>
                                  <p className="text-sm text-muted-foreground">Пользователь не сможет писать комментарии и создавать темы</p>
                                </div>
                                <Switch 
                                  id="mute-switch" 
                                  checked={editedProfile.is_muted || false}
                                  onCheckedChange={(checked) => setEditedProfile(prev => ({ ...prev, is_muted: checked }))}
                                />
                              </div>
                              
                              <div className="flex items-center justify-between">
                                <div>
                                  <Label htmlFor="freeze-switch">Заморозить аккаунт</Label>
                                  <p className="text-sm text-muted-foreground">Аккаунт будет временно недоступен</p>
                                </div>
                                <Switch 
                                  id="freeze-switch" 
                                  checked={editedProfile.is_frozen || false}
                                  onCheckedChange={(checked) => setEditedProfile(prev => ({ ...prev, is_frozen: checked }))}
                                />
                              </div>
                            </div>
                            
                            <div className="flex gap-2 mt-6">
                              <Button 
                                className="flex-1"
                                onClick={handleUpdateProfile}
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
                  <CardTitle>Настройки сайта</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="maintenance-mode">Режим обслуживания</Label>
                        <p className="text-sm text-muted-foreground">Временно закрыть доступ к сайту</p>
                      </div>
                      <Switch id="maintenance-mode" />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="registration">Регистрация новых пользователей</Label>
                        <p className="text-sm text-muted-foreground">Разрешить регистрацию новых пользователей</p>
                      </div>
                      <Switch id="registration" defaultChecked />
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="comments">Комментарии</Label>
                        <p className="text-sm text-muted-foreground">Разрешить комментарии на сайте</p>
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
                  <CardTitle>Статистика сайта</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-card border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Пользователей</p>
                      <h3 className="text-2xl font-bold">{users.length}</h3>
                    </div>
                    
                    <div className="bg-card border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Премиум подписок</p>
                      <h3 className="text-2xl font-bold">
                        {users.filter(u => u.profile.subscription_type && u.profile.subscription_type !== "free").length}
                      </h3>
                    </div>
                    
                    <div className="bg-card border rounded-lg p-4">
                      <p className="text-sm text-muted-foreground">Активных тем</p>
                      <h3 className="text-2xl font-bold">-</h3>
                    </div>
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

export default AdminPanel;
