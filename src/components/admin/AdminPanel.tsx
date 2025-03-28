import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldAlert, User, Shield, ChartBar, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
import UsersTab from "./UsersTab";
import SettingsTab from "./SettingsTab";
import StatsTab from "./StatsTab";
import SupportTab from "./SupportTab";
import { UserWithMessages } from "./types";
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
import {
  Trash2,
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
import "../../styles/admin.css";
import RoleCheckbox from "@/components/RoleCheckbox";
import { SupportMessage, getUserSupportDialog, markSupportMessageAsRead, sendAdminSupportMessage, getUnreadSupportMessages } from "@/utils/db-helpers";

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
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isCreator, setIsCreator] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [supportUsers, setSupportUsers] = useState<UserWithMessages[]>([]);
  const [loadingSupport, setLoadingSupport] = useState(false);
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

  const filteredUsers = users.filter(user => 
    user.profile.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.profile.user_tag && user.profile.user_tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredSupportUsers = supportUsers.filter(item =>
    item.profile.username.toLowerCase().includes(supportSearchQuery.toLowerCase()) ||
    (item.lastMessage && item.lastMessage.toLowerCase().includes(supportSearchQuery.toLowerCase()))
  );

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
              <UsersTab 
                users={filteredUsers}
                loading={loading}
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
            
            <TabsContent value="settings">
              <SettingsTab />
            </TabsContent>
            
            <TabsContent value="stats">
              <StatsTab />
            </TabsContent>
            
            <TabsContent value="support" className="h-[70vh] flex flex-col">
              <SupportTab
                supportUsers={filteredSupportUsers}
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
