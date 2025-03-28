
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, Briefcase, MapPin, Edit2, Save, X, Github, Twitter, Globe, LinkIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import AvatarUpload from "@/components/AvatarUpload";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Mock data for user activity
const userTopics = [
  {
    id: 1,
    title: "Как оптимизировать React-приложение",
    category: "frontend",
    date: "2023-11-15T10:30:00Z",
    comments: 12,
    likes: 35
  },
  {
    id: 2,
    title: "Лучшие практики для Node.js бэкенда",
    category: "backend",
    date: "2023-11-10T14:20:00Z",
    comments: 7,
    likes: 18
  },
  {
    id: 3,
    title: "Архитектура микросервисов: за и против",
    category: "fullstack",
    date: "2023-10-25T09:45:00Z",
    comments: 24,
    likes: 42
  }
];

// Mock data for skills
const userSkills = ["JavaScript", "React", "TypeScript", "Node.js", "Express", "MongoDB", "REST API", "GraphQL", "Git", "CSS", "HTML", "Tailwind CSS"];

// Определение формата данных профиля
interface ProfileData {
  id: string;
  username: string;
  bio: string | null;
  specialty: string | null;
  location: string | null;
  avatar_url: string | null;
  github_url: string | null;
  twitter_url: string | null;
  website_url: string | null;
  company: string | null;
  skills: string[] | null;
  experience_years: number | null;
}

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<ProfileData>>({});
  
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const alphabet = "АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ".split("");
  
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    
    const fetchProfile = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (error) {
          console.error("Ошибка при загрузке профиля:", error);
          return;
        }
        
        // Если навыки не заданы, устанавливаем пустой массив
        if (!data.skills) {
          data.skills = [];
        }
        
        setProfile(data as ProfileData);
        setEditedProfile(data as ProfileData);
      } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, navigate]);
  
  const handleEdit = () => {
    setEditing(true);
    setEditedProfile(profile || {});
  };
  
  const handleSave = async () => {
    try {
      if (!user) return;
      
      const { error } = await supabase
        .from("profiles")
        .update(editedProfile)
        .eq("id", user.id);
      
      if (error) {
        toast({
          title: "Ошибка при сохранении",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      setProfile(prev => ({ ...prev, ...editedProfile } as ProfileData));
      setEditing(false);
      
      toast({
        title: "Профиль обновлен",
        description: "Ваш профиль был успешно обновлен",
      });
    } catch (error) {
      console.error("Ошибка при сохранении профиля:", error);
      toast({
        title: "Ошибка при сохранении",
        description: "Не удалось обновить профиль",
        variant: "destructive",
      });
    }
  };
  
  const handleCancel = () => {
    setEditing(false);
    setEditedProfile(profile || {});
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setEditedProfile(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAvatarChange = (url: string) => {
    setProfile(prev => ({ ...prev, avatar_url: url } as ProfileData));
  };
  
  // Функция обработки клика на букву алфавита
  const handleLetterClick = (e: React.MouseEvent<HTMLDivElement>, letter: string) => {
    setActiveLetter(letter);
    // Здесь можно добавить логику фильтрации пользователей по первой букве имени
    console.log(`Выбрана буква: ${letter}`);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(date);
  };
  
  const getTopicCategoryBadge = (category: string) => {
    switch (category) {
      case "frontend":
        return <Badge className="bg-blue-100 text-blue-600">Frontend</Badge>;
      case "backend":
        return <Badge className="bg-green-100 text-green-600">Backend</Badge>;
      case "fullstack":
        return <Badge className="bg-purple-100 text-purple-600">Fullstack</Badge>;
      default:
        return <Badge variant="outline">Общее</Badge>;
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto py-10 animate-pulse">
        <div className="w-full max-w-4xl mx-auto bg-card rounded-xl p-6">
          <div className="h-8 bg-muted rounded mb-8 w-1/4"></div>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3 flex flex-col items-center">
              <div className="h-32 w-32 bg-muted rounded-full mb-4"></div>
              <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-10 bg-muted rounded w-full"></div>
            </div>
            <div className="md:w-2/3">
              <div className="h-8 bg-muted rounded mb-4 w-1/3"></div>
              <div className="h-4 bg-muted rounded mb-6 w-full"></div>
              <div className="space-y-4">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="h-6 bg-muted rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="container mx-auto py-10 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Профиль не найден</CardTitle>
            <CardDescription>Не удалось загрузить информацию о профиле</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")}>На главную</Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-10 px-4">
      <Tabs defaultValue="profile" className="w-full max-w-4xl mx-auto">
        <TabsList className="mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-1">
            <User size={14} />
            <span>Профиль</span>
          </TabsTrigger>
          <TabsTrigger value="topics" className="flex items-center gap-1">
            <MessageSquare size={14} />
            <span>Темы</span>
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-1">
            <Users size={14} />
            <span>Сообщество</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Мой профиль</CardTitle>
                <div className="flex gap-2">
                  {!editing ? (
                    <Button variant="outline" size="sm" onClick={handleEdit}>
                      <Edit2 size={16} className="mr-2" />
                      Редактировать
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" size="sm" onClick={handleCancel}>
                        <X size={16} className="mr-2" />
                        Отменить
                      </Button>
                      <Button size="sm" onClick={handleSave}>
                        <Save size={16} className="mr-2" />
                        Сохранить
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8">
                <div className="md:w-1/3 flex flex-col items-center">
                  <AvatarUpload 
                    userId={profile.id}
                    url={profile.avatar_url || ""}
                    onAvatarChange={handleAvatarChange}
                    size="lg"
                    username={profile.username}
                  />
                  
                  {!editing ? (
                    <div className="text-center mt-4">
                      <h2 className="text-2xl font-bold">{profile.username}</h2>
                      <p className="text-muted-foreground">
                        {profile.specialty === "frontend" ? "Frontend разработчик" : 
                         profile.specialty === "backend" ? "Backend разработчик" : 
                         profile.specialty === "fullstack" ? "Fullstack разработчик" : 
                         "Разработчик"}
                      </p>
                      
                      {profile.company && (
                        <div className="flex items-center justify-center mt-2 text-sm text-muted-foreground">
                          <Briefcase size={14} className="mr-1" />
                          <span>{profile.company}</span>
                        </div>
                      )}
                      
                      {profile.location && (
                        <div className="flex items-center justify-center mt-1 text-sm text-muted-foreground">
                          <MapPin size={14} className="mr-1" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full mt-4 space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-1 block">Имя пользователя</label>
                        <Input 
                          name="username"
                          value={editedProfile.username || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Специализация</label>
                        <Select 
                          value={editedProfile.specialty || ""} 
                          onValueChange={(value) => handleSelectChange("specialty", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите специализацию" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="frontend">Frontend разработчик</SelectItem>
                            <SelectItem value="backend">Backend разработчик</SelectItem>
                            <SelectItem value="fullstack">Fullstack разработчик</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Компания</label>
                        <Input 
                          name="company"
                          value={editedProfile.company || ""}
                          onChange={handleInputChange}
                          placeholder="Место работы"
                        />
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium mb-1 block">Местоположение</label>
                        <Input 
                          name="location"
                          value={editedProfile.location || ""}
                          onChange={handleInputChange}
                          placeholder="Город, страна"
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="w-full mt-6">
                    <Separator className="mb-4" />
                    <h3 className="text-sm font-medium mb-3">Социальные сети</h3>
                    
                    {!editing ? (
                      <div className="space-y-2">
                        {profile.github_url && (
                          <a 
                            href={profile.github_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-sm hover:text-primary"
                          >
                            <Github size={14} className="mr-2" />
                            GitHub
                          </a>
                        )}
                        
                        {profile.twitter_url && (
                          <a 
                            href={profile.twitter_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-sm hover:text-primary"
                          >
                            <Twitter size={14} className="mr-2" />
                            Twitter
                          </a>
                        )}
                        
                        {profile.website_url && (
                          <a 
                            href={profile.website_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center text-sm hover:text-primary"
                          >
                            <Globe size={14} className="mr-2" />
                            Веб-сайт
                          </a>
                        )}
                        
                        {!profile.github_url && !profile.twitter_url && !profile.website_url && (
                          <p className="text-sm text-muted-foreground">Социальные сети не указаны</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Github size={14} />
                          <Input 
                            name="github_url"
                            value={editedProfile.github_url || ""}
                            onChange={handleInputChange}
                            placeholder="URL профиля GitHub"
                            className="text-sm"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Twitter size={14} />
                          <Input 
                            name="twitter_url"
                            value={editedProfile.twitter_url || ""}
                            onChange={handleInputChange}
                            placeholder="URL профиля Twitter"
                            className="text-sm"
                          />
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Globe size={14} />
                          <Input 
                            name="website_url"
                            value={editedProfile.website_url || ""}
                            onChange={handleInputChange}
                            placeholder="URL вашего сайта"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="md:w-2/3">
                  <div className="mb-6">
                    <h3 className="text-xl font-medium mb-2">О себе</h3>
                    {!editing ? (
                      <p className="text-muted-foreground whitespace-pre-line">
                        {profile.bio || "Информация о себе не указана"}
                      </p>
                    ) : (
                      <Textarea 
                        name="bio"
                        value={editedProfile.bio || ""}
                        onChange={handleInputChange}
                        placeholder="Расскажите о себе, своем опыте и целях"
                        className="min-h-[150px]"
                      />
                    )}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="text-xl font-medium mb-4">Навыки</h3>
                    {!editing ? (
                      <div className="flex flex-wrap gap-2">
                        {profile.skills && profile.skills.length > 0 ? (
                          profile.skills.map((skill, index) => (
                            <Badge key={index} variant="secondary">
                              {skill}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-muted-foreground">Навыки не указаны</p>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Введите навыки через запятую (например: JavaScript, React, Node.js)
                        </p>
                        <Input
                          name="skills"
                          value={Array.isArray(editedProfile.skills) ? editedProfile.skills.join(", ") : ""}
                          onChange={(e) => {
                            const skillsArray = e.target.value
                              .split(",")
                              .map(skill => skill.trim())
                              .filter(skill => skill !== "");
                            setEditedProfile(prev => ({ ...prev, skills: skillsArray }));
                          }}
                          placeholder="Ваши навыки и технологии"
                        />
                      </div>
                    )}
                  </div>
                  
                  <Separator className="my-6" />
                  
                  <div>
                    <h3 className="text-xl font-medium mb-4">Опыт работы</h3>
                    {!editing ? (
                      <div>
                        {profile.experience_years ? (
                          <Badge variant="outline" className="text-base font-normal">
                            {profile.experience_years} {
                              profile.experience_years === 1 ? "год" :
                              profile.experience_years > 1 && profile.experience_years < 5 ? "года" : "лет"
                            } опыта
                          </Badge>
                        ) : (
                          <p className="text-muted-foreground">Опыт работы не указан</p>
                        )}
                      </div>
                    ) : (
                      <div>
                        <label className="text-sm font-medium mb-1 block">Количество лет опыта</label>
                        <Input
                          type="number"
                          name="experience_years"
                          value={editedProfile.experience_years || ""}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            setEditedProfile(prev => ({ 
                              ...prev, 
                              experience_years: isNaN(value) ? null : value 
                            }));
                          }}
                          min="0"
                          max="50"
                          placeholder="Введите количество лет опыта"
                          className="max-w-[200px]"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="topics">
          <Card>
            <CardHeader>
              <CardTitle>Мои темы</CardTitle>
              <CardDescription>
                Созданные вами темы и обсуждения
              </CardDescription>
            </CardHeader>
            <CardContent>
              {userTopics.length > 0 ? (
                <div className="space-y-4">
                  {userTopics.map((topic) => (
                    <div key={topic.id} className="p-4 border rounded-lg hover:bg-muted/40 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          {getTopicCategoryBadge(topic.category)}
                          <h4 className="text-lg font-medium mt-1">{topic.title}</h4>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(topic.date)}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MessageSquare size={15} />
                          <span className="text-xs">{topic.comments}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Heart size={15} />
                          <span className="text-xs">{topic.likes}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">У вас пока нет созданных тем</p>
                  <Button className="mt-4" onClick={() => navigate("/forum")}>
                    Создать тему
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="community">
          <Card>
            <CardHeader>
              <CardTitle>Сообщество разработчиков</CardTitle>
              <CardDescription>
                Найдите единомышленников и установите профессиональные связи
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <div className="relative w-full max-w-sm">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input 
                    className="pl-9" 
                    placeholder="Поиск по имени или специальности..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Filter size={16} className="mr-2" />
                    Фильтры
                  </Button>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {alphabet.map((letter) => (
                  <div
                    key={letter}
                    onClick={(e) => handleLetterClick(e, letter)}
                    className={`w-7 h-7 flex items-center justify-center rounded-full text-xs cursor-pointer transition-colors ${
                      activeLetter === letter 
                        ? "bg-primary text-primary-foreground" 
                        : "hover:bg-secondary"
                    }`}
                  >
                    {letter}
                  </div>
                ))}
              </div>
              
              <div className="text-center py-10">
                <User className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">Функционал сообщества находится в разработке</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Скоро здесь появится возможность общаться с другими разработчиками
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Import these components at the top of the file
import { MessageSquare, Heart, Users, Search, Filter } from "lucide-react";

export default Profile;
