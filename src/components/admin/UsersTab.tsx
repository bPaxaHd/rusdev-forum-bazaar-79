import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Users, UserCog, Ban, VolumeX, Snowflake, User as UserIcon } from "lucide-react";
import UserProfileEdit from "./UserProfileEdit";
import { formatDate, getSubscriptionBadgeStyles } from "./utils";
import { User } from "./types";
import { UserProfile } from "@/types/auth";

interface UsersTabProps {
  users: User[];
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedUser: User | null;
  fetchUsers: () => Promise<void>; // This is now correctly typed to return Promise<void>
  handleSelectUser: (user: User) => void;
  editedProfile: Partial<UserProfile>;
  setEditedProfile: (profile: Partial<UserProfile>) => void;
  isCreator: boolean;
  isAdmin: boolean;
}

const UsersTab: React.FC<UsersTabProps> = ({
  users,
  loading,
  searchQuery,
  setSearchQuery,
  selectedUser,
  fetchUsers,
  handleSelectUser,
  editedProfile,
  setEditedProfile,
  isCreator,
  isAdmin
}) => {
  
  return (
    <>
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
              ) : users.length > 0 ? (
                <div className="flex flex-col gap-1">
                  {users.map((user) => (
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
                        borderColor: user.roles.includes('creator') ? 'rgb(139, 92, 246)' : 
                          user.roles.includes('admin') ? 'rgb(220, 38, 38)' :
                          user.roles.includes('moderator') ? 'rgb(34, 197, 94)' :
                          user.profile.subscription_type === "premium" ? 'rgb(234, 179, 8)' :
                          user.profile.subscription_type === "business" ? 'rgb(59, 130, 246)' :
                          user.profile.subscription_type === "sponsor" ? 'rgb(139, 92, 246)' : 'transparent',
                        borderWidth: user.roles.length > 0 || user.profile.subscription_type !== "free" ? '2px' : '0',
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
                          
                          {/* Role/Subscription badges */}
                          {user.roles.includes('creator') && (
                            <Badge 
                              variant="outline" 
                              className={getSubscriptionBadgeStyles('creator')}
                            >
                              Создатель
                            </Badge>
                          )}
                          
                          {user.roles.includes('admin') && !user.roles.includes('creator') && (
                            <Badge 
                              variant="outline" 
                              className={getSubscriptionBadgeStyles('admin')}
                            >
                              Админ
                            </Badge>
                          )}
                          
                          {user.roles.includes('moderator') && !user.roles.includes('admin') && !user.roles.includes('creator') && (
                            <Badge 
                              variant="outline" 
                              className={getSubscriptionBadgeStyles('moderator')}
                            >
                              Модератор
                            </Badge>
                          )}
                          
                          {user.profile.subscription_type && 
                           user.profile.subscription_type !== "free" && 
                           !user.roles.includes('creator') && 
                           !user.roles.includes('admin') && 
                           !user.roles.includes('moderator') && (
                            <Badge 
                              variant="outline" 
                              className={getSubscriptionBadgeStyles(user.profile.subscription_type)}
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
            {selectedUser ? (
              <UserProfileEdit 
                selectedUser={selectedUser}
                editedProfile={editedProfile}
                setEditedProfile={setEditedProfile}
                isCreator={isCreator}
                isAdmin={isAdmin}
                onFetchUsers={fetchUsers}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full">
                <UserIcon size={48} className="text-muted-foreground/40" />
                <p className="text-muted-foreground mt-4">Выберите пользователя для управления</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UsersTab;
