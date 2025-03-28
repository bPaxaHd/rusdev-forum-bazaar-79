
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User as UserIcon, Shield, ChartBar as StatsIcon, MessageSquare as MessageIcon, ShieldAlert as AdminIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import UsersTab from "./UsersTab";
import StatsTab from "./StatsTab";
import SettingsTab from "./SettingsTab";
import SupportTab from "./SupportTab";
import { User } from "./types";
import { getRoleSubscriptionType } from "./utils";
import { getUserRoles } from "@/utils/auth-helpers";

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ open, onOpenChange }) => {
  const { user, isCreator, isAdmin } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  
  // Function to fetch all users
  const fetchUsers = async () => {
    if (!user) return;
    
    try {
      setLoadingUsers(true);
      
      // Fetch all profiles
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
      
      // Create an array to store users with their roles
      const usersWithRoles: User[] = [];
      
      // For each profile, fetch the user's roles
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
  
  // Filter users based on search query
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
  
  // Load users when panel opens
  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);
  
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setEditedProfile({
      ...user.profile,
      // Set the subscription type based on the highest role
      subscription_type: user.roles.includes('creator') ? 'creator' : 
                          user.roles.includes('admin') ? 'admin' : 
                          user.roles.includes('moderator') ? 'moderator' : 
                          user.profile.subscription_type
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AdminIcon className="h-5 w-5 text-purple-500" />
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
                <StatsIcon size={16} />
                <span>Статистика</span>
              </TabsTrigger>
              <TabsTrigger value="support" className="flex items-center gap-1">
                <MessageIcon size={16} />
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
              <SupportTab />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPanel;
