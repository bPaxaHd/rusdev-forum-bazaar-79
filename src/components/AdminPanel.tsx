
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
  UserCheck, ShieldAlert, Search, Loader2, RefreshCw, Award,
  Lock, Key, Eye, EyeOff, AlertTriangle
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
  user_tag?: string;
  profile?: {
    username: string;
    avatar_url: string | null;
    subscription_type?: string | null;
    user_tag?: string;
  };
}

interface FailedLoginAttempt {
  id: string;
  ip_address: string;
  timestamp: string;
  attempts: number;
  is_resolved: boolean;
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

const ADMIN_PASSWORD = "^\ag,6DFu5BBF?A^–aXj<zC(]wJl:nhbWS+KSBM8OK6\\P[sdNir8?7/A+m%>2NB\\";
const MAX_LOGIN_ATTEMPTS = 3;

const AdminPanel: React.FC<AdminPanelProps> = ({ open, onOpenChange }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingSubscription, setEditingSubscription] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState<string | null>(null);
  const [savingSubscription, setSavingSubscription] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authAttempts, setAuthAttempts] = useState(() => {
    // Load from localStorage to persist between panel openings
    const savedAttempts = localStorage.getItem('adminAuthAttempts');
    return savedAttempts ? parseInt(savedAttempts, 10) : 0;
  });
  const [lockoutUntil, setLockoutUntil] = useState<Date | null>(() => {
    // Load lockout time from localStorage
    const savedLockout = localStorage.getItem('adminLockoutUntil');
    return savedLockout ? new Date(savedLockout) : null;
  });
  const [clientIp, setClientIp] = useState<string>("unknown");
  const [permanentlyBlocked, setPermanentlyBlocked] = useState(false);
  const [editingUserTag, setEditingUserTag] = useState(false);
  const [userTag, setUserTag] = useState("");
  const [savingUserTag, setSavingUserTag] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState<FailedLoginAttempt[]>([]);
  const [loadingFailedAttempts, setLoadingFailedAttempts] = useState(false);
  const { toast } = useToast();

  // Save auth attempts to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('adminAuthAttempts', authAttempts.toString());
  }, [authAttempts]);

  // Save lockout time to localStorage whenever it changes
  useEffect(() => {
    if (lockoutUntil) {
      localStorage.setItem('adminLockoutUntil', lockoutUntil.toISOString());
    } else {
      localStorage.removeItem('adminLockoutUntil');
    }
  }, [lockoutUntil]);

  useEffect(() => {
    if (open) {
      checkBlockedStatus();
    }
  }, [open]);

  const checkBlockedStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_login_attempts')
        .select('*')
        .eq('ip_address', clientIp)
        .eq('is_resolved', false)
        .gte('attempts', MAX_LOGIN_ATTEMPTS)
        .maybeSingle();
      
      if (error) {
        console.error("Ошибка при проверке статуса блокировки:", error);
        return;
      }
      
      if (data) {
        setPermanentlyBlocked(true);
      } else {
        setPermanentlyBlocked(false);
      }
    } catch (error) {
      console.error("Ошибка при проверке статуса блокировки:", error);
    }
  };

  useEffect(() => {
    if (!open) {
      setAuthenticated(false);
      setPassword("");
      setAuthError("");
      // We no longer reset authAttempts here to persist between panel openings
    }
  }, [open]);

  useEffect(() => {
    if (lockoutUntil && new Date() > lockoutUntil) {
      setLockoutUntil(null);
      setAuthAttempts(0);
    }
  }, [lockoutUntil]);

  const recordFailedLoginAttempt = async () => {
    try {
      // First check if there's an existing record for this IP
      const { data: existingAttempt, error: fetchError } = await supabase
        .from('admin_login_attempts')
        .select('*')
        .eq('ip_address', clientIp)
        .eq('is_resolved', false)
        .maybeSingle();
        
      if (fetchError) {
        console.error("Error checking for existing login attempts:", fetchError);
        return;
      }
      
      if (existingAttempt) {
        // Update existing record
        const newAttempts = existingAttempt.attempts + 1;
        const { error: updateError } = await supabase
          .from('admin_login_attempts')
          .update({ 
            attempts: newAttempts,
            timestamp: new Date().toISOString()
          })
          .eq('id', existingAttempt.id);
          
        if (updateError) {
          console.error("Error updating login attempts:", updateError);
        }
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from('admin_login_attempts')
          .insert({
            ip_address: clientIp,
            attempts: 1,
            timestamp: new Date().toISOString(),
            is_resolved: false
          });
          
        if (insertError) {
          console.error("Error recording login attempt:", insertError);
        }
      }
    } catch (error) {
      console.error("Error recording failed login attempt:", error);
    }
  };

  const fetchFailedLoginAttempts = async () => {
    try {
      setLoadingFailedAttempts(true);
      
      const { data, error } = await supabase
        .from('admin_login_attempts')
        .select('*')
        .order('timestamp', { ascending: false });
        
      if (error) {
        console.error("Ошибка при загрузке списка неудачных попыток:", error);
        return;
      }
      
      setFailedAttempts(data || []);
    } catch (error) {
      console.error("Ошибка при загрузке списка неудачных попыток:", error);
    } finally {
      setLoadingFailedAttempts(false);
    }
  };

  const handleResolveAttempt = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admin_login_attempts')
        .update({ is_resolved: true })
        .eq('id', id);
        
      if (error) {
        console.error("Ошибка при разблокировке пользователя:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось разблокировать пользователя",
          variant: "destructive",
        });
        return;
      }
      
      fetchFailedLoginAttempts();
      
      toast({
        title: "Успешно",
        description: "Пользователь разблокирован",
      });
    } catch (error) {
      console.error("Ошибка при разблокировке пользователя:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось разблокировать пользователя",
        variant: "destructive",
      });
    }
  };

  const authenticateAdmin = async () => {
    if (permanentlyBlocked) {
      setAuthError("Ваш аккаунт заблокирован. Обратитесь к администратору.");
      return;
    }
    
    if (lockoutUntil && new Date() < lockoutUntil) {
      const timeLeft = Math.ceil((lockoutUntil.getTime() - new Date().getTime()) / 1000 / 60);
      setAuthError(`Слишком много попыток. Повторите через ${timeLeft} мин.`);
      return;
    }

    try {
      // Direct string comparison to avoid any string encoding issues
      if (password === ADMIN_PASSWORD) {
        setAuthenticated(true);
        setAuthError("");
        setAuthAttempts(0);
        fetchUsers();
        fetchFailedLoginAttempts();
      } else {
        const newAttempts = authAttempts + 1;
        setAuthAttempts(newAttempts);
        
        await recordFailedLoginAttempt();
        
        if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
          const lockoutTime = new Date();
          lockoutTime.setMinutes(lockoutTime.getMinutes() + 15);
          setLockoutUntil(lockoutTime);
          setAuthError(`Превышено количество попыток. Обратитесь к администратору системы.`);
          setPermanentlyBlocked(true);
        } else {
          setAuthError(`Неверный пароль. Осталось попыток: ${MAX_LOGIN_ATTEMPTS - newAttempts}`);
        }
      }
    } catch (error) {
      console.error("Ошибка аутентификации:", error);
      setAuthError("Произошла ошибка при проверке пароля");
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`
          id,
          username,
          avatar_url,
          subscription_type,
          user_tag,
          created_at
        `);
        
      if (profilesError) {
        console.error("Error fetching profiles:", profilesError);
        return;
      }
      
      const formattedUsers = profiles.map(profile => ({
        id: profile.id,
        email: `user-${profile.id.substring(0, 8)}@example.com`,
        created_at: profile.created_at,
        user_tag: profile.user_tag,
        profile: {
          username: profile.username,
          avatar_url: profile.avatar_url,
          subscription_type: profile.subscription_type || "free",
          user_tag: profile.user_tag
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

  useEffect(() => {
    if (!searchQuery.trim() || !authenticated) {
      setFilteredUsers(users);
      return;
    }
    
    const lowercaseQuery = searchQuery.toLowerCase();
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(lowercaseQuery) || 
      user.profile?.username.toLowerCase().includes(lowercaseQuery) ||
      (user.profile?.user_tag && user.profile.user_tag.toLowerCase().includes(lowercaseQuery))
    );
    
    setFilteredUsers(filtered);
  }, [searchQuery, users, authenticated]);

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

  const updateUserTag = async () => {
    if (!selectedUser) return;
    
    try {
      setSavingUserTag(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({ user_tag: userTag || null })
        .eq("id", selectedUser.id);
        
      if (error) {
        console.error("Error updating user tag:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось обновить тег пользователя",
          variant: "destructive",
        });
        return;
      }
      
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === selectedUser.id 
            ? {
                ...user,
                user_tag: userTag,
                profile: {
                  ...user.profile!,
                  user_tag: userTag
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
                user_tag: userTag,
                profile: {
                  ...user.profile!,
                  user_tag: userTag
                }
              } 
            : user
        )
      );
      
      toast({
        title: "Тег обновлен",
        description: `Пользователю ${selectedUser.profile?.username || selectedUser.email} установлен тег: ${userTag || "Тег удален"}`,
      });
      
      setEditingUserTag(false);
    } catch (error) {
      console.error("Error updating user tag:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить тег пользователя",
        variant: "destructive",
      });
    } finally {
      setSavingUserTag(false);
    }
  };

  const getSubscriptionName = (subscriptionId: string): string => {
    const subscription = subscriptionTypes.find(sub => sub.id === subscriptionId);
    return subscription ? subscription.name : "Неизвестно";
  };

  const getSubscriptionBadgeClass = (subscriptionId: string): string => {
    const subscription = subscriptionTypes.find(sub => sub.id === subscriptionId);
    return subscription ? subscription.color : "bg-secondary text-secondary-foreground";
  };

  const getSubscriptionBadgeText = (subscriptionId: string): string => {
    const subscription = subscriptionTypes.find(sub => sub.id === subscriptionId);
    return subscription ? subscription.badge : "FREE";
  };

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
        {!authenticated ? (
          <div className="py-10 px-4">
            <div className="text-center mb-6">
              <ShieldAlert className="h-12 w-12 mx-auto mb-4 text-orange-500" />
              <h2 className="text-2xl font-bold mb-2">Доступ к панели администратора</h2>
              <p className="text-muted-foreground">
                Пожалуйста, введите пароль администратора для доступа
              </p>
            </div>
            
            {permanentlyBlocked && (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-4 text-center">
                <AlertTriangle className="mx-auto h-10 w-10 mb-2" />
                <h3 className="font-bold">Аккаунт заблокирован</h3>
                <p>Превышено количество попыток входа в систему.</p>
                <p className="text-sm mt-1">Обратитесь к администратору системы для разблокировки.</p>
              </div>
            )}
            
            {authError && !permanentlyBlocked && (
              <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 text-center">
                {authError}
              </div>
            )}
            
            <div className="space-y-4 max-w-sm mx-auto">
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Введите пароль администратора"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  onKeyDown={(e) => e.key === "Enter" && authenticateAdmin()}
                  disabled={permanentlyBlocked || !!(lockoutUntil && new Date() < lockoutUntil)}
                />
                <button 
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={permanentlyBlocked}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              
              <Button 
                className="w-full" 
                onClick={authenticateAdmin}
                disabled={!password.trim() || permanentlyBlocked || !!(lockoutUntil && new Date() < lockoutUntil)}
              >
                <Lock className="mr-2 h-4 w-4" />
                Войти в панель
              </Button>
              
              <div className="text-center text-xs text-muted-foreground mt-6">
                <Key className="inline-block mr-1 h-3 w-3" />
                Доступ только для авторизованных администраторов
              </div>
            </div>
          </div>
        ) : (
          <>
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
                <TabsTrigger value="security" className="flex items-center gap-1.5">
                  <Lock size={14} />
                  Безопасность
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
                    onClick={fetchUsers}
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
                      <Card key={user.id} className="p-4 hover:bg-muted/30 transition-colors cursor-pointer" onClick={() => {
                        setSelectedUser(user);
                        setUserTag(user.profile?.user_tag || "");
                      }}>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={user.profile?.avatar_url || ""} alt={user.profile?.username || "User"} />
                              <AvatarFallback>{(user.profile?.username?.[0] || user.email[0]).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.profile?.username || "Пользователь"}</div>
                              <div className="flex items-center gap-2">
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                                {user.profile?.user_tag && (
                                  <Badge variant="outline" className="text-xs">
                                    {user.profile.user_tag}
                                  </Badge>
                                )}
                              </div>
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
                        Управ��ение данными и подпиской пользователя
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
                          
                          {selectedUser.profile?.user_tag && (
                            <Badge variant="outline" className="mt-2">
                              {selectedUser.profile.user_tag}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <Button variant="outline" size="sm" onClick={() => {
                            setEditingSubscription(true);
                            setSelectedSubscription(selectedUser.profile?.subscription_type || "free");
                          }}>
                            Изменить подписку
                          </Button>
                          
                          <Button variant="outline" size="sm" onClick={() => {
                            setEditingUserTag(true);
                            setUserTag(selectedUser.profile?.user_tag || "");
                          }}>
                            {selectedUser.profile?.user_tag ? "Изменить тег" : "Добавить тег"}
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
                      
                      {editingUserTag && (
                        <div className="p-4 border rounded-md bg-muted/30 space-y-3">
                          <h4 className="font-medium">Изменить тег пользователя</h4>
                          <div className="flex items-center gap-2">
                            <Input 
                              value={userTag} 
                              onChange={(e) => setUserTag(e.target.value)}
                              placeholder="Введите тег пользователя"
                              className="max-w-[300px]"
                            />
                            
                            <Button 
                              onClick={updateUserTag} 
                              disabled={savingUserTag || userTag === selectedUser.profile?.user_tag}
                            >
                              {savingUserTag ? (
                                <>
                                  <Loader2 size={16} className="mr-2 animate-spin" />
                                  Сохранение...
                                </>
                              ) : "Сохранить"}
                            </Button>
                            
                            <Button 
                              variant="ghost" 
                              onClick={() => setEditingUserTag(false)}
                            >
                              Отмена
                            </Button>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Этот тег будет использоваться для идентификации пользователя и выдачи специальных привилегий
                          </p>
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
              
              <TabsContent value="security">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock size={18} />
                      Журнал безопасности
                    </CardTitle>
                    <CardDescription>
                      Неудачные попытки входа в панель администратора
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium">Заблокированные IP-адрес��</h3>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={fetchFailedLoginAttempts}
                          disabled={loadingFailedAttempts}
                        >
                          {loadingFailedAttempts ? (
                            <Loader2 size={14} className="mr-2 animate-spin" />
                          ) : (
                            <RefreshCw size={14} className="mr-2" />
                          )}
                          Обновить
                        </Button>
                      </div>
                      
                      {loadingFailedAttempts ? (
                        <div className="space-y-2">
                          {Array(3).fill(0).map((_, index) => (
                            <Card key={index} className="p-3">
                              <div className="flex items-center justify-between">
                                <div className="h-4 w-40 bg-muted animate-pulse rounded"></div>
                                <div className="h-4 w-20 bg-muted animate-pulse rounded"></div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : failedAttempts.length > 0 ? (
                        <div className="space-y-2">
                          {failedAttempts
                            .filter(attempt => !attempt.is_resolved && attempt.attempts >= MAX_LOGIN_ATTEMPTS)
                            .map(attempt => (
                              <Card key={attempt.id} className="p-3">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="font-medium">{attempt.ip_address}</div>
                                    <div className="text-xs text-muted-foreground">
                                      Попыток: {attempt.attempts} | 
                                      Последняя попытка: {new Date(attempt.timestamp).toLocaleString()}
                                    </div>
                                  </div>
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => handleResolveAttempt(attempt.id)}
                                  >
                                    Разблокировать
                                  </Button>
                                </div>
                              </Card>
                            ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground">
                          <Lock className="h-10 w-10 mx-auto mb-3 opacity-20" />
                          <p>Нет заблокированных IP-адресов</p>
                        </div>
                      )}
                      
                      <Separator className="my-4" />
                      
                      <div>
                        <h3 className="text-sm font-medium mb-3">История попыток входа</h3>
                        <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                          {failedAttempts.length > 0 ? (
                            failedAttempts.map(attempt => (
                              <div key={attempt.id} className="flex items-center justify-between border-b pb-2">
                                <div>
                                  <div className="font-medium">{attempt.ip_address}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {new Date(attempt.timestamp).toLocaleString()}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant={attempt.attempts >= MAX_LOGIN_ATTEMPTS ? "destructive" : "secondary"}>
                                    {attempt.attempts} попыток
                                  </Badge>
                                  {attempt.is_resolved && (
                                    <Badge variant="outline">Разрешено</Badge>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4 text-muted-foreground">
                              <p>История пуста</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminPanel;
