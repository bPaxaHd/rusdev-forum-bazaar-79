
import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SendIcon, XIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  id: string;
  user_id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
  read: boolean;
}

interface SupportChatProps {
  userId: string;
  onClose: () => void;
}

const SupportChat: React.FC<SupportChatProps> = ({
  userId,
  onClose
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Загрузка сообщений
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);

        // Get the messages from the support_messages table
        const {
          data,
          error
        } = await supabase.from("support_messages").select("*").eq("user_id", userId).order("created_at");
        if (error) {
          console.error("Ошибка при загрузке сообщений:", error);
          return;
        }

        // Type assertion to tell TypeScript that the data matches our Message interface
        setMessages(data as Message[]);

        // Получаем информацию о пользователе
        const {
          data: profileData
        } = await supabase.from("profiles").select("*").eq("id", userId).single();
        setUserProfile(profileData);

        // Помечаем сообщения как прочитанные
        if (data && data.length > 0) {
          const unreadMessages = (data as Message[]).filter(msg => !msg.is_admin && !msg.read).map(msg => msg.id);
          if (unreadMessages.length > 0) {
            await supabase.from("support_messages").update({
              read: true
            }).in("id", unreadMessages);
          }
        }
      } catch (error) {
        console.error("Ошибка при загрузке сообщений:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();

    // Подписываемся на новые сообщения
    const channel = supabase.channel(`support_chat_${userId}`).on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'support_messages',
      filter: `user_id=eq.${userId}`
    }, payload => {
      const newMsg = payload.new as Message;
      setMessages(prev => [...prev, newMsg]);

      // Если сообщение от администратора, помечаем его как прочитанное
      if (newMsg.is_admin) {
        supabase.from("support_messages").update({
          read: true
        }).eq("id", newMsg.id);
      }
    }).subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  // Прокрутка вниз при появлении новых сообщений
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth"
    });
  }, [messages]);

  // Отправка сообщения
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const {
        error
      } = await supabase.from("support_messages").insert({
        user_id: userId,
        content: newMessage,
        is_admin: false,
        read: false
      });
      if (error) {
        toast({
          title: "Ошибка",
          description: "Не удалось отправить сообщение",
          variant: "destructive"
        });
        console.error("Ошибка при отправке сообщения:", error);
        return;
      }
      setNewMessage("");
    } catch (error) {
      console.error("Ошибка при отправке сообщения:", error);
    }
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short"
    }).format(date);
  };
  
  return <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Чат с поддержкой</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white hover:bg-white/20">
            <XIcon size={18} />
          </Button>
        </div>
        {userProfile && <div className="flex items-center mt-2">
            <Avatar className="h-8 w-8 mr-2">
              <AvatarImage src={userProfile.avatar_url || ""} />
              <AvatarFallback>{userProfile.username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium text-sm">{userProfile.username || "Пользователь"}</div>
              <Badge variant="outline" className="text-xs mt-1 bg-white/20 text-white border-transparent">
                {userProfile.subscription_type || "free"}
              </Badge>
            </div>
          </div>}
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="h-[300px] overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
          {messages.length === 0 ? <div className="text-center py-8 text-muted-foreground">
              <p>Нет сообщений</p>
              <p className="text-sm mt-1">Напишите свой вопрос, и мы ответим в ближайшее время</p>
            </div> : messages.map(message => <div key={message.id} className={`flex ${message.is_admin ? "justify-start" : "justify-end"}`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${message.is_admin ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700" : "bg-purple-500 text-white"}`}>
                  <div className="text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${message.is_admin ? "text-gray-500 dark:text-gray-400" : "text-purple-100"}`}>
                    {formatDate(message.created_at)}
                  </div>
                </div>
              </div>)}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="p-3 border-t flex items-center gap-2">
        <Input value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Введите сообщение..." className="flex-grow" onKeyDown={e => e.key === "Enter" && sendMessage()} />
        <Button onClick={sendMessage} size="icon" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
          <SendIcon size={16} />
        </Button>
      </CardFooter>
    </Card>;
};

export default SupportChat;
