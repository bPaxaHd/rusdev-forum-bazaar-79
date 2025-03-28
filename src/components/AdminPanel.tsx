
import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  UserPlus, Users, Settings, ListChecks, Package, 
  UserCheck, ShieldAlert, Search, Loader2, RefreshCw, Award
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface User {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    username: string;
    avatar_url: string | null;
    subscription_type?: string | null;
  };
}

interface SubscriptionType {
  id: string;
  name: string;
  badge: string;
  color: string;
}

const subscriptionTypes: SubscriptionType[] = [
  { id: "free", name: "Бесплатный", badge: "FREE", color: "bg-secondary text-secondary-foreground" },
  { id: "premium", name: "Премиум", badge: "PREMIUM", color: "bg-yellow-500 text-black" },
  { id: "business", name: "Бизнес", badge: "BUSINESS", color: "bg-blue-600 text-white" },
  { id: "sponsor", name: "Спонсор", badge: "SPONSOR", color: "bg-purple-600 text-white" }
];

const AdminPanel: React.FC<AdminPanelProps> = ({ open, onOpenChange }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingSubscription, setEditingSubscription] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
  const [savingSubscription, setSavingSubscription] = useState(false);
  const { toast } = useToast();

  // Загрузка пользователей
  useEffect(() => {
    const fetchUsers = async () => {
      if (!open) return;
      
      try {
        setLoading(true);
        
        // First fetch profiles
        const { data: profiles, error: profilesError } = await supabase
          .from("profiles")
          .select(`
            id,
            username,
            avatar_url,
            subscription_type,
            created_at
          `);
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
          return;
        }
        
        // Now get auth users to get emails - need to use admin API for this in production
        // For demo, we'll generate placeholder emails
        const formattedUsers = profiles.map(profile => ({
          id: profile.id,
          email: `user-${profile.id.substring(0, 8)}@example.com`, // Generate placeholder email
          created_at: profile.created_at,
          profile: {
            username: profile.username,
            avatar_url: profile.avatar_url,
            subscription_type: profile.subscription_type || "free"
          }
        }));
        
        setUsers(formattedUsers);
        setFilteredUsers(formattedUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, [open]);

  // Фильтрация пользователей при изменении поискового запроса
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(lowercaseQuery) || 
      user.profile?.username.toLowerCase().includes(lowercaseQuery)
    );
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  // Функция для обновления типа подписки
  const updateSubscription = async () => {
    if (!selectedUser || !selectedSubscription) return;
    
    try {
      setSavingSubscription(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({ subscription_type: selectedSubscription })
        .eq("id", selectedUser.id);
        
      if (error) {
        console.error("Error updating subscription:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось обновить тип подписки",
          variant: "destructive",
        });
        return;
      }
      
      // Обновляем локальные данные
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id 
            ? {
                ...user,
                profile: {
                  ...user.profile!,
                  subscription_type: selectedSubscription
                }
              } 
            : user
        )
      );
      
      setFilteredUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id 
            ? {
                ...user,
                profile: {
                  ...user.profile!,
                  subscription_type: selectedSubscription
                }
              } 
            : user
        )
      );
      
      toast({
        title: "Подписка обновлена",
        description: `Пользователю ${selectedUser.profile?.username || selectedUser.email} установлена подписка ${getSubscriptionName(selectedSubscription)}`,
      });
      
      setEditingSubscription(false);
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить тип подписки",
        variant: "destructive",
      });
    } finally {
      setSavingSubscription(false);
    }
  };

  // Получить имя подписки по ID
  const getSubscriptionName = (subscriptionId: string): string => {
    const subscription = subscriptionTypes.find(sub => sub.id === subscriptionId);
    return subscription ? subscription.name : "Неизвестно";
  };

  // Получить цвет значка подписки
  const getSubscriptionBadgeClass = (subscriptionId: string): string => {
    const subscription = subscriptionTypes.find(sub => sub.id === subscriptionId);
    return subscription ? subscription.color : "bg-secondary text-secondary-foreground";
  };

  // Получить текст значка подписки
  const getSubscriptionBadgeText = (subscriptionId: string): string => {
    const subscription = subscriptionTypes.find(sub => sub.id === subscriptionId);
    return subscription ? subscription.badge : "FREE";
  };

  // Форматирование даты
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <ShieldAlert size={20} />
            Панель Администратора
          </DialogTitle>
          <DialogDescription>
            Управляйте пользователями и настройками форума DevTalk
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users" className="flex items-center gap-1.5">
              <Users size={14} />
              Пользователи
            </TabsTrigger>
            <TabsTrigger value="subscriptions" className="flex items-center gap-1.5">
              <Award size={14} />
              Подписки
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1.5">
              <Settings size={14} />
              Настройки
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                <Input 
                  className="pl-9" 
                  placeholder="Поиск пользователей..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 500);
                  // Здесь можно добавить реальное обновление данных
                }}
              >
                <RefreshCw size={16} />
              </Button>
            </div>
            
            {loading ? (
              <div className="space-y-2">
                {Array(5).fill(0).map((_, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
                        <div>
                          <div className="h-4 w-32 bg-muted animate-pulse rounded"></div>
                          <div className="h-3 w-48 bg-muted animate-pulse rounded mt-2"></div>
                        </div>
                      </div>
                      <div className="h-6 w-20 bg-muted animate-pulse rounded"></div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredUsers.length > 0 ? (
              <div className="space-y-2">
                {filteredUsers.map(user => (
                  <Card key={user.id} className="p-4 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => setSelectedUser(user)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.profile?.avatar_url || ""} alt={user.profile?.username || "User"} />
                          <AvatarFallback>{(user.profile?.username?.[0] || user.email[0]).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.profile?.username || "Пользователь"}</div>
                          <div className="text-xs text-muted-foreground">{user.email}</div>
                        </div>
                      </div>
                      <Badge className={getSubscriptionBadgeClass(user.profile?.subscription_type || "free")}>
                        {getSubscriptionBadgeText(user.profile?.subscription_type || "free")}
                      </Badge>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>Пользователи не найдены</p>
                <p className="text-sm mt-1">Попробуйте изменить параметры поиска</p>
              </div>
            )}
            
            {selectedUser && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <UserCheck size={18} />
                      Детали пользователя
                    </CardTitle>
                    <Badge className={getSubscriptionBadgeClass(selectedUser.profile?.subscription_type || "free")}>
                      {getSubscriptionBadgeText(selectedUser.profile?.subscription_type || "free")}
                    </Badge>
                  </div>
                  <CardDescription>
                    Управление данными и подпиской пользователя
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={selectedUser.profile?.avatar_url || ""} alt={selectedUser.profile?.username || "User"} />
                      <AvatarFallback className="text-lg">{(selectedUser.profile?.username?.[0] || selectedUser.email[0]).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <h3 className="text-lg font-medium">{selectedUser.profile?.username || "Пользователь"}</h3>
                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">Зарегистрирован: {formatDate(selectedUser.created_at)}</p>
                    </div>
                    
                    <div>
                      <Button variant="outline" size="sm" onClick={() => {
                        setEditingSubscription(true);
                        setSelectedSubscription(selectedUser.profile?.subscription_type || "free");
                      }}>
                        Изменить подписку
                      </Button>
                    </div>
                  </div>
                  
                  {editingSubscription && (
                    <div className="p-4 border rounded-md bg-muted/30 space-y-3">
                      <h4 className="font-medium">Изменить тип подписки</h4>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={selectedSubscription || "free"} 
                          onValueChange={setSelectedSubscription}
                        >
                          <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Выберите тип подписки" />
                          </SelectTrigger>
                          <SelectContent>
                            {subscriptionTypes.map(sub => (
                              <SelectItem key={sub.id} value={sub.id}>
                                <div className="flex items-center gap-2">
                                  <Badge className={sub.color}>{sub.badge}</Badge>
                                  <span>{sub.name}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Button 
                          onClick={updateSubscription} 
                          disabled={savingSubscription || 
                            selectedSubscription === selectedUser.profile?.subscription_type}
                        >
                          {savingSubscription ? (
                            <>
                              <Loader2 size={16} className="mr-2 animate-spin" />
                              Сохранение...
                            </>
                          ) : "Сохранить"}
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          onClick={() => setEditingSubscription(false)}
                        >
                          Отмена
                        </Button>
                      </div>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Действия</h4>
                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" size="sm">Посмотреть темы</Button>
                      <Button variant="outline" size="sm">Посмотреть комментарии</Button>
                      <Button variant="outline" size="sm" className="text-yellow-600">Заблокировать</Button>
                      <Button variant="outline" size="sm" className="text-red-600">Удалить аккаунт</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="subscriptions">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subscriptionTypes.map(subscription => (
                <Card key={subscription.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{subscription.name}</span>
                      <Badge className={subscription.color}>{subscription.badge}</Badge>
                    </CardTitle>
                    <CardDescription>
                      Настройки подписки {subscription.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-sm font-medium mb-2">Доступные функции:</h4>
                        <ul className="text-sm space-y-1">
                          {subscription.id === "free" && (
                            <>
                              <li className="flex items-center gap-2">
                                <UserCheck size={14} className="text-green-500" />
                                Базовый доступ к форуму
                              </li>
                              <li className="flex items-center gap-2">
                                <UserCheck size={14} className="text-green-500" />
                                Создание тем и комментариев
                              </li>
                            </>
                          )}
                          
                          {subscription.id === "premium" && (
                            <>
                              <li className="flex items-center gap-2">
                                <UserCheck size={14} className="text-green-500" />
                                Все функции Free
                              </li>
                              <li className="flex items-center gap-2">
                                <UserCheck size={14} className="text-green-500" />
                                Отсутствие рекламы
                              </li>
                              <li className="flex items-center gap-2">
                                <UserCheck size={14} className="text-green-500" />
                                Доступ к премиум темам
                              </li>
                            </>
                          )}
                          
                          {subscription.id === "business" && (
                            <>
                              <li className="flex items-center gap-2">
                                <UserCheck size={14} className="text-green-500" />
                                Все функции Premium
                              </li>
                              <li className="flex items-center gap-2">
                                <UserCheck size={14} className="text-green-500" />
                                Приоритетная поддержка
                              </li>
                              <li className="flex items-center gap-2">
                                <UserCheck size={14} className="text-green-500" />
                                Персональные консультации
                              </li>
                            </>
                          )}
                          
                          {subscription.id === "sponsor" && (
                            <>
                              <li className="flex items-center gap-2">
                                <UserCheck size={14} className="text-green-500" />
                                Все функции Business
                              </li>
                              <li className="flex items-center gap-2">
                                <UserCheck size={14} className="text-green-500" />
                                Специальный бейдж спонсора
                              </li>
                              <li className="flex items-center gap-2">
                                <UserCheck size={14} className="text-green-500" />
                                Размещение логотипа на главной странице
                              </li>
                              <li className="flex items-center gap-2">
                                <UserCheck size={14} className="text-green-500" />
                                Упоминание в разделе "Наши спонсоры"
                              </li>
                            </>
                          )}
                        </ul>
                      </div>
                      
                      <Button variant="outline" className="w-full">
                        Настроить функции
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Настройки форума</CardTitle>
                <CardDescription>
                  Управление глобальными настройками форума
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Общие настройки</h3>
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">В разработке...</p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Эта функциональность будет доступна в следующем обновлении
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPanel;
