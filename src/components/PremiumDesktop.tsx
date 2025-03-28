
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Diamond } from "lucide-react";
import { Card } from "@/components/ui/card";

const PremiumDesktop = () => {
  const navigate = useNavigate();

  const handleGetPremium = () => {
    navigate("/premium");
  };

  return (
    <div className="px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Подписки DevTalk</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Free Plan */}
        <Card className="p-6 relative overflow-hidden border-muted">
          <div className="mb-4">
            <h3 className="text-xl font-semibold mb-1">Бесплатно</h3>
            <p className="text-muted-foreground text-sm">Базовый доступ</p>
          </div>
          
          <div className="text-3xl font-bold mb-6">0 ₽<span className="text-sm font-normal text-muted-foreground">/месяц</span></div>
          
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <span className="mr-2 text-muted-foreground">✓</span>
              <span>Доступ к базовым разделам форума</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-muted-foreground">✓</span>
              <span>Создание тем и комментариев</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-muted-foreground">✓</span>
              <span>Базовый профиль пользователя</span>
            </li>
          </ul>
          
          <Button className="w-full" variant="outline" onClick={handleGetPremium}>
            Текущий план
          </Button>
        </Card>
        
        {/* Premium Plan */}
        <Card className="p-6 relative overflow-hidden border-amber-300">
          <div className="absolute -right-12 -top-12 bg-amber-300/20 h-32 w-32 rotate-12"></div>
          <div className="mb-4">
            <div className="flex items-center gap-1 mb-1">
              <Crown className="h-5 w-5 text-amber-500" />
              <h3 className="text-xl font-semibold">Premium</h3>
            </div>
            <p className="text-muted-foreground text-sm">Расширенный доступ</p>
          </div>
          
          <div className="text-3xl font-bold mb-6">299 ₽<span className="text-sm font-normal text-muted-foreground">/месяц</span></div>
          
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <span className="mr-2 text-amber-500">✓</span>
              <span>Все возможности базового плана</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-amber-500">✓</span>
              <span>Premium бейдж и подсветка профиля</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-amber-500">✓</span>
              <span>Приоритет в выдаче комментариев</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-amber-500">✓</span>
              <span>Доступ к эксклюзивным разделам форума</span>
            </li>
          </ul>
          
          <Button className="w-full bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 border-none" onClick={handleGetPremium}>
            Оформить Premium
          </Button>
        </Card>
        
        {/* Business Plan */}
        <Card className="p-6 relative overflow-hidden border-purple-300">
          <div className="absolute -right-12 -top-12 bg-purple-300/20 h-32 w-32 rotate-12"></div>
          <div className="mb-4">
            <div className="flex items-center gap-1 mb-1">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <h3 className="text-xl font-semibold">Business</h3>
            </div>
            <p className="text-muted-foreground text-sm">Полный доступ</p>
          </div>
          
          <div className="text-3xl font-bold mb-6">999 ₽<span className="text-sm font-normal text-muted-foreground">/месяц</span></div>
          
          <ul className="space-y-3 mb-6">
            <li className="flex items-start">
              <span className="mr-2 text-purple-500">✓</span>
              <span>Все возможности Premium плана</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-purple-500">✓</span>
              <span>Business бейдж и VIP оформление</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-purple-500">✓</span>
              <span>Доступ к курсам и видеоурокам</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-purple-500">✓</span>
              <span>Персональная консультация ежемесячно</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-purple-500">✓</span>
              <span>Размещение логотипа компании на сайте</span>
            </li>
          </ul>
          
          <Button className="w-full bg-gradient-to-r from-purple-400 to-purple-600 hover:from-purple-500 hover:to-purple-700 border-none" onClick={handleGetPremium}>
            Оформить Business
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default PremiumDesktop;
