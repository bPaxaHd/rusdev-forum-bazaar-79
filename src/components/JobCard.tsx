
import React, { useState, useEffect } from "react";
import { Briefcase, MapPin, Clock, Trash2, Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { canModifyContent } from "@/utils/auth-helpers";
import { useToast } from "@/hooks/use-toast";
import { deleteJobListing } from "@/utils/db-helpers";

interface JobCardProps {
  job: {
    id: string;
    company_name: string;
    title: string;
    location: string;
    type: string;
    salary?: string;
    logo_url?: string;
    created_at: string;
    user_id: string;
  };
  onClick: () => void;
  onDeleted?: () => void;
}

const JobCard = ({ job, onClick, onDeleted }: JobCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [canModify, setCanModify] = useState(false);
  
  useEffect(() => {
    if (user && job) {
      // Проверяем, может ли пользователь модифицировать вакансию
      canModifyContent(job.user_id, user.id).then(result => {
        setCanModify(result);
      });
    }
  }, [user, job]);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем переход к деталям вакансии
    
    if (!user) return;
    
    if (window.confirm("Вы уверены, что хотите удалить эту вакансию? Это действие нельзя отменить.")) {
      try {
        const result = await deleteJobListing(job.id, user.id);
        
        if (result.success) {
          toast({
            title: "Успешно",
            description: result.message
          });
          
          if (onDeleted) {
            onDeleted();
          }
        } else {
          toast({
            title: "Ошибка",
            description: result.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error deleting job listing:", error);
        toast({
          title: "Ошибка",
          description: "Произошла ошибка при удалении вакансии",
          variant: "destructive",
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div 
      className="border rounded-lg p-6 cursor-pointer hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
      onClick={onClick}
    >
      <div className="flex flex-col md:flex-row gap-6">
        <div className="shrink-0">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-md flex items-center justify-center overflow-hidden">
            {job.logo_url ? (
              <img src={job.logo_url} alt={job.company_name} className="w-full h-full object-cover" />
            ) : (
              <Briefcase className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="text-xl font-medium mb-1">{job.title}</h3>
          <p className="text-lg text-muted-foreground mb-3">{job.company_name}</p>
          
          <div className="flex flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{job.location}</span>
            </div>
            
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{job.type}</span>
            </div>
            
            {job.salary && (
              <Badge variant="outline">
                {job.salary}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Опубликовано {formatDate(job.created_at)}
            </div>
            
            <div className="flex gap-2">
              <Button onClick={(e) => e.stopPropagation()}>Просмотреть</Button>
              
              {/* Кнопки редактирования и удаления для владельцев и модераторов */}
              {canModify && (
                <>
                  <Button 
                    variant="outline"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: Добавьте здесь логику для редактирования вакансии
                      // или перенаправление на страницу редактирования
                      toast({
                        description: "Функция редактирования вакансии находится в разработке"
                      });
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="destructive"
                    size="icon"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
