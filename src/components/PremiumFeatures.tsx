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
  const plans: PricingPlan[] = [{
    name: "Free",
    price: "₽0",
    description: "Базовый доступ к сообществу разработчиков",
    features: [{
      text: "Просмотр форума",
      included: true
    }, {
      text: "Создание тем",
      included: true
    }, {
      text: "Базовый профиль",
      included: true
    }, {
      text: "Просмотр вакансий",
      included: true
    }, {
      text: "Приоритетная поддержка",
      included: false
    }, {
      text: "Расширенный доступ к курсам",
      included: false
    }],
    buttonText: "Текущий план",
    icon: <Star className="h-5 w-5" />
  }, {
    name: "Premium",
    price: "₽1,200",
    description: "Расширенный доступ и дополнительные возможности",
    features: [{
      text: "Просмотр форума",
      included: true
    }, {
      text: "Создание тем",
      included: true
    }, {
      text: "Расширенный профиль",
      included: true
    }, {
      text: "Доступ к премиум курсам",
      included: true
    }, {
      text: "Приоритетная поддержка",
      included: true
    }, {
      text: "Доступ к закрытым разделам",
      included: true
    }],
    buttonText: "Подписаться",
    popular: true,
    icon: <Crown className="h-5 w-5" />
  }, {
    name: "Бизнес",
    price: "₽3,500",
    description: "Для компаний и команд разработчиков",
    features: [{
      text: "Все преимущества Premium",
      included: true
    }, {
      text: "Размещение вакансий",
      included: true
    }, {
      text: "API доступ",
      included: true
    }, {
      text: "Командные аккаунты",
      included: true
    }, {
      text: "Приоритетный поиск специалистов",
      included: true
    }, {
      text: "Корпоративные скидки",
      included: true
    }],
    buttonText: "Связаться с нами",
    icon: <Crown className="h-5 w-5" />
  }, {
    name: "Спонсор",
    price: "₽10,000",
    description: "Эксклюзивные возможности и продвижение бренда",
    features: [{
      text: "Все преимущества Бизнес",
      included: true
    }, {
      text: "Брендированный профиль",
      included: true
    }, {
      text: "Логотип на главной странице",
      included: true
    }, {
      text: "Приоритетное размещение контента",
      included: true
    }, {
      text: "Эксклюзивный доступ к новым функциям",
      included: true
    }, {
      text: "Личный менеджер аккаунта",
      included: true
    }],
    buttonText: "Стать спонсором",
    icon: <Diamond className="h-5 w-5" />
  }];
  return;
};
export default PremiumFeatures;