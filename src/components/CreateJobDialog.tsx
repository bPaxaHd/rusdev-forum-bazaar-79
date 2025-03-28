
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { X, Plus, Briefcase, Building, MapPin, Clock, DollarSign } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const CreateJobDialog = ({ open, onOpenChange, onJobCreated }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onJobCreated: () => void;
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  
  const [formData, setFormData] = useState({
    company_name: "",
    title: "",
    location: "",
    type: "Полная занятость",
    salary: "",
    description: "",
    logo_url: "https://via.placeholder.com/80",
    requirements: [""]
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleRequirementChange = (index: number, value: string) => {
    const updatedRequirements = [...formData.requirements];
    updatedRequirements[index] = value;
    setFormData(prev => ({ ...prev, requirements: updatedRequirements }));
  };

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, ""]
    }));
  };

  const removeRequirement = (index: number) => {
    const updatedRequirements = formData.requirements.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      requirements: updatedRequirements.length ? updatedRequirements : [""]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Ошибка авторизации",
        description: "Пожалуйста, войдите в систему, чтобы разместить вакансию",
        variant: "destructive",
      });
      return;
    }

    // Validation
    const requiredFields = ["company_name", "title", "location", "type", "description"];
    const emptyFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
    
    if (emptyFields.length > 0) {
      toast({
        title: "Заполните все обязательные поля",
        description: "Пожалуйста, заполните все обязательные поля формы",
        variant: "destructive",
      });
      return;
    }

    // Filter out empty requirements
    const filteredRequirements = formData.requirements.filter(req => req.trim() !== "");
    
    if (filteredRequirements.length === 0) {
      toast({
        title: "Добавьте требования",
        description: "Пожалуйста, добавьте хотя бы одно требование к вакансии",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("job_listings")
        .insert({
          user_id: user.id,
          company_name: formData.company_name,
          title: formData.title,
          location: formData.location,
          type: formData.type,
          salary: formData.salary || null,
          description: formData.description,
          requirements: filteredRequirements,
          logo_url: formData.logo_url || "https://via.placeholder.com/80",
        });
      
      if (error) throw error;
      
      toast({
        title: "Вакансия успешно создана",
        description: "Ваша вакансия успешно опубликована",
      });
      
      // Reset form
      setFormData({
        company_name: "",
        title: "",
        location: "",
        type: "Полная занятость",
        salary: "",
        description: "",
        logo_url: "https://via.placeholder.com/80",
        requirements: [""]
      });
      
      // Close dialog and refresh jobs list
      onOpenChange(false);
      onJobCreated();
      
    } catch (error: any) {
      toast({
        title: "Ошибка при создании вакансии",
        description: error.message || "Произошла ошибка при публикации вакансии",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-3xl ${isMobile ? 'w-full p-3 max-h-[90vh] overflow-y-auto' : ''}`}>
        <DialogHeader>
          <DialogTitle className="text-2xl">Разместить новую вакансию</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Заполните форму ниже, чтобы опубликовать вакансию
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={`grid grid-cols-1 ${isMobile ? '' : 'md:grid-cols-2'} gap-6`}>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="company_name">Название компании *</Label>
              </div>
              <Input
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Например: ТехноСофт"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="title">Должность *</Label>
              </div>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Например: Senior Frontend Developer"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="location">Местоположение *</Label>
              </div>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Например: Москва или Удаленно"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="type">Тип занятости *</Label>
              </div>
              <Input
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                placeholder="Например: Полная занятость"
              />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="salary">Зарплата</Label>
              </div>
              <Input
                id="salary"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                placeholder="Например: 150 000 - 200 000 ₽"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="logo_url">URL логотипа</Label>
              <Input
                id="logo_url"
                name="logo_url"
                value={formData.logo_url}
                onChange={handleChange}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-3">
            <Label htmlFor="description">Описание вакансии *</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Расскажите подробно о вакансии, обязанностях и условиях работы"
              rows={5}
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Требования *</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={addRequirement} 
                className="flex items-center gap-1"
              >
                <Plus className="h-4 w-4" />
                <span>Добавить</span>
              </Button>
            </div>
            
            <div className={`space-y-3 ${isMobile ? 'max-h-[30vh]' : 'max-h-64'} overflow-y-auto px-1`}>
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={requirement}
                    onChange={(e) => handleRequirementChange(index, e.target.value)}
                    placeholder={`Требование ${index + 1}`}
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => removeRequirement(index)}
                    disabled={formData.requirements.length === 1}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          <DialogFooter className={isMobile ? 'flex-col space-y-2' : ''}>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className={isMobile ? 'w-full' : ''}
            >
              Отмена
            </Button>
            <Button 
              type="submit" 
              disabled={loading} 
              className={`bg-gradient-to-r from-blue-500 to-blue-600 ${isMobile ? 'w-full' : ''}`}
            >
              {loading ? "Создание..." : "Опубликовать вакансию"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateJobDialog;
