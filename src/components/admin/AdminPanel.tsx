
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserIcon, Shield, ChartBar, MessageSquare, ShieldAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import UsersTab from "./UsersTab";
import StatsTab from "./StatsTab";
import SettingsTab from "./SettingsTab";
import SupportTab from "./SupportTab";
import { User, UserWithMessages } from "./types";
import { getRoleSubscriptionType } from "./utils";
import { getUserRoles } from "@/utils/auth-helpers";
import { getUserSupportDialog, markSupportMessageAsRead } from "@/utils/db-helpers";

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPasswordVerified?: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ open, onOpenChange, isPasswordVerified = false }) => {
  const { user, isCreator, isAdmin } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  
  const [supportUsers, setSupportUsers] = useState<UserWithMessages[]>([]);
  const [loadingSupport, setLoadingSupport] = useState(false);
  const [supportSearchQuery, setSupportSearchQuery] = useState("");
  
  // Don't allow opening if not password verified
  useEffect(() => {
    if (open && !isPasswordVerified) {
      onOpenChange(false);
    }
  }, [open, isPasswordVerified, onOpenChange]);
  
  const fetchUsers = async () => {
    if (!user) return;
    
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
        const roles = await getUserRoles(profile.id);
        
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
  
  const fetchSupportUsers = async () => {
    if (!user) return;
    
    try {
      setLoadingSupport(true);
      
      const { data: messagesData, error: messagesError } = await supabase
        .from("support_messages")
        .select("*")
        .order("created_at", { ascending: false });
        
      if (messagesError) {
        toast({
          title: "Ошибка",
          description: messagesError.message,
          variant: "destructive",
        });
        return;
      }
      
      if (!messagesData || messagesData.length === 0) {
        setSupportUsers([]);
        return;
      }
      
      const userIds = [...new Set(messagesData.map(msg => msg.user_id))];
      
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", userIds);
        
      if (profilesError) {
        toast({
          title: "Ошибка",
          description: profilesError.message,
          variant: "destructive",
        });
        return;
      }
      
      const usersWithMessages: UserWithMessages[] = [];
      
      for (const userId of userIds) {
        const profile = profiles.find(p => p.id === userId);
        
        if (profile) {
          const userMessages = messagesData.filter(msg => msg.user_id === userId);
          const unreadCount = userMessages.filter(msg => !msg.is_admin && !msg.read).length;
          const lastMessage = userMessages[0]?.content || null;
          const lastMessageTime = userMessages[0]?.created_at || null;
          
          usersWithMessages.push({
            profile: {
              id: profile.id,
              username: profile.username,
              avatar_url: profile.avatar_url,
              subscription_type: profile.subscription_type,
              created_at: profile.created_at,
              updated_at: profile.updated_at
            },
            unreadCount,
            lastMessage,
            lastMessageTime
          });
        }
      }
      
      setSupportUsers(usersWithMessages);
    } catch (error: any) {
      console.error("Error fetching support users:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при загрузке пользователей поддержки",
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
      user.profile.username.toLowerCase().includes(query) ||
      (user.profile.user_tag && user.profile.user_tag.toLowerCase().includes(query)) ||
      user.roles.some(role => role.toLowerCase().includes(query))
    );
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);
  
  useEffect(() => {
    if (!supportSearchQuery.trim() || !supportUsers.length) return;
    
    const query = supportSearchQuery.toLowerCase();
    const filtered = supportUsers.filter(user => 
      user.profile.username.toLowerCase().includes(query) ||
      (user.lastMessage && user.lastMessage.toLowerCase().includes(query))
    );
    
    // We're not setting filtered results yet as it would require more state management
    // This would be implemented in a more complete version
  }, [supportSearchQuery, supportUsers]);
  
  useEffect(() => {
    if (open && isPasswordVerified) {
      fetchUsers();
      if (activeTab === "support") {
        fetchSupportUsers();
      }
    }
  }, [open, activeTab, isPasswordVerified]);
  
  useEffect(() => {
    if (open && activeTab === "support" && isPasswordVerified) {
      fetchSupportUsers();
    }
  }, [activeTab, open, isPasswordVerified]);
  
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setEditedProfile({
      ...user.profile,
      subscription_type: user.roles.includes('creator') ? 'creator' : 
                          user.roles.includes('admin') ? 'admin' : 
                          user.roles.includes('moderator') ? 'moderator' : 
                          user.profile.subscription_type
    });
  };
  
  return (
    <Dialog open={open && isPasswordVerified} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-purple-500" />
            <span>Панель администратора</span>
          </DialogTitle>
        </DialogHeader>
        
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
      </DialogContent>
    </Dialog>
  );
};

export default AdminPanel;
