import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SupportChat from "@/components/SupportChat";
type BillingPeriod = "monthly" | "yearly";
const PremiumDesktop = () => {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("monthly");
  const [showChat, setShowChat] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const {
    toast
  } = useToast();

  // Fetch user profile when component mounts
  React.useEffect(() => {
    const fetchUserProfile = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (user) {
        const {
          data
        } = await supabase.from("profiles").select("*").eq("id", user.id).single();
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
        variant: "destructive"
      });
      return;
    }
    setShowChat(true);
  };
  return <div className="space-y-8">
      <div className="flex justify-center mb-8">
        <RadioGroup className="flex items-center bg-card border rounded-lg p-1 gap-1" defaultValue={billingPeriod} onValueChange={value => setBillingPeriod(value as BillingPeriod)}>
          <div className="flex items-center space-x-2 px-3 py-2 rounded cursor-pointer">
            <RadioGroupItem value="monthly" id="monthly" />
            <Label htmlFor="monthly" className="cursor-pointer">Помесячно</Label>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 rounded cursor-pointer">
            <RadioGroupItem value="yearly" id="yearly" />
            <Label htmlFor="yearly" className="cursor-pointer">
              Годовой план <Badge className="ml-1 bg-green-500">-20%</Badge>
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        <Card className="border-2 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>Базовый функционал для начинающих разработчиков</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-6">
              ₽0 <span className="text-base font-normal text-muted-foreground">/мес</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Доступ к основным разделам форума</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Создание тем и комментариев</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Базовый профиль пользователя</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" variant="outline">
              Текущий план
            </Button>
          </CardFooter>
        </Card>

        <Card className="border-2 border-blue-200 dark:border-blue-900 transition-all hover:shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 bg-blue-500 text-white px-3 py-1 text-xs">
            Популярный
          </div>
          <CardHeader>
            <CardTitle>Premium</CardTitle>
            <CardDescription>Расширенный доступ для активных участников</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-6">
              ₽{billingPeriod === "monthly" ? "499" : "399"} <span className="text-base font-normal text-muted-foreground">/мес</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Все возможности Free</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Доступ к премиум-контенту</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Расширенный профиль</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Бейдж Premium</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Приоритетная поддержка</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleChatClick}>Купить</Button>
          </CardFooter>
        </Card>

        <Card className="border-2 border-blue-200 dark:border-blue-900 transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Business</CardTitle>
            <CardDescription>Для команд и профессиональных разработчиков</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-6">
              ₽{billingPeriod === "monthly" ? "999" : "799"} <span className="text-base font-normal text-muted-foreground">/мес</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Все возможности Premium</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Возможность выставления вакансий</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Бейдж Business</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Ранний доступ к новым функциям</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Приватные обсуждения</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={handleChatClick}>Купить</Button>
          </CardFooter>
        </Card>

        <Card className="border-2 border-amber-200 dark:border-amber-900 transition-all hover:shadow-md bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background">
          <CardHeader>
            <CardTitle>Sponsor</CardTitle>
            <CardDescription>Для компаний и спонсоров сообщества</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-6">
              ₽{billingPeriod === "monthly" ? "4999" : "3999"} <span className="text-base font-normal text-muted-foreground">/мес</span>
            </div>
            <ul className="space-y-2 mb-6">
              <li className="flex items-start">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Все возможности Business</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Неограниченное количество аккаунтов</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Бейдж Sponsor</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Размещение логотипа на сайте</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Приоритетный доступ к мероприятиям</span>
              </li>
              <li className="flex items-start">
                <CheckIcon className="mr-2 h-5 w-5 text-green-500" />
                <span>Выделенный менеджер поддержки</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600" onClick={handleChatClick}>Купить</Button>
          </CardFooter>
        </Card>
      </div>
      
      {showChat && userProfile && <Dialog open={showChat} onOpenChange={setShowChat}>
          <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md">
            <SupportChat userId={userProfile.id} onClose={() => setShowChat(false)} />
          </DialogContent>
        </Dialog>}
    </div>;
};
import { Check as CheckIcon } from "lucide-react";
export default PremiumDesktop;