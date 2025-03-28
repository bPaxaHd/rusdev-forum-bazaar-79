
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
import { SupportMessage, getUserSupportDialog, markSupportMessageAsRead, sendAdminSupportMessage, getUnreadSupportMessages } from "@/utils/db-helpers";
import {
  Trash2,
  User,
  Shield,
  Ban,
  Lock,
  UserX,
  ShieldAlert,
  Tag,
  Users,
  Settings,
  UserCog,
  AlertOctagon,
  UserPlus,
  Crown,
  FileText,
  ChartBar,
  BarChart,
  MessageSquare,
  VolumeX,
  Snowflake,
  Send,
  Hammer
} from "lucide-react";
import "../styles/admin.css";
import { useAuth } from "@/contexts/AuthContext";
import RoleCheckbox from "./RoleCheckbox";

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

interface UserWithMessages {
  profile: UserProfile;
  unreadCount: number;
  lastMessage?: string;
  lastMessageTime?: string;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ open, onOpenChange }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const { toast } = useToast();
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);

  const [supportUsers, setSupportUsers] = useState<UserWithMessages[]>([]);
  const [loadingSupport, setLoadingSupport] = useState(false);
  const [selectedSupportUser, setSelectedSupportUser] = useState<UserProfile | null>(null);
  const [userMessages, setUserMessages] = useState<SupportMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const [supportSearchQuery, setSupportSearchQuery] = useState("");

  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchSupportUsers();
      fetchCurrentUserRoles();
    }
  }, [open]);

  const fetchCurrentUserRoles = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
        
      if (error) {
        console.error('Error fetching user roles:', error);
        return;
      }
      
      const roles = data?.map(r => r.role) || [];
      setUserRoles(roles);
      setIsCreator(roles.includes('creator'));
      setIsAdmin(roles.includes('admin'));
      setIsModerator(roles.includes('moderator'));
    } catch (err) {
      console.error('Error fetching user roles:', err);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
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
      
      const formattedUsers = profiles.map(profile => ({
        id: profile.id,
        email: profile.username,
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

  const handleUpdateUserRole = async (userId: string, role: 'user' | 'moderator' | 'admin' | 'creator', addOrRemove: boolean) => {
    if (!user) return;
    
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
    if ((role === 'admin' || role === 'creator') && isModerator && !isAdmin && !isCreator) {
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
      fetchUsers();
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

  const fetchSupportUsers = async () => {
    try {
      setLoadingSupport(true);
      
      const unreadMessages = await getUnreadSupportMessages();
      
      const userIds = [...new Set(unreadMessages.map(msg => msg.user_id))];
      
      if (userIds.length === 0) {
        const { data, error } = await supabase
          .from("support_messages")
          .select("user_id")
          .order("created_at", { ascending: false })
          .limit(50);
          
        if (error) {
          console.error("Error fetching support users:", error);
          return;
        }
        
        if (data) {
          data.forEach(item => {
            if (!userIds.includes(item.user_id)) {
              userIds.push(item.user_id);
            }
          });
        }
      }
      
      const usersWithMessages: UserWithMessages[] = [];
      
      for (const userId of userIds) {
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();
            
          if (!profile) continue;
          
          const { data: unread } = await supabase
            .from("support_messages")
            .select("id")
            .eq("user_id", userId)
            .eq("is_admin", false)
            .eq("read", false);
            
          const unreadCount = unread ? unread.length : 0;
          
          const { data: lastMsg } = await supabase
            .from("support_messages")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: false })
            .limit(1)
            .single();
            
          usersWithMessages.push({
            profile: profile as UserProfile,
            unreadCount,
            lastMessage: lastMsg ? lastMsg.content : undefined,
            lastMessageTime: lastMsg ? lastMsg.created_at : undefined
          });
        } catch (error) {
          console.error(`Error processing user ${userId}:`, error);
        }
      }
      
      usersWithMessages.sort((a, b) => b.unreadCount - a.unreadCount);
      
      setSupportUsers(usersWithMessages);
    } catch (error) {
      console.error("Error fetching support users:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список пользователей поддержки",
        variant: "destructive",
      });
    } finally {
      setLoadingSupport(false);
    }
  };

  const handleSelectSupportUser = async (profile: UserProfile) => {
    setSelectedSupportUser(profile);
    
    try {
      const messages = await getUserSupportDialog(profile.id);
      setUserMessages(messages);
      
      const unreadMessages = messages.filter(msg => !msg.is_admin && !msg.read);
      
      for (const msg of unreadMessages) {
        await markSupportMessageAsRead(msg.id);
      }
      
      setSupportUsers(prev => 
        prev.map(user => 
          user.profile.id === profile.id 
            ? { ...user, unreadCount: 0 } 
            : user
        )
      );
    } catch (error) {
      console.error("Error loading dialog:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить диалог с пользователем",
        variant: "destructive",
      });
    }
  };

  const sendReply = async () => {
    if (!selectedSupportUser || !replyMessage.trim()) return;
    
    try {
      const success = await sendAdminSupportMessage(selectedSupportUser.id, replyMessage);
      
      if (success) {
        const newMessage: SupportMessage = {
          id: crypto.randomUUID(),
          user_id: selectedSupportUser.id,
          content: replyMessage,
          is_admin: true,
          read: false,
          created_at: new Date().toISOString()
        };
        
        setUserMessages(prev => [...prev, newMessage]);
        setReplyMessage("");
        
        toast({
          title: "Сообщение отправлено",
          description: "Ваш ответ успешно отправлен пользователю",
        });
      } else {
        throw new Error("Failed to send message");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => 
    user.profile.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.profile.user_tag && user.profile.user_tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSupportUsers = supportUsers.filter(item =>
    item.profile.username.toLowerCase().includes(supportSearchQuery.toLowerCase()) ||
    (item.lastMessage && item.lastMessage.toLowerCase().includes(supportSearchQuery.toLowerCase()))
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

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
        
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      return data?.map(r => r.role) || [];
    } catch (err) {
      console.error('Error fetching user roles:', err);
      return [];
    }
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
                <MessageSquare size={16} />
                <span>Поддержка</span>
                {supportUsers.reduce((count, user) => count + user.unreadCount, 0) > 0 && (
                  <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                    {supportUsers.reduce((count, user) => count + user.unreadCount, 0)}
                  </Badge>
                )}
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
                              <Avatar className="h-10 w-10 mr-2" style={{
                                borderColor: user.profile.subscription_type === "admin" ? 'rgb(220, 38, 38)' : 
                                  user.profile.subscription_type === "premium" ? 'rgb(234, 179, 8)' :
                                  user.profile.subscription_type === "business" ? 'rgb(59, 130, 246)' :
                                  user.profile.subscription_type === "sponsor" ? 'rgb(139, 92, 246)' : 'transparent',
                                borderWidth: user.profile.subscription_type !== "free" ? '2px' : '0',
                                borderStyle: 'solid'
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
                                      <VolumeX size={12} />
                                      <span>Мут</span>
                                    </Badge>
                                  )}
                                  {user.profile.is_frozen && (
                                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 flex items-center gap-1">
                                      <Snowflake size={12} />
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
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full">
                          <User size={48} className="text-muted-foreground/40" />
                          <p className="text-muted-foreground mt-4">Выберите пользователя для управления</p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="settings">
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-4">Настройки администратора</h3>
                <p className="text-muted-foreground mb-6">
                  Эта страница находится в разработке. Здесь будут доступны общие настройки сайта.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="stats">
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-4">Статистика использования</h3>
                <p className="text-muted-foreground mb-6">
                  Эта страница находится в разработке. Здесь будет отображаться статистика использования сайта.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="support" className="h-[70vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <Input 
                  placeholder="Поиск обращений..." 
                  value={supportSearchQuery}
                  onChange={(e) => setSupportSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
                <Button variant="outline" onClick={fetchSupportUsers}>Обновить</Button>
              </div>
              
              <div className="flex gap-4 flex-grow overflow-hidden">
                <Card className="w-1/3 overflow-hidden flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-purple-500" />
                      <span>Обращения в поддержку</span>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-0 flex-grow overflow-hidden">
                    <ScrollArea className="h-[calc(70vh-130px)] p-4">
                      {loadingSupport ? (
                        <div className="flex flex-col gap-2">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="p-3 border rounded-md animate-pulse">
                              <div className="flex items-center mb-2">
                                <div className="bg-muted rounded-full h-8 w-8 mr-2" />
                                <div className="space-y-2 flex-1">
                                  <div className="h-4 bg-muted rounded w-1/2" />
                                </div>
                              </div>
                              <div className="h-3 bg-muted rounded w-full mb-1" />
                              <div className="h-3 bg-muted rounded w-2/3" />
                            </div>
                          ))}
                        </div>
                      ) : filteredSupportUsers.length > 0 ? (
                        <div className="flex flex-col gap-2">
                          {filteredSupportUsers.map((user) => (
                            <div
                              key={user.profile.id}
                              className={`p-3 border rounded-md cursor-pointer hover:bg-accent transition-colors ${
                                selectedSupportUser?.id === user.profile.id ? 'bg-accent' : ''
                              }`}
                              onClick={() => handleSelectSupportUser(user.profile)}
                            >
                              <div className="flex items-center mb-1">
                                <Avatar className="h-8 w-8 mr-2">
                                  <AvatarImage src={user.profile.avatar_url || ""} />
                                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-blue-500 text-white">
                                    {user.profile.username.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <p className="font-medium text-sm">{user.profile.username}</p>
                                    {user.unreadCount > 0 && (
                                      <Badge variant="destructive" className="ml-1 px-1.5 py-0.5 text-xs">
                                        {user.unreadCount}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {user.lastMessage && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {user.lastMessage}
                                </p>
                              )}
                              {user.lastMessageTime && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {formatDate(user.lastMessageTime)}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">Обращений не найдено</p>
                        </div>
                      )}
                    </ScrollArea>
                  </CardContent>
                </Card>
                
                <Card className="w-2/3 overflow-hidden flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MessageSquare size={16} className="text-purple-500" />
                      <span>Диалог с пользователем</span>
                      {selectedSupportUser && (
                        <span className="ml-2">- {selectedSupportUser.username}</span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="p-0 flex-grow overflow-hidden flex flex-col">
                    {selectedSupportUser ? (
                      <>
                        <ScrollArea className="flex-grow p-4">
                          <div className="flex flex-col gap-3">
                            {userMessages.map((message) => (
                              <div
                                key={message.id}
                                className={`p-3 rounded-lg max-w-[80%] ${
                                  message.is_admin
                                    ? 'bg-primary text-primary-foreground ml-auto'
                                    : 'bg-muted'
                                }`}
                              >
                                <p className="text-sm mb-1">{message.content}</p>
                                <p className="text-xs opacity-70">
                                  {formatDate(message.created_at)}
                                </p>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                        
                        <div className="p-4 border-t">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Напишите сообщение..."
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && sendReply()}
                            />
                            <Button onClick={sendReply} disabled={!replyMessage.trim()}>
                              <Send size={16} className="mr-2" />
                              Отправить
                            </Button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full p-4">
                        <MessageSquare size={48} className="text-muted-foreground/40" />
                        <p className="text-muted-foreground mt-4">Выберите обращение для просмотра диалога</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPanel;
