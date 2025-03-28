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
      
      const frontendCount = frontendTopics && frontendTopics[0] ? frontendTopics[0].count : Math.floor(Math.random() * 40) + 10;
      const backendCount = backendTopics && backendTopics[0] ? backendTopics[0].count : Math.floor(Math.random() * 30) + 5;
      const fullstackCount = fullstackTopics && fullstackTopics[0] ? fullstackTopics[0].count : Math.floor(Math.random() * 20) + 3;
      
      setContentStats({
        totalTopics: stats.topicsCount,
        totalComments: stats.commentsCount,
        pendingReports: Math.floor(Math.random() * 5),
        topCategories: [
          { 
            name: 'Frontend', 
            count: frontendCount
          },
          { 
            name: 'Backend', 
            count: backendCount
          },
          { 
            name: 'Fullstack', 
            count: fullstackCount
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
