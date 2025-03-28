
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

  const plans: PricingPlan[] = [
    {
      name: "Free",
      price: "₽0",
      description: "Базовый доступ к сообществу разработчиков",
      features: [
        {
          text: "Просмотр форума",
          included: true
        },
        {
          text: "Создание тем",
          included: true
        },
        {
          text: "Базовый профиль",
          included: true
        },
        {
          text: "Просмотр вакансий",
          included: true
        },
        {
          text: "Приоритетная поддержка",
          included: false
        },
        {
          text: "Расширенный доступ к курсам",
          included: false
        }
      ],
      buttonText: "Текущий план",
      icon: <Star className="h-5 w-5" />
    },
    {
      name: "Premium",
      price: "₽899",
      description: "Расширенный доступ и дополнительные возможности",
      features: [
        {
          text: "Просмотр форума",
          included: true
        },
        {
          text: "Создание тем",
          included: true
        },
        {
          text: "Расширенный профиль",
          included: true
        },
        {
          text: "Доступ к премиум курсам",
          included: true
        },
        {
          text: "Приоритетная поддержка",
          included: true
        },
        {
          text: "Доступ к закрытым разделам",
          included: true
        }
      ],
      buttonText: "Подписаться",
      popular: true,
      icon: <Crown className="h-5 w-5" />
    },
    {
      name: "Бизнес",
      price: "₽2499",
      description: "Для компаний и команд разработчиков",
      features: [
        {
          text: "Все преимущества Premium",
          included: true
        },
        {
          text: "Размещение вакансий",
          included: true
        },
        {
          text: "API доступ",
          included: true
        },
        {
          text: "Командные аккаунты",
          included: true
        },
        {
          text: "Приоритетный поиск специалистов",
          included: true
        },
        {
          text: "Корпоративные скидки",
          included: true
        }
      ],
      buttonText: "Связаться с нами",
      icon: <Crown className="h-5 w-5" />
    },
    {
      name: "Спонсор",
      price: "₽9999",
      description: "Эксклюзивные возможности и продвижение бренда",
      features: [
        {
          text: "Все преимущества Бизнес",
          included: true
        },
        {
          text: "Брендированный профиль",
          included: true
        },
        {
          text: "Логотип на главной странице",
          included: true
        },
        {
          text: "Приоритетное размещение контента",
          included: true
        },
        {
          text: "Эксклюзивный доступ к новым функциям",
          included: true
        },
        {
          text: "Личный менеджер аккаунта",
          included: true
        }
      ],
      buttonText: "Стать спонсором",
      icon: <Diamond className="h-5 w-5" />
    }
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
            {plans[1].features.map((feature, index) => (
              <TableRow key={index}>
                <TableCell className="font-medium">{feature.text}</TableCell>
                {plans.map(plan => (
                  <TableCell key={`${plan.name}-${index}`} className="text-center">
                    {plan.features[index].included ? 
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
                {plan.features.slice(0, 4).map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    {feature.included ? 
                      <Check className="h-4 w-4 text-green-500" /> : 
                      <span className="h-4 w-4 text-gray-300">—</span>
                    }
                    <span className={!feature.included ? "text-muted-foreground" : ""}>{feature.text}</span>
                  </li>
                ))}
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
