
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateTopic } from "@/utils/db-helpers";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sanitizeHtml } from "@/utils/security";
import { secureFormData } from "@/utils/securityMiddleware";

interface EditTopicDialogProps {
  topicId: string;
  userId: string;
  initialData: {
    title: string;
    content: string;
    category: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTopicUpdated: () => void;
}

const EditTopicDialog = ({
  topicId,
  userId,
  initialData,
  open,
  onOpenChange,
  onTopicUpdated
}: EditTopicDialogProps) => {
  // Use sanitized initial data
  const [formData, setFormData] = useState({
    title: sanitizeHtml(initialData.title),
    content: sanitizeHtml(initialData.content),
    category: initialData.category
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (value: string) => {
    // Validate category to ensure it's one of the expected values
    if (['frontend', 'backend', 'fullstack'].includes(value)) {
      setFormData(prev => ({ ...prev, category: value }));
    } else {
      toast({
        title: "Ошибка",
        description: "Выбрана недопустимая категория",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Ошибка",
        description: "Заполните все обязательные поля",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      // Sanitize and secure the form data
      const securedData = secureFormData({
        ...formData,
        title: sanitizeHtml(formData.title),
        content: sanitizeHtml(formData.content)
      });
      
      const result = await updateTopic(topicId, userId, securedData);
      
      if (result.success) {
        toast({
          title: "Успешно",
          description: result.message
        });
        onOpenChange(false);
        onTopicUpdated();
      } else {
        toast({
          title: "Ошибка",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error updating topic:", error);
      toast({
        title: "Ошибка",
        description: "Произошла ошибка при обновлении темы",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Редактирование темы</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Заголовок</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Заголовок темы"
            />
          </div>
          
          <div>
            <Label htmlFor="category">Категория</Label>
            <Select 
              value={formData.category} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Выберите категорию" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="frontend">Frontend</SelectItem>
                <SelectItem value="backend">Backend</SelectItem>
                <SelectItem value="fullstack">Fullstack</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="content">Содержание</Label>
            <Textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleChange}
              className="min-h-[200px]"
              placeholder="Содержание темы"
            />
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)} 
              disabled={loading}
            >
              Отмена
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Сохранение..." : "Сохранить изменения"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditTopicDialog;
