
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
import { 
  X, Check, User, Shield, AlertTriangle, Settings, Users, Bell, BarChart, 
  UserX, PieChart, CreditCard, FileText, Calendar, Activity, Zap, 
  RefreshCw, Search, Filter, ArrowUpDown, Eye, EyeOff, Clock,
  MessageSquare, Pencil, Trash2, Info
} from 'lucide-react';
import { UserProfile, LoginAttempt, SubscriptionLevel } from "@/types/auth";
import CryptoJS from 'crypto-js';

// Зашифрованный пароль администратора (8033343213943354088566815767659607503141163134002992749244944048)
const ENCRYPTED_ADMIN_PASSWORD = "U2FsdGVkX1+ZnXmm8h6h+hUbw4WEQdIFAf2RU+RsGZhUfxEPbPyV3LWyFnAxKgAkfnXf3lxJlt97vp67bT6KEMXCYyM1pFsNZQXgSCqcwR81gd6EGyfSC5+qYLRXeflV";

// Константы для шифрования
const ENCRYPTION_SECRET = "admin_secure_key_2024";

// Интервал обновления статистики в миллисекундах
const STATS_REFRESH_INTERVAL = 30000; // 30 секунд

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
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [loginAttempts, setLoginAttempts] = useState<LoginAttempt[]>([]);
  const [blockedIPs, setBlockedIPs] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    premiumUsers: 0,
    postsToday: 0,
    activeUsers: 0,
    topicsCount: 0,
    commentsCount: 0,
    newUsersThisWeek: 0,
    averageSessionTime: 0
  });
  const [contentStats, setContentStats] = useState({
    totalTopics: 0,
    totalComments: 0, 
    pendingReports: 0,
    topCategories: [
      { name: 'Frontend', count: 0 },
      { name: 'Backend', count: 0 },
      { name: 'Fullstack', count: 0 }
    ]
  });
  
  const { toast } = useToast();
  
  // Эффект для автоматического обновления статистики
  useEffect(() => {
    if (authenticated) {
      fetchUsers();
      fetchLoginAttempts();
      fetchStats();
      fetchContentStats();
      
      // Установка интервала обновления статистики
      const statsInterval = setInterval(() => {
        fetchStats();
        fetchContentStats();
      }, STATS_REFRESH_INTERVAL);
      
      return () => clearInterval(statsInterval);
    }
  }, [authenticated]);
  
  // Эффект для фильтрации пользователей при изменении поиска или фильтра
  useEffect(() => {
    if (users.length > 0) {
      let result = [...users];
      
      // Применяем поиск
      if (userSearch) {
        const searchLower = userSearch.toLowerCase();
        result = result.filter(user => 
          user.username.toLowerCase().includes(searchLower) || 
          user.user_tag?.toLowerCase().includes(searchLower) ||
          user.location?.toLowerCase().includes(searchLower) ||
          user.specialty?.toLowerCase().includes(searchLower)
        );
      }
      
      // Применяем фильтр подписки
      if (userFilter !== 'all') {
        result = result.filter(user => 
          userFilter === 'free' 
            ? !user.subscription_type || user.subscription_type === 'free'
            : user.subscription_type === userFilter
        );
      }
      
      setFilteredUsers(result);
    } else {
      setFilteredUsers([]);
    }
  }, [users, userSearch, userFilter]);
  
  const checkPassword = () => {
    try {
      setLoading(true);
      
      // Расшифровываем пароль для проверки
      const decryptedPassword = CryptoJS.AES.decrypt(
        ENCRYPTED_ADMIN_PASSWORD, 
        ENCRYPTION_SECRET
      ).toString(CryptoJS.enc.Utf8);
      
      if (password === decryptedPassword) {
        setAuthenticated(true);
        toast({
          title: "Успешная аутентификация",
          description: "Вы вошли в панель администратора",
        });
      } else {
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
      setFilteredUsers(data || []);
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
      // В реальном приложении здесь был бы запрос к API для получения статистики
      // для демо используем моковые данные на основе имеющихся пользователей
      
      // Получаем количество тем и комментариев из базы данных
      const { data: topicsData } = await supabase
        .from("topics")
        .select("count")
        .single();
        
      const { data: commentsData } = await supabase
        .from("comments")
        .select("count")
        .single();
      
      // Расчет новых пользователей за последнюю неделю
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      
      const newUsers = users.filter(user => 
        new Date(user.created_at) > weekAgo
      ).length;
      
      setStats({
        totalUsers: users.length,
        premiumUsers: users.filter(user => 
          user.subscription_type && user.subscription_type !== 'free'
        ).length,
        postsToday: Math.floor(Math.random() * 20),
        activeUsers: Math.floor(users.length * 0.7),
        topicsCount: topicsData?.count || Math.floor(Math.random() * 100),
        commentsCount: commentsData?.count || Math.floor(Math.random() * 500),
        newUsersThisWeek: newUsers,
        averageSessionTime: Math.floor(Math.random() * 30) + 10 // 10-40 минут
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };
  
  const fetchContentStats = async () => {
    try {
      // В реальном приложении здесь был бы запрос к API
      // для демо используем моковые данные
      
      // Получаем данные по категориям
      const { data: frontendTopics } = await supabase
        .from("topics")
        .select("count")
        .eq("category", "frontend");
        
      const { data: backendTopics } = await supabase
        .from("topics")
        .select("count")
        .eq("category", "backend");
        
      const { data: fullstackTopics } = await supabase
        .from("topics")
        .select("count")
        .eq("category", "fullstack");
      
      setContentStats({
        totalTopics: stats.topicsCount,
        totalComments: stats.commentsCount,
        pendingReports: Math.floor(Math.random() * 5),
        topCategories: [
          { 
            name: 'Frontend', 
            count: frontendTopics?.count || Math.floor(Math.random() * 40) + 10 
          },
          { 
            name: 'Backend', 
            count: backendTopics?.count || Math.floor(Math.random() * 30) + 5 
          },
          { 
            name: 'Fullstack', 
            count: fullstackTopics?.count || Math.floor(Math.random() * 20) + 3 
          }
        ]
      });
    } catch (error) {
      console.error("Error fetching content stats:", error);
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
      // Запрашиваем подтверждение
      if (!window.confirm("Вы уверены, что хотите удалить этого пользователя? Это действие нельзя отменить.")) {
        return;
      }
      
      setLoading(true);
      
      // В реальном приложении здесь был бы запрос к API для удаления пользователя
      // Удаляем профиль пользователя
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);
        
      if (profileError) {
        throw profileError;
      }
      
      // Удаляем из состояния
      setUsers(users.filter(user => user.id !== userId));
      
      toast({
        title: "Пользователь удален",
        description: "Пользователь был успешно удален из системы",
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Ошибка удаления",
        description: "Не удалось удалить пользователя. Возможно, у него есть связанные данные.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const updateUserSubscription = async (userId: string, subscriptionType: SubscriptionLevel) => {
    try {
      setLoading(true);
      
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
    } finally {
      setLoading(false);
    }
  };
  
  const updateUserSpecialty = async (userId: string, specialty: string) => {
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from("profiles")
        .update({ specialty })
        .eq("id", userId);
      
      if (error) {
        throw error;
      }
      
      // Обновляем пользователя в состоянии
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, specialty } 
          : user
      ));
      
      toast({
        title: "Специализация обновлена",
        description: `Специализация пользователя изменена на ${specialty}`,
      });
    } catch (error) {
      console.error("Error updating specialty:", error);
      toast({
        title: "Ошибка обновления",
        description: "Не удалось обновить специализацию",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Функция для сортировки пользователей
  const sortUsers = (field: keyof UserProfile) => {
    const sorted = [...filteredUsers].sort((a, b) => {
      if (field === 'created_at') {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      
      if (field === 'username') {
        return (a.username || '').localeCompare(b.username || '');
      }
      
      if (field === 'subscription_type') {
        const subA = a.subscription_type || 'free';
        const subB = b.subscription_type || 'free';
        return subA.localeCompare(subB);
      }
      
      return 0;
    });
    
    setFilteredUsers(sorted);
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
  
  const getSpecialtyBadge = (specialty: string | null) => {
    if (!specialty) return null;
    
    switch(specialty) {
      case 'frontend':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Frontend</Badge>;
      case 'backend':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">Backend</Badge>;
      case 'fullstack':
        return <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">Fullstack</Badge>;
      default:
        return <Badge variant="outline">{specialty}</Badge>;
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
  
  const refreshData = () => {
    fetchUsers();
    fetchLoginAttempts();
    fetchStats();
    fetchContentStats();
    
    toast({
      title: "Данные обновлены",
      description: "Все данные успешно обновлены",
    });
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
              <div className="relative flex-1">
                <Input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Введите пароль администратора" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      checkPassword();
                    }
                  }}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </Button>
              </div>
              <Button onClick={checkPassword} disabled={loading}>
                {loading ? "Проверка..." : "Войти"}
              </Button>
            </div>
            
            {loading && <Progress value={100} className="animate-pulse" />}
          </div>
        ) : (
          <div className="flex flex-col h-full overflow-hidden">
            <div className="flex justify-between items-center p-2 border-b">
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-1"
                  onClick={refreshData}
                >
                  <RefreshCw size={14} />
                  <span>Обновить данные</span>
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                Время последнего обновления: {new Date().toLocaleTimeString()}
              </div>
            </div>
            
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
                  <TabsTrigger value="content" className="flex items-center gap-1">
                    <FileText size={14} />
                    <span>Контент</span>
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
                          +{stats.newUsersThisWeek} за последнюю неделю
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
                            {stats.totalUsers > 0 ? Math.floor(stats.premiumUsers / stats.totalUsers * 100) : 0}% от общего числа
                          </p>
                          <PieChart size={16} className="text-muted-foreground" />
                        </div>
                        <Progress 
                          value={stats.totalUsers > 0 ? Math.floor(stats.premiumUsers / stats.totalUsers * 100) : 0} 
                          className="h-1 mt-2" 
                        />
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">
                          Темы форума
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">{stats.topicsCount}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {stats.postsToday} новых сегодня
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
                          {stats.totalUsers > 0 ? Math.floor(stats.activeUsers / stats.totalUsers * 100) : 0}% активности
                        </p>
                        <Progress 
                          value={stats.totalUsers > 0 ? Math.floor(stats.activeUsers / stats.totalUsers * 100) : 0} 
                          className="h-1 mt-2" 
                        />
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                    <Card className="lg:col-span-2">
                      <CardHeader>
                        <CardTitle>Активность по категориям</CardTitle>
                        <CardDescription>
                          Распределение контента по основным категориям
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {contentStats.topCategories.map((category) => (
                            <div key={category.name} className="space-y-2">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className={
                                    category.name === 'Frontend' ? 'bg-green-100' :
                                    category.name === 'Backend' ? 'bg-blue-100' :
                                    'bg-purple-100'
                                  }>
                                    {category.name}
                                  </Badge>
                                  <span className="text-sm font-medium">{category.count} тем</span>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {contentStats.totalTopics > 0 ? 
                                    Math.floor(category.count / contentStats.totalTopics * 100) : 0}%
                                </span>
                              </div>
                              <Progress 
                                value={contentStats.totalTopics > 0 ? 
                                  Math.floor(category.count / contentStats.totalTopics * 100) : 0} 
                              />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Статистика сессий</CardTitle>
                        <CardDescription>
                          Информация о пользовательских сессиях
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Activity size={16} className="text-muted-foreground" />
                                <span className="text-sm">Активные сессии</span>
                              </div>
                              <span className="font-medium">{Math.floor(stats.activeUsers * 0.8)}</span>
                            </div>
                            <Progress value={80} />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock size={16} className="text-muted-foreground" />
                                <span className="text-sm">Среднее время</span>
                              </div>
                              <span className="font-medium">{stats.averageSessionTime} мин</span>
                            </div>
                            <Progress value={stats.averageSessionTime / 60 * 100} />
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Calendar size={16} className="text-muted-foreground" />
                                <span className="text-sm">Новые пользователи</span>
                              </div>
                              <span className="font-medium">{stats.newUsersThisWeek} за неделю</span>
                            </div>
                            <Progress value={stats.newUsersThisWeek / (stats.totalUsers ? stats.totalUsers * 0.1 : 1) * 100} />
                          </div>
                        </div>
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
                              <div className="flex items-center gap-2">
                                {getSubscriptionBadge(user.subscription_type)}
                                {getSpecialtyBadge(user.specialty)}
                              </div>
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
                      <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="flex-1 flex gap-2">
                          <div className="relative flex-1">
                            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                              placeholder="Поиск пользователей..."
                              value={userSearch}
                              onChange={(e) => setUserSearch(e.target.value)}
                              className="pl-8"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Filter size={14} />
                            <select 
                              className="border border-input rounded-md h-10 px-3 py-2 text-sm"
                              value={userFilter}
                              onChange={(e) => setUserFilter(e.target.value)}
                            >
                              <option value="all">Все подписки</option>
                              <option value="free">Бесплатная</option>
                              <option value="premium">Premium</option>
                              <option value="business">Business</option>
                              <option value="sponsor">Sponsor</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => sortUsers('username')}
                            className="flex items-center gap-1"
                          >
                            <ArrowUpDown size={14} />
                            <span>Имя</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => sortUsers('created_at')}
                            className="flex items-center gap-1"
                          >
                            <ArrowUpDown size={14} />
                            <span>Дата</span>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => sortUsers('subscription_type')}
                            className="flex items-center gap-1"
                          >
                            <ArrowUpDown size={14} />
                            <span>Подписка</span>
                          </Button>
                        </div>
                      </div>
                      
                      <ScrollArea className="h-[500px]">
                        <div className="space-y-4">
                          {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => (
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
                                      {user.user_tag && (
                                        <span className="text-xs text-muted-foreground">@{user.user_tag}</span>
                                      )}
                                      {getSubscriptionBadge(user.subscription_type)}
                                    </div>
                                    <div className="text-sm text-muted-foreground mt-1">
                                      Создан: {new Date(user.created_at).toLocaleDateString()}
                                    </div>
                                    <div className="text-sm mt-1 flex flex-wrap gap-2">
                                      {user.location && (
                                        <span className="text-muted-foreground">{user.location}</span>
                                      )}
                                      {getSpecialtyBadge(user.specialty)}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex flex-col gap-3 w-full md:w-auto mt-3 md:mt-0">
                                  <div className="flex flex-wrap gap-2">
                                    <div className="space-y-1 w-full">
                                      <Label className="text-xs">Подписка:</Label>
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
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => updateUserSubscription(user.id, 'sponsor')}
                                          className={user.subscription_type === 'sponsor' ? 'bg-purple-100' : ''}
                                        >
                                          Sponsor
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-1 w-full">
                                      <Label className="text-xs">Специализация:</Label>
                                      <div className="flex items-center">
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => updateUserSpecialty(user.id, 'frontend')}
                                          className={user.specialty === 'frontend' ? 'bg-green-100' : ''}
                                        >
                                          Frontend
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => updateUserSpecialty(user.id, 'backend')}
                                          className={user.specialty === 'backend' ? 'bg-blue-100' : ''}
                                        >
                                          Backend
                                        </Button>
                                        <Button 
                                          variant="outline" 
                                          size="sm"
                                          onClick={() => updateUserSpecialty(user.id, 'fullstack')}
                                          className={user.specialty === 'fullstack' ? 'bg-purple-100' : ''}
                                        >
                                          Fullstack
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex justify-end">
                                    <Button 
                                      variant="destructive" 
                                      size="sm"
                                      className="flex items-center"
                                      onClick={() => deleteUser(user.id)}
                                    >
                                      <UserX size={14} className="mr-1" />
                                      Удалить пользователя
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-8 text-muted-foreground">
                              {userSearch || userFilter !== 'all' ? (
                                <p>Нет пользователей, соответствующих критериям поиска</p>
                              ) : (
                                <p>Нет пользователей в системе</p>
                              )}
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="content" className="h-full overflow-auto p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Статистика контента</CardTitle>
                        <CardDescription>
                          Обзор количества и распределения контента
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-8">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-medium">Всего тем форума</p>
                              <p className="text-2xl font-bold">{contentStats.totalTopics}</p>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                              <FileText size={20} />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-medium">Всего комментариев</p>
                              <p className="text-2xl font-bold">{contentStats.totalComments}</p>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                              <MessageSquare size={20} />
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <p className="text-sm font-medium">Ожидающие модерации</p>
                              <p className="text-2xl font-bold">{contentStats.pendingReports}</p>
                            </div>
                            <div className="p-2 bg-primary/10 rounded-full text-primary">
                              <AlertTriangle size={20} />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Управление контентом</CardTitle>
                        <CardDescription>
                          Функции модерации и регулирования контента
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="rounded-lg border p-3">
                          <h3 className="font-medium">Автоматическая модерация</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Настройка параметров автоматической проверки контента
                          </p>
                          
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <Label htmlFor="profanity-filter">Фильтр нецензурной лексики</Label>
                              <Switch id="profanity-filter" defaultChecked />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label htmlFor="spam-filter">Фильтр спама</Label>
                              <Switch id="spam-filter" defaultChecked />
                            </div>
                            
                            <div className="flex items-center justify-between">
                              <Label htmlFor="link-moderation">Модерация внешних ссылок</Label>
                              <Switch id="link-moderation" defaultChecked />
                            </div>
                          </div>
                        </div>
                        
                        <div className="rounded-lg border p-3">
                          <h3 className="font-medium">Действия с контентом</h3>
                          <p className="text-sm text-muted-foreground mb-3">
                            Управление существующим контентом
                          </p>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <AlertTriangle size={14} />
                              <span>Проверить жалобы</span>
                              {contentStats.pendingReports > 0 && (
                                <Badge className="ml-1 bg-red-500">{contentStats.pendingReports}</Badge>
                              )}
                            </Button>
                            
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Search size={14} />
                              <span>Поиск контента</span>
                            </Button>
                            
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Zap size={14} />
                              <span>Продвижение темы</span>
                            </Button>
                            
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <X size={14} />
                              <span>Скрытие темы</span>
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Популярные темы</CardTitle>
                      <CardDescription>
                        Список самых просматриваемых и обсуждаемых тем
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="rounded-md border">
                        <div className="grid grid-cols-12 gap-2 p-3 border-b font-medium text-sm">
                          <div className="col-span-6">Название</div>
                          <div className="col-span-2">Категория</div>
                          <div className="col-span-1 text-center">Просмотры</div>
                          <div className="col-span-1 text-center">Ответы</div>
                          <div className="col-span-2 text-right">Действия</div>
                        </div>
                        
                        {/* Мок-данные популярных тем */}
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="grid grid-cols-12 gap-2 p-3 border-b hover:bg-muted items-center">
                            <div className="col-span-6 font-medium truncate">
                              {[
                                "Настройка React Router v6 с TypeScript",
                                "Лучшие практики управления состоянием в Redux",
                                "Оптимизация запросов Node.js с использованием MongoDB",
                                "Переход с Angular на React: личный опыт",
                                "Микросервисы vs монолит: что выбрать для проекта"
                              ][i]}
                            </div>
                            <div className="col-span-2">
                              {getSpecialtyBadge([
                                "frontend", "frontend", "backend", "frontend", "fullstack"
                              ][i])}
                            </div>
                            <div className="col-span-1 text-center">
                              {(Math.floor(Math.random() * 1000) + 100)}
                            </div>
                            <div className="col-span-1 text-center">
                              {(Math.floor(Math.random() * 50) + 5)}
                            </div>
                            <div className="col-span-2 flex justify-end gap-1">
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <Eye size={14} />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8">
                                <Pencil size={14} />
                              </Button>
                              <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive">
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
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
                          
                          <Separator />
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Журналирование действий администратора</Label>
                              <p className="text-sm text-muted-foreground">
                                Записывать все действия администратора в системный журнал
                              </p>
                            </div>
                            <Switch id="adminactions" defaultChecked />
                          </div>
                          
                          <Separator />
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Шифрование данных</Label>
                              <p className="text-sm text-muted-foreground">
                                Использовать усиленное шифрование для хранения конфиденциальных данных
                              </p>
                            </div>
                            <Switch id="encryption" defaultChecked />
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
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Изменение пароля администратора</CardTitle>
                        <CardDescription>
                          Обновление пароля для доступа к панели администратора
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="grid gap-2">
                            <Label htmlFor="current-password">Текущий пароль</Label>
                            <Input id="current-password" type="password" />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="new-password">Новый пароль</Label>
                            <Input id="new-password" type="password" />
                          </div>
                          
                          <div className="grid gap-2">
                            <Label htmlFor="confirm-password">Подтвердите новый пароль</Label>
                            <Input id="confirm-password" type="password" />
                          </div>
                          
                          <Button>Изменить пароль</Button>
                          
                          <Alert className="mt-4 bg-blue-50 text-blue-800 border-blue-200">
                            <Info className="h-4 w-4 mr-2" />
                            <AlertDescription>
                              Рекомендуется использовать сложный пароль длиной не менее 12 символов, 
                              содержащий буквы, цифры и специальные символы.
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
                          
                          <Separator />
                          
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label>Уведомления по email</Label>
                              <p className="text-sm text-muted-foreground">
                                Разрешить отправку уведомлений по электронной почте
                              </p>
                            </div>
                            <Switch id="email-notifications" defaultChecked />
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
                          
                          <Alert className="mt-4">
                            <Info className="h-4 w-4 mr-2" />
                            <AlertDescription>
                              Изменение настроек подписок влияет только на новых подписчиков. 
                              Существующие подписчики сохранят текущие условия до окончания платежного периода.
                            </AlertDescription>
                          </Alert>
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

