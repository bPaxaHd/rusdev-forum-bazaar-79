
import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import PremiumDesktop from "@/components/PremiumDesktop";
import PremiumFeatures from "@/components/PremiumFeatures";
import SupportChat from "@/components/SupportChat";
import { supabase } from "@/integrations/supabase/client";

const Premium = () => {
  const [showChat, setShowChat] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        
        // Получаем текущего пользователя
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Получаем профиль пользователя
          const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
            
          if (error) {
            console.error("Ошибка при загрузке профиля:", error);
            return;
          }
          
          setUserProfile(data);
        }
      } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
      } finally {
        setLoading(false);
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
    
    setShowChat(true);
  };
  
  const isPremiumUser = userProfile && userProfile.subscription_type && userProfile.subscription_type !== "free";

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-10 text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">Подписки DevTalk</h1>
      
      {isPremiumUser && (
        <div className="mb-8 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-purple-100 dark:border-gray-600 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300">
              У вас активна подписка: {userProfile?.subscription_type}
            </h2>
            <p className="text-muted-foreground mt-1">
              Спасибо за поддержку нашего проекта! Если у вас возникли вопросы, используйте чат поддержки.
            </p>
          </div>
          <Button 
            onClick={handleChatClick}
            className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
          >
            <MessageCircle className="mr-2 h-4 w-4" />
            Чат поддержки
          </Button>
        </div>
      )}
      
      <PremiumDesktop />
      
      <div className="mt-16 pt-8 border-t">
        <PremiumFeatures />
      </div>
      
      <Dialog open={showChat} onOpenChange={setShowChat}>
        <DialogContent className="p-0 border-0 bg-transparent shadow-none max-w-md">
          {userProfile && (
            <SupportChat 
              userId={userProfile.id} 
              onClose={() => setShowChat(false)} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Premium;
