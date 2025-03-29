import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserIcon, Shield, ChartBar, MessageSquare, ShieldAlert, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { recordLoginAttempt } from "@/utils/db-helpers";
import UsersTab from "./UsersTab";
import StatsTab from "./StatsTab";
import SettingsTab from "./SettingsTab";
import SupportTab from "./SupportTab";
import { User } from "./types";
import { useAuth } from "@/contexts/AuthContext";

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ open, onOpenChange }) => {
  const { toast } = useToast();
  const { isCreator, isAdmin } = useAuth();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editedProfile, setEditedProfile] = useState<any>({});
  
  const [supportUsers, setSupportUsers] = useState<any[]>([]);
  const [loadingSupport, setLoadingSupport] = useState(false);
  const [supportSearchQuery, setSupportSearchQuery] = useState("");
  
  useEffect(() => {
    if (!open) {
      setIsAuthenticated(false);
      setPassword("");
      setAuthError("");
    }
  }, [open]);
  
  const handleAuthenticate = async () => {
    try {
      setIsAuthenticating(true);
      setAuthError("");
      
      const ipAddress = "unknown";
      await recordLoginAttempt(ipAddress);
      
      const correctPassword = "20000304gav";
      
      if (password === correctPassword) {
        setIsAuthenticated(true);
        setPassword("");
        
        fetchUsers();
        fetchSupportUsers();
        
        toast({
          title: "Авторизация успешна",
          description: "Добро пожаловать в панель администратора",
        });
      } else {
        setAuthError("Неверный пароль");
        toast({
          title: "Ошибка авторизации",
          description: "Введен неверный пароль",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error during admin authentication:", error);
      setAuthError("Произошла ошибка при входе");
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  const fetchUsers = async (): Promise<void> => {
    try {
      setLoadingUsers(true);
      
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*");
        
      if (error) {
        toast({
          title: "Ошибка",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      const usersWithRoles: User[] = [];
      
      for (const profile of profiles) {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", profile.id);
          
        const roles = roleData ? roleData.map(r => r.role) : [];
        
        usersWithRoles.push({
          id: profile.id,
          profile: profile as any,
          roles: roles
        });
      }
      
      setUsers(usersWithRoles);
      setFilteredUsers(usersWithRoles);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при загрузке пользователей",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  };
  
  const fetchSupportUsers = async (): Promise<void> => {
    try {
      setLoadingSupport(true);
      
      const { data: messageData, error: messageError } = await supabase
        .from("support_messages")
        .select("user_id, created_at, content, is_admin, read")
        .order("created_at", { ascending: false });
        
      if (messageError) {
        throw messageError;
      }
      
      const userIds = Array.from(new Set(messageData?.map(msg => msg.user_id) || []));
      
      if (userIds.length === 0) {
        setSupportUsers([]);
        return;
      }
      
      const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);
        
      if (profileError) {
        throw profileError;
      }
      
      const supportUsersData = profiles?.map(profile => {
        const userMessages = messageData?.filter(msg => msg.user_id === profile.id) || [];
        const lastMessage = userMessages[0]?.content || "";
        const lastMessageTime = userMessages[0]?.created_at || "";
        const unreadCount = userMessages.filter(msg => !msg.is_admin && !msg.read).length || 0;
        
        return {
          profile,
          lastMessage,
          lastMessageTime,
          unreadCount
        };
      }).sort((a, b) => {
        if (a.unreadCount !== b.unreadCount) {
          return b.unreadCount - a.unreadCount;
        }
        return new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime();
      });
      
      setSupportUsers(supportUsersData || []);
    } catch (error) {
      console.error("Error fetching support users:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при загрузке обращений в поддержку",
        variant: "destructive",
      });
    } finally {
      setLoadingSupport(false);
    }
  };
  
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
      return;
    }
    
    const query = searchQuery.toLowerCase();
    const filtered = users.filter(user => 
      user.profile.username?.toLowerCase().includes(query) ||
      (user.profile.user_tag && user.profile.user_tag.toLowerCase().includes(query)) ||
      user.roles.some(role => role.toLowerCase().includes(query))
    );
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);
  
  const handleSelectUser = (user: User): void => {
    setSelectedUser(user);
    setEditedProfile({
      username: user.profile.username,
      subscription_type: user.profile.subscription_type,
      user_tag: user.profile.user_tag,
      is_banned: user.profile.is_banned,
      is_muted: user.profile.is_muted,
      is_frozen: user.profile.is_frozen
    });
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
        
        {!isAuthenticated ? (
          <div className="py-6">
            <Card className="border-dashed border-2">
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <ShieldAlert className="h-12 w-12 mx-auto mb-2 text-purple-500" />
                  <h3 className="text-lg font-medium">Авторизация администратора</h3>
                  <p className="text-sm text-muted-foreground">
                    Введите пароль администратора для доступа
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="relative">
                    <Input 
                      type="password" 
                      placeholder="Введите пароль администратора"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleAuthenticate()}
                      disabled={isAuthenticating}
                    />
                  </div>
                  
                  {authError && (
                    <div className="flex items-center text-red-500 text-sm">
                      <AlertTriangle className="h-4 w-4 mr-1" />
                      {authError}
                    </div>
                  )}
                  
                  <div className="flex justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => onOpenChange(false)}
                    >
                      Отмена
                    </Button>
                    <Button 
                      onClick={handleAuthenticate}
                      disabled={isAuthenticating || !password.trim()}
                    >
                      {isAuthenticating ? "Проверка..." : "Войти"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="flex-grow overflow-hidden flex flex-col">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col overflow-hidden">
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="users" className="flex items-center gap-1">
                  <UserIcon size={16} />
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
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="users" className="flex-grow overflow-auto">
                <UsersTab 
                  users={filteredUsers}
                  loading={loadingUsers}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  selectedUser={selectedUser}
                  fetchUsers={fetchUsers}
                  handleSelectUser={handleSelectUser}
                  editedProfile={editedProfile}
                  setEditedProfile={setEditedProfile}
                  isCreator={isCreator}
                  isAdmin={isAdmin}
                />
              </TabsContent>
              
              <TabsContent value="settings" className="flex-grow overflow-auto">
                <SettingsTab />
              </TabsContent>
              
              <TabsContent value="stats" className="flex-grow overflow-auto">
                <StatsTab />
              </TabsContent>
              
              <TabsContent value="support" className="flex-grow overflow-auto">
                <SupportTab 
                  supportUsers={supportUsers}
                  loadingSupport={loadingSupport}
                  supportSearchQuery={supportSearchQuery}
                  setSupportSearchQuery={setSupportSearchQuery}
                  fetchSupportUsers={fetchSupportUsers}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminPanel;
