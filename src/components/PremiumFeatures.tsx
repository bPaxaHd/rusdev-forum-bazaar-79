
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, Crown, Star, Diamond } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

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

  const plans: PricingPlan[] = [
    {
      name: "Free",
      price: "₽0",
      description: "Базовый доступ к сообществу разработчиков",
      features: [
        { text: "Просмотр форума", included: true },
        { text: "Создание тем", included: true },
        { text: "Базовый профиль", included: true },
        { text: "Просмотр вакансий", included: true },
        { text: "Приоритетная поддержка", included: false },
        { text: "Расширенный доступ к курсам", included: false },
      ],
      buttonText: "Текущий план",
      icon: <Star className="h-5 w-5" />
    },
    {
      name: "Premium",
      price: "₽1,200",
      description: "Расширенный доступ и дополнительные возможности",
      features: [
        { text: "Просмотр форума", included: true },
        { text: "Создание тем", included: true },
        { text: "Расширенный профиль", included: true },
        { text: "Доступ к премиум курсам", included: true },
        { text: "Приоритетная поддержка", included: true },
        { text: "Доступ к закрытым разделам", included: true },
      ],
      buttonText: "Подписаться",
      popular: true,
      icon: <Crown className="h-5 w-5" />
    },
    {
      name: "Бизнес",
      price: "₽3,500",
      description: "Для компаний и команд разработчиков",
      features: [
        { text: "Все преимущества Premium", included: true },
        { text: "Размещение вакансий", included: true },
        { text: "API доступ", included: true },
        { text: "Командные аккаунты", included: true },
        { text: "Приоритетный поиск специалистов", included: true },
        { text: "Корпоративные скидки", included: true },
      ],
      buttonText: "Связаться с нами",
      icon: <Crown className="h-5 w-5" />
    },
    {
      name: "Спонсор",
      price: "₽10,000",
      description: "Эксклюзивные возможности и продвижение бренда",
      features: [
        { text: "Все преимущества Бизнес", included: true },
        { text: "Брендированный профиль", included: true },
        { text: "Логотип на главной странице", included: true },
        { text: "Приоритетное размещение контента", included: true },
        { text: "Эксклюзивный доступ к новым функциям", included: true },
        { text: "Личный менеджер аккаунта", included: true },
      ],
      buttonText: "Стать спонсором",
      icon: <Diamond className="h-5 w-5" />
    }
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-4">Премиум возможности</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Выберите план, который подходит именно вам. Все планы включают доступ к сообществу разработчиков, 
          форумам и основным функциям платформы.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((plan, index) => (
          <Card key={index} className={`flex flex-col h-full ${plan.popular ? 'border-primary shadow-md relative' : ''}`}>
            {plan.popular && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="bg-primary text-primary-foreground text-xs font-semibold px-3 py-1 rounded-full">
                  Популярный выбор
                </span>
              </div>
            )}
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{plan.name}</CardTitle>
                {plan.icon}
              </div>
              <div className="mt-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.name !== "Free" && <span className="text-muted-foreground">/месяц</span>}
              </div>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2.5">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <span className={`mr-2 mt-0.5 ${feature.included ? 'text-primary' : 'text-muted-foreground'}`}>
                      {feature.included ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <span className="block h-4 w-4">-</span>
                      )}
                    </span>
                    <span className={!feature.included ? 'text-muted-foreground' : ''}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant={plan.popular ? "default" : "outline"} 
                className="w-full" 
                onClick={() => navigate("/profile")}
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
