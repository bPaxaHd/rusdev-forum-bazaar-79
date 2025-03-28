
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Diamond, Star, Award, Rocket } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const PremiumDesktop = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const plans = [
    {
      id: "free",
      name: "Бесплатно",
      description: "Базовые возможности сообщества",
      price: "0 ₽",
      period: "навсегда",
      icon: <Star className="h-6 w-6 text-slate-400" />,
      features: [
        "Доступ к форуму разработчиков",
        "Чтение опубликованных материалов",
        "Базовый профиль пользователя",
      ],
      color: "bg-slate-100 hover:bg-slate-200",
      textColor: "text-slate-700",
      current: true
    },
    {
      id: "premium",
      name: "Премиум",
      description: "Расширенные возможности для активных участников",
      price: "299 ₽",
      period: "в месяц",
      icon: <Crown className="h-6 w-6 text-yellow-500" />,
      features: [
        "Все возможности бесплатного плана",
        "Приоритетная поддержка",
        "Расширенный профиль пользователя",
        "Доступ к закрытым разделам форума",
        "Скидки на образовательные материалы"
      ],
      color: "bg-gradient-to-br from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600",
      textColor: "text-white",
      current: false
    },
    {
      id: "business",
      name: "Бизнес",
      description: "Максимальные возможности для команд и компаний",
      price: "799 ₽",
      period: "в месяц",
      icon: <Diamond className="h-6 w-6 text-blue-500" />,
      features: [
        "Все возможности Премиум плана",
        "Публикация вакансий от компании",
        "Индивидуальное продвижение бренда",
        "Доступ к закрытому сообществу руководителей",
        "Интеграция с корпоративными системами",
        "Приоритетная техническая поддержка 24/7"
      ],
      color: "bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
      textColor: "text-white",
      current: false
    },
    {
      id: "sponsor",
      name: "Спонсор",
      description: "Для тех, кто поддерживает сообщество и его развитие",
      price: "1499 ₽",
      period: "в месяц",
      icon: <Award className="h-6 w-6 text-purple-500" />,
      features: [
        "Все возможности Бизнес плана",
        "Статус официального спонсора сообщества",
        "Логотип на главной странице сайта",
        "Упоминание в рассылке и социальных сетях",
        "Ранний доступ к новым функциям",
        "Возможность внести свой вклад в развитие сообщества",
        "Эксклюзивный бейдж 'Спонсор DevTalk'"
      ],
      color: "bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700",
      textColor: "text-white",
      current: false
    }
  ];

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      toast({
        title: "Требуется авторизация",
        description: "Пожалуйста, войдите в аккаунт чтобы оформить подписку",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    // В реальном приложении здесь была бы интеграция с платежной системой
    toast({
      title: "Демо-режим",
      description: "В демо-версии смена подписки происходит мгновенно без оплаты",
    });

    try {
      // Обновляем тип подписки пользователя в базе данных
      const { error } = await supabase
        .from("profiles")
        .update({ subscription_type: planId })
        .eq("id", user.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Подписка активирована!",
        description: `Вы успешно подписались на план ${planId.toUpperCase()}`,
      });

      // Перезагрузка страницы для обновления статуса подписки
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error("Ошибка при активации подписки:", error);
      toast({
        title: "Ошибка активации",
        description: "Не удалось активировать подписку. Попробуйте позже.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan) => (
        <Card key={plan.id} className={`overflow-hidden border-2 ${plan.id === "sponsor" ? "border-purple-400 shadow-lg" : "border-transparent"}`}>
          <div className={`p-6 ${plan.color} ${plan.textColor}`}>
            <div className="flex justify-between items-center mb-4">
              <div className="bg-white/20 p-2 rounded-full">
                {plan.icon}
              </div>
              {plan.id === "sponsor" && (
                <div className="bg-purple-700 text-white text-xs px-2 py-1 rounded-full animate-pulse">
                  Новинка!
                </div>
              )}
            </div>
            <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
            <p className="text-sm opacity-90 mb-4">{plan.description}</p>
            <div className="mb-4">
              <span className="text-2xl font-bold">{plan.price}</span>
              <span className="text-sm opacity-90"> {plan.period}</span>
            </div>
          </div>
          <div className="p-6">
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <Rocket className="h-4 w-4 mr-2 mt-1 text-emerald-500" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              variant={plan.id === "free" ? "outline" : "default"}
              className="w-full"
              onClick={() => handleSubscribe(plan.id)}
            >
              {plan.id === "free" ? "Текущий план" : "Подписаться"}
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default PremiumDesktop;
