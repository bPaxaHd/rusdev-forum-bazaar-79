
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, Check, User, Shield, AlertTriangle, Settings, Users, Bell, BarChart, UserX, PieChart, CreditCard } from "lucide-react";
import { UserProfile, LoginAttempt, SubscriptionLevel } from "@/types/auth";
import CryptoJS from 'crypto-js';

// Зашифрованный пароль администратора для демонстрации
const ENCRYPTED_ADMIN_PASSWORD = "U2FsdGVkX1/7EV8iCbcbC8wvj5vV5M8NpV1kW3sJJC0Vv/4t0Y7JM5CYEqox2PCpJUf/0wWqHYbCVU55LtZnDQ==";

interface AdminPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ open, onOpenChange }) => {
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    postsToday: 0,
    activeUsers: 0
  });
  
  const { toast } = useToast();
  
  useEffect(() => {
    if (authenticated) {
      fetchUsers();
      fetchLoginAttempts();
      fetchStats();
    }
  }, [authenticated]);
  
  const checkPassword = () => {
    try {
      setLoading(true);
      
      // Расшифровываем пароль для проверки
      const decryptedPassword = CryptoJS.AES.decrypt(
        ENCRYPTED_ADMIN_PASSWORD, 
        "admin_secret_key"
      ).toString(CryptoJS.enc.Utf8);
      
      console.log("Введенный пароль:", password);
      console.log("Ожидаемый пароль:", decryptedPassword);
      
      if (password === decryptedPassword) {
        setAuthenticated(true);
        toast({
          title: "Успешная аутентификация",
          description: "Вы вошли в панель администратора",
        });
      } else {
        console.log("Неверный пароль");
        toast({
          title: "Ошибка аутентификации",
          description: "Неверный пароль администратора",
          variant: "destructive",
        });
        
        // Логируем неудачную попытку входа
        logLoginAttempt();
      }
    } catch (error) {
      console.error("Ошибка при проверке пароля:", error);
      toast({
        title: "Ошибка аутентификации",
        description: "Произошла ошибка при проверке пароля",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const logLoginAttempt = async () => {
    try {
      // Получаем IP-адрес (в демо используем заглушку)
      const ipAddress = "127.0.0.1";
      
      // Проверяем, были ли уже попытки входа с этого IP
      const { data, error } = await supabase
        .from("admin_login_attempts")
        .select("*")
        .eq("ip_address", ipAddress)
        .eq("is_resolved", false);
      
      if (error) {
        console.error("Error checking for existing login attempts:", error);
        return;
      }
      
      if (data && data.length > 0) {
        // Увеличиваем счетчик попыток
        const { error: updateError } = await supabase
          .from("admin_login_attempts")
          .update({ attempts: data[0].attempts + 1 })
          .eq("id", data[0].id);
          
        if (updateError) {
          console.error("Error updating login attempts:", updateError);
        }
      } else {
        // Создаем новую запись
        const { error: insertError } = await supabase
          .from("admin_login_attempts")
          .insert([{ ip_address: ipAddress }]);
          
        if (insertError) {
          console.error("Error inserting login attempt:", insertError);
        }
      }
    } catch (error) {
      console.error("Error logging login attempt:", error);
    }
  };
  
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить список пользователей",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const fetchLoginAttempts = async () => {
    try {
      const { data, error } = await supabase
        .from("admin_login_attempts")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(10);
      
      if (error) {
        throw error;
      }
      
      setLoginAttempts(data || []);
      
      // Выделяем заблокированные IP (более 5 попыток)
      const blocked = data
        .filter(attempt => attempt.attempts >= 5 && !attempt.is_resolved)
        .map(attempt => attempt.ip_address);
      
      setBlockedIPs(blocked);
    } catch (error) {
      console.error("Error fetching login attempts:", error);
    }
  };
  
  const fetchStats = async () => {
    try {
      // В реальном приложении здесь был бы запрос к API
      // для демо используем моковые данные
      setStats({
        totalUsers: users.length,
        premiumUsers: users.filter(user => 
          user.subscription_type && user.subscription_type !== 'free'
        ).length,
        postsToday: 12,
        activeUsers: Math.floor(users.length * 0.7)
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };
  
  const resolveLoginAttempt = async (id: string) => {
    try {
      const { error } = await supabase
        .from("admin_login_attempts")
        .update({ is_resolved: true })
        .eq("id", id);
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Статус обновлен",
        description: "Попытка входа была помечена как разрешенная",
      });
      
      fetchLoginAttempts();
    } catch (error) {
      console.error("Error resolving login attempt:", error);
      toast({
        title: "Ошибка обновления",
        description: "Не удалось обновить статус попытки входа",
        variant: "destructive",
      });
    }
  };
  
  const deleteUser = async (userId: string) => {
    try {
      // В реальном приложении здесь был бы запрос к API для удаления пользователя
      // Для демо просто удаляем из состояния
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: "Пользователь удален",
        description: "Пользователь был успешно удален из системы",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Ошибка удаления",
        description: "Не удалось удалить пользователя",
        variant: "destructive",
      });
    }
  };
  
  const updateUserSubscription = async (userId: string, subscriptionType: SubscriptionLevel) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ subscription_type: subscriptionType })
        .eq("id", userId);
      
      if (error) {
        throw error;
      }
      
      // Обновляем пользователя в состоянии
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, subscription_type: subscriptionType } 
          : user
      ));
      
      toast({
        title: "Подписка обновлена",
        description: `Тип подписки пользователя изменен на ${subscriptionType}`,
      });
    } catch (error) {
      console.error("Error updating subscription:", error);
      toast({
        title: "Ошибка обновления",
        description: "Не удалось обновить тип подписки",
        variant: "destructive",
      });
    }
  };
  
  const getSubscriptionBadge = (type: string | null) => {
    switch(type) {
      case 'premium':
        return <Badge className="bg-yellow-500 text-black">PREMIUM</Badge>;
      case 'business':
        return <Badge className="bg-blue-600 text-white">BUSINESS</Badge>;
      case 'sponsor':
        return <Badge className="bg-purple-600 text-white">SPONSOR</Badge>;
      default:
        return <Badge variant="outline">FREE</Badge>;
    }
  };
  
  const handleClose = () => {
    if (!authenticated) {
      onOpenChange(false);
    } else {
      // Если пользователь аутентифицирован, спрашиваем подтверждение
      if (window.confirm("Вы уверены, что хотите выйти из панели администратора?")) {
        setAuthenticated(false);
        setPassword("");
        onOpenChange(false);
      }
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Панель администратора
          </DialogTitle>
          <DialogDescription>
            Управление пользователями и системными настройками
          </DialogDescription>
        </DialogHeader>
        
        {!authenticated ? (
          <div className="space-y-4 py-4">
            <div className="text-center p-4">
              <Shield className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
              <h3 className="text-lg font-medium">Требуется аутентификация</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Пожалуйста, введите пароль администратора для доступа к панели
              </p>
            </div>
            
            <div className="flex gap-2">
              <Input 
                type="password" 
                placeholder="Введите пароль администратора" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    checkPassword();
                  }
                }}
              />
              <Button onClick={checkPassword} disabled={loading}>
                {loading ? "Проверка..." : "Войти"}
              </Button>
            </div>
            
            {loading && <Progress value={100} className="animate-pulse" />}
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            <Tabs 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="flex-1 overflow-hidden flex flex-col"
            >
              <div className="border-b">
                <TabsList className="h-10">
                  <TabsTrigger value="dashboard" className="flex items-center gap-1">
                    <BarChart size={14} />
                    <span>Панель управления</span>
                  </TabsTrigger>
                  <TabsTrigger value="users" className="flex items-center gap-1">
                    <Users size={14} />
                    <span>Пользователи</span>
                  </TabsTrigger>
                  <TabsTrigger value="security" className="flex items-center gap-1">
                    <AlertTriangle size={14} />
                    <span>Безопасность</span>
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="flex items-center gap-1">
                    <Settings size={14} />
                    <span>Настройки</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <div className="flex-1 overflow-hidden">
                <TabsContent value="dashboard" className="h-full overflow-auto p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Всего пользователей
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.totalUsers}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          +{Math.floor(stats.totalUsers * 0.1)} за последний месяц
                        </p>
                        <Progress 
                          value={75} 
                          className="h-1 mt-2" 
                        />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Премиум пользователи
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.premiumUsers}</div>
                        <div className="flex justify-between items-center">
                          <p className="text-xs text-muted-foreground mt-1">
                            {Math.floor(stats.premiumUsers / stats.totalUsers * 100)}% от общего числа
                          </p>
                          <PieChart size={16} className="text-muted-foreground" />
                        </div>
                        <Progress 
                          value={Math.floor(stats.premiumUsers / stats.totalUsers * 100)} 
                          className="h-1 mt-2" 
                        />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Публикации сегодня
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.postsToday}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          +3 за последний час
                        </p>
                        <Progress 
                          value={60} 
                          className="h-1 mt-2" 
                        />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Активные пользователи
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.activeUsers}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {Math.floor(stats.activeUsers / stats.totalUsers * 100)}% активности
                        </p>
                        <Progress 
                          value={Math.floor(stats.activeUsers / stats.totalUsers * 100)} 
                          className="h-1 mt-2" 
                        />
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Последние регистрации</CardTitle>
                        <CardDescription>
                          Список недавно зарегистрированных пользователей
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {users.slice(0, 5).map((user) => (
                            <div 
                              key={user.id} 
                              className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                            >
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.avatar_url || ""} alt={user.username} />
                                  <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="text-sm font-medium">{user.username}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(user.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              {getSubscriptionBadge(user.subscription_type)}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Безопасность</CardTitle>
                        <CardDescription>
                          Последние попытки входа в панель администратора
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {loginAttempts.slice(0, 5).map((attempt) => (
                            <div 
                              key={attempt.id} 
                              className="flex items-center justify-between p-2 rounded-md hover:bg-muted transition-colors"
                            >
                              <div>
                                <p className="text-sm font-medium">IP: {attempt.ip_address}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(attempt.timestamp).toLocaleString()} - {attempt.attempts} попыток
                                </p>
                              </div>
                              {attempt.is_resolved ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                  Разрешено
                                </Badge>
                              ) : (
                                <Badge 
                                  variant="outline" 
                                  className={
                                    attempt.attempts >= 5 
                                      ? "bg-red-100 text-red-800 border-red-200" 
                                      : "bg-yellow-100 text-yellow-800 border-yellow-200"
                                  }
                                >
                                  {attempt.attempts >= 5 ? "Заблокировано" : "Отслеживается"}
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="users" className="h-full overflow-auto p-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Управление пользователями</CardTitle>
                      <CardDescription>
                        Просмотр и управление аккаунтами пользователей
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[400px]">
                        <div className="space-y-4">
                          {users.map((user) => (
                            <div 
                              key={user.id} 
                              className="flex flex-wrap items-center justify-between p-4 rounded-md border"
                            >
                              <div className="flex items-center gap-3 mb-2 md:mb-0">
                                <Avatar>
                                  <AvatarImage src={user.avatar_url || ""} alt={user.username} />
                                  <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-medium">{user.username}</p>
                                    {getSubscriptionBadge(user.subscription_type)}
                                  </div>
                                  <div className="text-sm text-muted-foreground mt-1">
                                    Создан: {new Date(user.created_at).toLocaleDateString()}
                                  </div>
                                  <div className="text-sm mt-1">
                                    {user.location && (
                                      <span className="text-muted-foreground mr-3">{user.location}</span>
                                    )}
                                    {user.specialty && (
                                      <Badge variant="outline">
                                        {user.specialty === 'frontend' ? 'Frontend' : 
                                         user.specialty === 'backend' ? 'Backend' : 
                                         user.specialty === 'fullstack' ? 'Fullstack' : 
                                         user.specialty}
                                      </Badge>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-2 ml-auto">
                                <div className="flex items-center">
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updateUserSubscription(user.id, 'free')}
                                    className={user.subscription_type === 'free' ? 'bg-muted' : ''}
                                  >
                                    Free
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updateUserSubscription(user.id, 'premium')}
                                    className={user.subscription_type === 'premium' ? 'bg-yellow-100' : ''}
                                  >
                                    Premium
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => updateUserSubscription(user.id, 'business')}
                                    className={user.subscription_type === 'business' ? 'bg-blue-100' : ''}
                                  >
                                    Business
                                  </Button>
                                </div>
                                
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  className="ml-2 flex items-center"
                                  onClick={() => deleteUser(user.id)}
                                >
                                  <UserX size={14} className="mr-1" />
                                  Удалить
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="security" className="h-full overflow-auto p-4">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Попытки входа</CardTitle>
                        <CardDescription>
                          Отслеживание и управление попытками входа в панель администратора
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {loginAttempts.length > 0 ? (
                            loginAttempts.map((attempt) => (
                              <div 
                                key={attempt.id} 
                                className="flex items-center justify-between p-4 rounded-md border"
                              >
                                <div>
                                  <p className="font-medium">IP: {attempt.ip_address}</p>
                                  <p className="text-sm text-muted-foreground">
                                    Дата: {new Date(attempt.timestamp).toLocaleString()}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    Количество попыток: {attempt.attempts}
                                  </p>
                                </div>
                                <div>
                                  {attempt.is_resolved ? (
                                    <Badge className="bg-green-100 text-green-800 border-green-200">
                                      <Check size={14} className="mr-1" />
                                      Разрешено
                                    </Badge>
                                  ) : (
                                    <>
                                      <Badge 
                                        className={
                                          attempt.attempts >= 5 
                                            ? "bg-red-100 text-red-800 border-red-200 mb-2" 
                                            : "bg-yellow-100 text-yellow-800 border-yellow-200 mb-2"
                                        }
                                      >
                                        {attempt.attempts >= 5 ? (
                                          <>
                                            <AlertTriangle size={14} className="mr-1" />
                                            Заблокировано
                                          </>
                                        ) : (
                                          <>
                                            <Bell size={14} className="mr-1" />
                                            Отслеживается
                                          </>
                                        )}
                                      </Badge>
                                      <Button 
                                        size="sm" 
                                        onClick={() => resolveLoginAttempt(attempt.id)}
                                        className="ml-2"
                                      >
                                        Разрешить
                                      </Button>
                                    </>
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-4">
                              <p className="text-muted-foreground">Нет данных о попытках входа</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Настройки безопасности</CardTitle>
                        <CardDescription>
                          Настройка параметров безопасности панели администратора
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Двухфакторная аутентификация</Label>
                              <p className="text-sm text-muted-foreground">
                                Требовать двухфакторную аутентификацию для входа администраторов
                              </p>
                            </div>
                            <Switch id="twofa" />
                          </div>
                          
                          <Separator />
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Автоматическая блокировка</Label>
                              <p className="text-sm text-muted-foreground">
                                Автоматически блокировать IP после 5 неудачных попыток входа
                              </p>
                            </div>
                            <Switch id="autoblock" defaultChecked />
                          </div>
                          
                          <Separator />
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Уведомления о входе</Label>
                              <p className="text-sm text-muted-foreground">
                                Отправлять уведомление при входе в панель администратора
                              </p>
                            </div>
                            <Switch id="loginnotifications" />
                          </div>
                          
                          <Alert className="mt-4 bg-yellow-50 text-yellow-800 border-yellow-200">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            <AlertDescription>
                              В демо-режиме настройки безопасности не сохраняются.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="settings" className="h-full overflow-auto p-4">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Основные настройки</CardTitle>
                        <CardDescription>
                          Управление основными настройками платформы
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="site-name">Название сайта</Label>
                            <Input id="site-name" defaultValue="DevTalk" />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="description">Описание сайта</Label>
                            <Input 
                              id="description" 
                              defaultValue="Сообщество разработчиков и площадка для обмена знаниями" 
                            />
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Регистрация пользователей</Label>
                              <p className="text-sm text-muted-foreground">
                                Разрешить новым пользователям регистрироваться на сайте
                              </p>
                            </div>
                            <Switch id="allow-registration" defaultChecked />
                          </div>
                          
                          <Separator />
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Режим обслуживания</Label>
                              <p className="text-sm text-muted-foreground">
                                Закрыть сайт на техническое обслуживание
                              </p>
                            </div>
                            <Switch id="maintenance-mode" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Управление подписками</CardTitle>
                        <CardDescription>
                          Настройка планов подписки для пользователей
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <Label>Premium подписка</Label>
                                <Badge className="bg-yellow-500 text-black">PREMIUM</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Стоимость: $9.99/месяц
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <CreditCard size={14} className="mr-1" />
                                Настройки
                              </Button>
                              <Switch id="premium-active" defaultChecked />
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <Label>Business подписка</Label>
                                <Badge className="bg-blue-600 text-white">BUSINESS</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Стоимость: $19.99/месяц
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <CreditCard size={14} className="mr-1" />
                                Настройки
                              </Button>
                              <Switch id="business-active" defaultChecked />
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <Label>Sponsor подписка</Label>
                                <Badge className="bg-purple-600 text-white">SPONSOR</Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Стоимость: $49.99/месяц
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <CreditCard size={14} className="mr-1" />
                                Настройки
                              </Button>
                              <Switch id="sponsor-active" defaultChecked />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminPanel;
