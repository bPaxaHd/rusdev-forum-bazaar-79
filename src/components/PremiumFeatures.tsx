
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Crown, Star, Diamond } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface PricingPlan {
  name: string;
  price: string;
  description: string;
  features: PlanFeature[];
  buttonText: string;
  popular?: boolean;
  icon: React.ReactNode;
  level: number;
}

const PremiumFeatures = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = React.useState<any>(null);
  const [showChat, setShowChat] = React.useState(false);

  React.useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        setUserProfile(data);
      }
    };
    
    fetchUserProfile();
  }, []);

  const handleChatClick = () => {
    if (!userProfile) {
      toast({
        title: "Необходима авторизация",
        description: "Пожалуйста, войдите в аккаунт, чтобы использовать чат поддержки",
        variant: "destructive",
      });
      return;
    }
    
    navigate("/premium");
    setShowChat(true);
  };

  // Define all features in order of importance
  const allFeatures = [
    { text: "Просмотр форума", minLevel: 0 },
    { text: "Создание тем", minLevel: 0 },
    { text: "Базовый профиль", minLevel: 0 },
    { text: "Просмотр вакансий", minLevel: 0 },
    { text: "Расширенный профиль", minLevel: 1 },
    { text: "Доступ к премиум курсам", minLevel: 1 },
    { text: "Приоритетная поддержка", minLevel: 1 },
    { text: "Доступ к закрытым разделам", minLevel: 1 },
    { text: "Размещение вакансий", minLevel: 2 },
    { text: "API доступ", minLevel: 2 },
    { text: "Командные аккаунты", minLevel: 2 },
    { text: "Приоритетный поиск специалистов", minLevel: 2 },
    { text: "Корпоративные скидки", minLevel: 2 },
    { text: "Брендированный профиль", minLevel: 3 },
    { text: "Логотип на главной странице", minLevel: 3 },
    { text: "Приоритетное размещение контента", minLevel: 3 },
    { text: "Эксклюзивный доступ к новым функциям", minLevel: 3 },
    { text: "Личный менеджер аккаунта", minLevel: 3 },
    { text: "Модерация контента", minLevel: 4 },
    { text: "Управление пользователями", minLevel: 5 },
    { text: "Доступ к административной панели", minLevel: 5 },
    { text: "Все права разработчика", minLevel: 6 }
  ];

  // Create plans with hierarchical features
  const plans: PricingPlan[] = [
    {
      name: "Free",
      price: "₽0",
      description: "Базовый доступ к сообществу разработчиков",
      level: 0,
      features: allFeatures.map(feature => ({
        text: feature.text,
        included: feature.minLevel <= 0
      })),
      buttonText: "Текущий план",
      icon: <Star className="h-5 w-5" />
    },
    {
      name: "Premium",
      price: "₽899",
      description: "Расширенный доступ и дополнительные возможности",
      level: 1,
      features: allFeatures.map(feature => ({
        text: feature.text,
        included: feature.minLevel <= 1
      })),
      buttonText: "Подписаться",
      popular: true,
      icon: <Crown className="h-5 w-5" />
    },
    {
      name: "Бизнес",
      price: "₽2499",
      description: "Для компаний и команд разработчиков",
      level: 2,
      features: allFeatures.map(feature => ({
        text: feature.text,
        included: feature.minLevel <= 2
      })),
      buttonText: "Связаться с нами",
      icon: <Crown className="h-5 w-5" />
    },
    {
      name: "Спонсор",
      price: "₽9999",
      description: "Эксклюзивные возможности и продвижение бренда",
      level: 3,
      features: allFeatures.map(feature => ({
        text: feature.text,
        included: feature.minLevel <= 3
      })),
      buttonText: "Стать спонсором",
      icon: <Diamond className="h-5 w-5" />
    }
  ];

  // Select features to display in the comparison table (to avoid making it too crowded)
  const displayedFeatures = [
    "Просмотр форума",
    "Создание тем",
    "Расширенный профиль",
    "Доступ к премиум курсам",
    "Приоритетная поддержка",
    "Размещение вакансий",
    "API доступ",
    "Логотип на главной странице"
  ];

  return (
    <div className="space-y-10">
      {/* Comparison Table */}
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">План</TableHead>
              {plans.map(plan => (
                <TableHead key={plan.name}>
                  <div className="flex flex-col items-center">
                    <span className="font-bold">{plan.name}</span>
                    <span className="text-muted-foreground text-sm">{plan.price}/мес</span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {/* Feature Rows */}
            {allFeatures.filter(f => displayedFeatures.includes(f.text)).map((feature, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{feature.text}</TableCell>
                {plans.map(plan => (
                  <TableCell key={`${plan.name}-${index}`} className="text-center">
                    {plan.level >= feature.minLevel ? 
                      <Check className="h-5 w-5 text-green-500 mx-auto" /> : 
                      <span className="text-gray-300">—</span>
                    }
                  </TableCell>
                ))}
              </TableRow>
            ))}
            
            {/* Action Row */}
            <TableRow>
              <TableCell></TableCell>
              {plans.map(plan => (
                <TableCell key={`${plan.name}-action`} className="text-center">
                  <Button 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={plan.name !== "Free" ? handleChatClick : undefined}
                    className={plan.popular ? "bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600" : ""}
                  >
                    {plan.buttonText}
                  </Button>
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
      
      {/* Plan Cards for Mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:hidden">
        {plans.map((plan) => (
          <Card key={plan.name} className={`border-2 ${plan.popular ? 'border-blue-200 dark:border-blue-900' : ''}`}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">{plan.price}<span className="text-base font-normal text-muted-foreground">/мес</span></div>
              <ul className="space-y-2">
                {plan.features.filter(f => f.included).slice(0, 6).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>{feature.text}</span>
                  </li>
                ))}
                {plan.features.filter(f => f.included).length > 6 && (
                  <li className="text-muted-foreground text-sm">
                    + ещё {plan.features.filter(f => f.included).length - 6} функций
                  </li>
                )}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant={plan.popular ? "default" : "outline"}
                className="w-full"
                onClick={plan.name !== "Free" ? handleChatClick : undefined}
              >
                {plan.buttonText}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PremiumFeatures;
