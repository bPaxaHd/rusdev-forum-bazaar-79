
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
import CreateJobDialog from "@/components/CreateJobDialog";
import JobCard from "@/components/JobCard";
import { Input } from "@/components/ui/input";
import { useIsMobile } from "@/hooks/use-mobile";
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

const Jobs = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showPremiumDialog, setShowPremiumDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJob, setSelectedJob] = useState<any>(null);
  const [showJobDetails, setShowJobDetails] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isMobile = useIsMobile();
  
  useEffect(() => {
    fetchJobs();
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchJobs = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("job_listings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setJobs(data || []);
    } catch (error: any) {
      console.error("Error fetching jobs:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить список вакансий",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("subscription_type")
        .eq("id", user?.id)
        .single();
      
      if (error) throw error;
      setUserProfile(data);
    } catch (error) {
      console.error("Error fetching user profile:", error);
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
      // Open job creation dialog
      setShowCreateDialog(true);
    } else {
      setShowPremiumDialog(true);
    }
  };

  const handleJobClick = (job: any) => {
    setSelectedJob(job);
    setShowJobDetails(true);
  };

  // Filter jobs based on search query
  const filteredJobs = searchQuery.trim() === "" 
    ? jobs 
    : jobs.filter(job => 
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.requirements.some((req: string) => 
          req.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );

  // Мобильная версия диалога деталей вакансии
  const MobileJobDetailsContent = () => (
    <>
      <DrawerHeader>
        <DrawerTitle className="text-xl">{selectedJob?.title}</DrawerTitle>
        <div className="flex items-center gap-2 text-base font-medium mt-2">
          {selectedJob?.company_name} · {selectedJob?.location}
        </div>
      </DrawerHeader>
      
      <div className="px-4 pb-6 pt-2">
        <div className="mb-4 flex items-center gap-x-6 gap-y-2 flex-wrap">
          <Badge variant="secondary" className="px-3 py-1">
            <Briefcase className="h-3.5 w-3.5 mr-1.5" />
            {selectedJob?.type}
          </Badge>
          {selectedJob?.salary && <span className="font-medium">{selectedJob?.salary}</span>}
          <span className="text-sm text-muted-foreground">
            Опубликовано {new Date(selectedJob?.created_at).toLocaleDateString("ru-RU")}
          </span>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Описание вакансии</h3>
            <p className="text-muted-foreground whitespace-pre-line">{selectedJob?.description}</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Требования</h3>
            <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
              {selectedJob?.requirements?.map((req: string, index: number) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <DrawerFooter>
        <Button className="w-full">Откликнуться на вакансию</Button>
        <DrawerClose asChild>
          <Button variant="outline" className="w-full">Закрыть</Button>
        </DrawerClose>
      </DrawerFooter>
    </>
  );

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
            <Input
              type="text"
              placeholder="Поиск вакансий по названию, компании или навыкам"
              className="w-full pl-10 pr-4 py-6"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-6 mb-12">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="border rounded-lg p-6 animate-pulse">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="shrink-0">
                    <div className="w-16 h-16 bg-muted rounded-md"></div>
                  </div>
                  <div className="flex-1">
                    <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-5 bg-muted rounded w-1/3 mb-4"></div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      <div className="h-4 bg-muted rounded w-20"></div>
                      <div className="h-4 bg-muted rounded w-32"></div>
                      <div className="h-4 bg-muted rounded w-24"></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="h-5 bg-muted rounded w-28"></div>
                      <div className="h-9 bg-muted rounded w-28"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map(job => (
              <JobCard key={job.id} job={job} onClick={() => handleJobClick(job)} />
            ))
          ) : (
            <div className="text-center p-10 border rounded-lg bg-muted/10">
              <h3 className="text-xl font-medium mb-2">Вакансии не найдены</h3>
              <p className="text-muted-foreground">
                {searchQuery.trim() !== "" 
                  ? "По вашему запросу не найдено вакансий. Попробуйте изменить параметры поиска."
                  : "В настоящее время нет опубликованных вакансий."}
              </p>
            </div>
          )}
        </div>

        {jobs.length > 10 && (
          <div className="flex justify-center">
            <Button variant="outline">Загрузить больше вакансий</Button>
          </div>
        )}

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

      {/* Job Details Dialog - for desktop */}
      {!isMobile && (
        <Dialog open={showJobDetails} onOpenChange={setShowJobDetails}>
          <DialogContent className="sm:max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedJob?.title}</DialogTitle>
              <DialogDescription className="flex items-center gap-2 text-base font-medium mt-2">
                {selectedJob?.company_name} · {selectedJob?.location}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6">
              <div>
                <div className="mb-4 flex items-center gap-x-6 gap-y-2 flex-wrap">
                  <Badge variant="secondary" className="px-3 py-1">
                    <Briefcase className="h-3.5 w-3.5 mr-1.5" />
                    {selectedJob?.type}
                  </Badge>
                  {selectedJob?.salary && <span className="font-medium">{selectedJob?.salary}</span>}
                  <span className="text-sm text-muted-foreground">
                    Опубликовано {new Date(selectedJob?.created_at).toLocaleDateString("ru-RU")}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Описание вакансии</h3>
                    <p className="text-muted-foreground whitespace-pre-line">{selectedJob?.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Требования</h3>
                    <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                      {selectedJob?.requirements?.map((req: string, index: number) => (
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
      )}

      {/* Job Details Drawer - for mobile */}
      {isMobile && (
        <Drawer open={showJobDetails} onOpenChange={setShowJobDetails}>
          <DrawerContent className="max-h-[90vh]">
            {selectedJob && <MobileJobDetailsContent />}
          </DrawerContent>
        </Drawer>
      )}

      {/* Create Job Dialog */}
      <CreateJobDialog 
        open={showCreateDialog} 
        onOpenChange={setShowCreateDialog}
        onJobCreated={fetchJobs}
      />
    </div>
  );
};

export default Jobs;
