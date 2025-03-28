
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { MessageCircle, Info, Crown, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface Message {
  id: string;
  content: string;
  is_admin: boolean;
  created_at: string;
  user_id: string;
}

const PremiumHelp = () => {
  const { user, userRoles } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Ошибка при загрузке профиля:', error);
          return;
        }

        setUserProfile(data);
        
        // Загружаем сообщения если пользователь имеет доступ к премиум
        if (hasPremiumAccess()) {
          fetchMessages();
        }
      } catch (error) {
        console.error('Ошибка при загрузке профиля:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  const fetchMessages = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('support_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Ошибка при загрузке сообщений:', error);
        return;
      }

      setMessages(data || []);
      scrollToBottom();
    } catch (error) {
      console.error('Ошибка при загрузке сообщений:', error);
    }
  };

  // Подписка на обновления сообщений в реальном времени
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('support_messages_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_messages',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMessages((prev) => [...prev, payload.new as Message]);
            scrollToBottom();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Необходима авторизация',
        description: 'Пожалуйста, войдите в аккаунт для отправки сообщений',
        variant: 'destructive',
      });
      return;
    }

    if (!hasPremiumAccess()) {
      toast({
        title: 'Доступно только для премиум-пользователей',
        description: 'Для доступа к чату поддержки необходима премиум-подписка',
        variant: 'destructive',
      });
      return;
    }

    if (!newMessage.trim()) return;

    try {
      const { error } = await supabase.from('support_messages').insert({
        user_id: user.id,
        content: newMessage,
        is_admin: false,
        read: false,
      });

      if (error) {
        console.error('Ошибка при отправке сообщения:', error);
        toast({
          title: 'Ошибка',
          description: 'Не удалось отправить сообщение',
          variant: 'destructive',
        });
        return;
      }

      setNewMessage('');
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
    }).format(date);
  };

  // Проверяем, имеет ли пользователь доступ к премиум функциям
  const hasPremiumAccess = () => {
    if (!user) return false;
    
    // Проверяем наличие ролей
    const hasStaffRole = userRoles.some(role => 
      ['creator', 'admin', 'moderator'].includes(role)
    );
    
    // Проверяем тип подписки
    const hasPremiumSubscription = userProfile && 
      userProfile.subscription_type && 
      ['premium', 'business', 'sponsor'].includes(userProfile.subscription_type);
    
    return hasStaffRole || hasPremiumSubscription;
  };

  if (loading) {
    return (
      <div className="container mx-auto py-12 px-4">
        <Skeleton className="h-12 w-3/4 mb-6" />
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <Card className="mx-auto max-w-lg bg-gradient-to-r from-blue-50 to-gray-50 dark:from-gray-900 dark:to-blue-900">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400">
              Премиум поддержка
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Для доступа к премиум-поддержке необходимо авторизоваться
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Info className="h-12 w-12 text-blue-500" />
            <p className="text-muted-foreground">
              Пожалуйста, войдите в аккаунт для доступа к премиум-поддержке
            </p>
            <Button asChild className="mt-4">
              <a href="/login">Войти</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!hasPremiumAccess()) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <Card className="mx-auto max-w-lg bg-gradient-to-r from-amber-50 to-gray-50 dark:from-gray-900 dark:to-amber-900">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-amber-600 dark:text-amber-400">
              Премиум поддержка
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Доступно только для пользователей с премиум-подпиской или особыми правами
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <Crown className="h-12 w-12 text-amber-500" />
            <p className="text-muted-foreground">
              Для доступа к премиум-поддержке необходимо иметь премиум-подписку или особые права
            </p>
            <Button asChild className="mt-4 bg-gradient-to-r from-amber-500 to-amber-600">
              <a href="/premium">Подробнее о премиум-подписке</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            Премиум поддержка
          </h1>
          <p className="text-muted-foreground">
            Задавайте вопросы напрямую команде разработчиков и получайте приоритетные ответы
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle>Ваш диалог с поддержкой</CardTitle>
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500">
                {userProfile?.subscription_type || (userRoles.includes('admin') ? 'admin' : 
                  userRoles.includes('creator') ? 'creator' : 
                  userRoles.includes('moderator') ? 'moderator' : 'premium')}
              </Badge>
            </div>
            <CardDescription>
              Ваши сообщения обрабатываются в приоритетном порядке
            </CardDescription>
            <Separator />
          </CardHeader>
          <CardContent>
            <div className="flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-1">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-4">
                    <MessageCircle className="h-12 w-12 text-blue-500 mb-4 opacity-50" />
                    <p className="text-muted-foreground">
                      Напишите ваш вопрос, и мы ответим в ближайшее время
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.is_admin ? "justify-start" : "justify-end"
                      }`}
                    >
                      <div
                        className={`flex max-w-[80%] ${
                          message.is_admin ? "flex-row" : "flex-row-reverse"
                        }`}
                      >
                        <Avatar className="h-8 w-8 mx-2">
                          {message.is_admin ? (
                            <AvatarImage src="/images/admin-avatar.png" alt="Администратор" />
                          ) : (
                            <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.username} />
                          )}
                          <AvatarFallback>
                            {message.is_admin ? 'A' : userProfile?.username?.charAt(0) || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              message.is_admin
                                ? 'bg-muted text-foreground'
                                : 'bg-primary text-primary-foreground'
                            }`}
                          >
                            {message.content}
                          </div>
                          <div
                            className={`text-xs text-muted-foreground mt-1 ${
                              message.is_admin ? 'text-left' : 'text-right'
                            }`}
                          >
                            {formatDate(message.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <Input
                  placeholder="Введите сообщение..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PremiumHelp;
