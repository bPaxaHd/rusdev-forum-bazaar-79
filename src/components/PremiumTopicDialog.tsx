
import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface PremiumTopicDialogProps {
  isPremium?: boolean;
}

const PremiumTopicDialog: React.FC<PremiumTopicDialogProps> = ({ isPremium = true }) => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("frontend");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Ошибка авторизации",
        description: "Для создания темы необходимо авторизоваться",
        variant: "destructive",
      });
      return;
    }
    
    if (!title.trim() || !content.trim() || !category) {
      toast({
        title: "Ошибка валидации",
        description: "Пожалуйста, заполните все поля",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Проверяем, имеет ли пользователь премиум подписку
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('subscription_type')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        throw new Error("Не удалось проверить статус подписки");
      }
      
      const hasPremium = profileData?.subscription_type && 
                        ['premium', 'business', 'sponsor'].includes(profileData.subscription_type);
      
      if (!hasPremium) {
        toast({
          title: "Недоступно",
          description: "Создание премиум тем доступно только для пользователей с премиум подпиской",
          variant: "destructive",
        });
        return;
      }
      
      const { data, error } = await supabase
        .from('topics')
        .insert([
          {
            title,
            content,
            user_id: user.id,
            category,
            is_premium: true,
            likes: 0,
            views: 0,
          },
        ])
        .select();
      
      if (error) {
        throw error;
      }
      
      toast({
        title: "Тема создана",
        description: "Ваша премиум тема была успешно создана",
      });
      
      setOpen(false);
      setTitle("");
      setContent("");
      setCategory("frontend");
      
      if (data && data[0]) {
        navigate(`/topic/${data[0].id}`);
      }
    } catch (error: any) {
      console.error("Ошибка при создании темы:", error);
      toast({
        title: "Не удалось создать тему",
        description: error.message || "Произошла неизвестная ошибка",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
          <Crown size={16} className="mr-2" />
          Создать премиум тему
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown size={18} className="text-amber-500" />
            Создание премиум темы
          </DialogTitle>
          <DialogDescription>
            Премиум темы получают приоритетные ответы от экспертов и команды поддержки.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid gap-2">
            <label htmlFor="title" className="text-sm font-medium">
              Заголовок
            </label>
            <Input
              id="title"
              placeholder="Введите заголовок темы"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="border-amber-200 focus-visible:ring-amber-500"
            />
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="category" className="text-sm font-medium">
              Категория
            </label>
            <Select 
              value={category} 
              onValueChange={(value) => setCategory(value)}
            >
              <SelectTrigger className="border-amber-200 focus-visible:ring-amber-500">
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
                <SelectItem value="fullstack">Fullstack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="content" className="text-sm font-medium">
              Содержание
            </label>
            <Textarea
              id="content"
              placeholder="Опишите вашу проблему или вопрос"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              className="min-h-[200px] border-amber-200 focus-visible:ring-amber-500"
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline"
              className="border-amber-200"
              onClick={() => setOpen(false)}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Создание..." : "Создать премиум тему"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PremiumTopicDialog;
