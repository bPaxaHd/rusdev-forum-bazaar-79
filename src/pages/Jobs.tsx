
import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, MapPin, Clock, Search, AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Link } from "react-router-dom";

const Jobs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);

  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer (React)",
      company: "ТехноСофт",
      location: "Москва",
      type: "Полная занятость",
      salary: "180 000 - 250 000 ₽",
      posted: "3 дня назад",
      logo: "https://via.placeholder.com/80",
      description: "Мы ищем опытного Frontend-разработчика со знанием React для работы над нашими продуктами. От вас требуется опыт работы с современными технологиями и готовность к решению сложных задач в дружной команде.",
      requirements: ["Опыт работы с React от 3 лет", "Знание TypeScript", "Опыт работы с Redux", "Знание CSS-in-JS библиотек", "Навыки оптимизации производительности"]
    },
    {
      id: 2,
      title: "Backend Developer (Node.js)",
      company: "ДигиТал",
      location: "Санкт-Петербург",
      type: "Полная занятость",
      salary: "150 000 - 200 000 ₽",
      posted: "1 неделя назад",
      logo: "https://via.placeholder.com/80",
      description: "Требуется разработчик Node.js для работы над высоконагруженным API. Вы будете частью команды, ответственной за разработку и поддержку серверной части наших приложений.",
      requirements: ["Опыт работы с Node.js от 2 лет", "Опыт работы с Express/Nest.js", "Знание MongoDB и PostgreSQL", "Понимание принципов RESTful API"]
    },
    {
      id: 3,
      title: "Fullstack Developer (React, Django)",
      company: "КодПрофи",
      location: "Удаленно",
      type: "Полная занятость",
      salary: "180 000 - 230 000 ₽",
      posted: "2 дня назад",
      logo: "https://via.placeholder.com/80",
      description: "Мы ищем Full-stack разработчика для создания веб-приложений с использованием React на фронтенде и Django на бэкенде. Работа предполагает полный цикл разработки от проектирования до внедрения.",
      requirements: ["Опыт работы с React", "Опыт работы с Django", "Знание HTML, CSS, JavaScript", "Опыт работы с БД (PostgreSQL)"]
    },
    {
      id: 4,
      title: "Frontend Developer (Vue.js)",
      company: "ВебТек",
      location: "Казань",
      type: "Полная занятость",
      salary: "120 000 - 160 000 ₽",
      posted: "4 дня назад",
      logo: "https://via.placeholder.com/80",
      description: "Ищем разработчика с опытом работы с Vue.js для работы над UI нашего основного продукта. Вы будете работать в тесном сотрудничестве с командой дизайнеров и бэкенд-разработчиков.",
      requirements: ["Опыт работы с Vue.js от 1 года", "Знание JavaScript и TypeScript", "Опыт работы с Vuex", "Базовые знания HTML и CSS"]
    },
    {
      id: 5,
      title: "DevOps Engineer",
      company: "СистемПро",
      location: "Москва",
      type: "Полная занятость",
      salary: "200 000 - 250 000 ₽",
      posted: "5 дней назад",
      logo: "https://via.placeholder.com/80",
      description: "Требуется DevOps инженер для настройки и поддержки CI/CD, оптимизации инфраструктуры и автоматизации процессов развертывания. Вы будете работать над улучшением наших внутренних процессов и инфраструктуры.",
      requirements: ["Опыт работы с Docker и Kubernetes", "Знание AWS/GCP", "Опыт работы с CI/CD инструментами", "Знание Linux", "Опыт автоматизации процессов"]
    }
  ];

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("subscription_type")
        .eq("id", user?.id)
        .single();
      
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const canPostJobs = () => {
    if (!userProfile) return false;
    
    // Allow business, sponsor, admin, moderator and creator subscription types
    const allowedTypes = ["business", "sponsor", "admin", "moderator", "creator"];
    return allowedTypes.includes(userProfile.subscription_type);
  };

  const handlePostJobClick = () => {
    if (!user) {
      toast({
        title: "Необходима авторизация",
        description: "Пожалуйста, войдите в систему, чтобы разместить вакансию",
        variant: "destructive",
      });
      return;
    }

    if (canPostJobs()) {
      // Proceed to job posting form logic
      toast({
        title: "Вы можете разместить вакансию",
        description: "Доступ открыт для вашего типа аккаунта",
      });
    } else {
      setShowPremiumDialog(true);
    }
  };

  const handleJobClick = (job: any) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <Badge variant="secondary" className="mb-3">
          Вакансии
        </Badge>
        <h1 className="text-4xl font-bold mb-6">Вакансии для разработчиков</h1>
        <p className="text-muted-foreground mb-12 text-lg">
          Найдите свою идеальную работу в сфере разработки программного обеспечения.
        </p>

        <div className="relative mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
            <input
              type="text"
              placeholder="Поиск вакансий по названию, компании или навыкам"
              className="w-full pl-10 pr-4 py-3 border rounded-lg"
            />
          </div>
        </div>

        <div className="space-y-6 mb-12">
          {jobs.map(job => (
            <div 
              key={job.id} 
              className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleJobClick(job)}
            >
              <div className="flex flex-col md:flex-row gap-6">
                <div className="shrink-0">
                  <div className="w-16 h-16 bg-muted/50 rounded-md flex items-center justify-center">
                    <img src={job.logo} alt={job.company} className="max-w-full max-h-full" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{job.title}</h3>
                  <p className="text-lg mb-3">{job.company}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin size={14} />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase size={14} />
                      <span>{job.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={14} />
                      <span>Опубликовано {job.posted}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-lg">{job.salary}</span>
                    <Button variant="outline">Подробнее</Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button variant="outline">Загрузить больше вакансий</Button>
        </div>

        <div className="mt-16 border rounded-lg p-8 text-center bg-muted/30">
          <h2 className="text-2xl font-bold mb-4">Вы работодатель?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Опубликуйте вакансию на нашей платформе и найдите талантливых разработчиков для вашей команды.
          </p>
          <Button size="lg" onClick={handlePostJobClick}>Разместить вакансию</Button>
        </div>
      </div>

      {/* Dialog for Premium Subscription Required */}
      <Dialog open={showPremiumDialog} onOpenChange={setShowPremiumDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">Требуется бизнес-подписка</DialogTitle>
            <DialogDescription className="text-center">
              <div className="flex justify-center my-4">
                <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-full">
                  <AlertCircle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
              <p>
                Размещение вакансий доступно только пользователям с подпиской Бизнес (₽999/месяц) или выше. Повысьте свой аккаунт для доступа к этой функции.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={() => setShowPremiumDialog(false)} className="w-full sm:w-auto">
              Отмена
            </Button>
            <Button 
              className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600"
              asChild
            >
              <Link to="/premium">
                Перейти к подпискам
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Details Dialog */}
      <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedJob?.title}</DialogTitle>
            <DialogDescription className="flex items-center gap-2 text-base font-medium mt-2">
              {selectedJob?.company} · {selectedJob?.location}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6">
            <div>
              <div className="mb-4 flex items-center gap-x-6 gap-y-2 flex-wrap">
                <Badge variant="secondary" className="px-3 py-1">
                  <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                  {selectedJob?.type}
                </Badge>
                <span className="font-medium">{selectedJob?.salary}</span>
                <span className="text-sm text-muted-foreground">Опубликовано {selectedJob?.posted}</span>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Описание вакансии</h3>
                  <p className="text-muted-foreground">{selectedJob?.description}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Требования</h3>
                  <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                    {selectedJob?.requirements.map((req: string, index: number) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-4">
              <Button className="w-full sm:w-auto">Откликнуться на вакансию</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Jobs;
