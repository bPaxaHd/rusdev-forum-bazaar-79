
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserProfile } from "@/types/auth";
import { SupportMessage, UserWithMessages } from "./types";
import { getUserSupportDialog, markSupportMessageAsRead, sendAdminSupportMessage } from "@/utils/db-helpers";
import { formatDate } from "./utils";

interface SupportTabProps {
  supportUsers: UserWithMessages[];
  loadingSupport: boolean;
  supportSearchQuery: string;
  setSupportSearchQuery: (query: string) => void;
  fetchSupportUsers: () => Promise<void>;
}

const SupportTab: React.FC<SupportTabProps> = ({
  supportUsers,
  loadingSupport,
  supportSearchQuery,
  setSupportSearchQuery,
  fetchSupportUsers
}) => {
  const [selectedSupportUser, setSelectedSupportUser] = useState<UserProfile | null>(null);
  const [userMessages, setUserMessages] = useState<SupportMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState("");
  const { toast } = useToast();

  const handleSelectSupportUser = async (profile: UserProfile) => {
    setSelectedSupportUser(profile);
    
    try {
      const messages = await getUserSupportDialog(profile.id);
      setUserMessages(messages);
      
      const unreadMessages = messages.filter(msg => !msg.is_admin && !msg.read);
      
      for (const msg of unreadMessages) {
        await markSupportMessageAsRead(msg.id);
      }
      
      // This would need to update the supportUsers state in the parent component
      // For now just refresh the entire list
      fetchSupportUsers();
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

  return (
    <>
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
              ) : supportUsers.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {supportUsers.map((user) => (
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
    </>
  );
};

export default SupportTab;
