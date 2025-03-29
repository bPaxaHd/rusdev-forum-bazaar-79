
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone } from "lucide-react";
import { validateInput } from "@/utils/security";
import { secureFormData } from "@/utils/securityMiddleware";
import { useToast } from "@/hooks/use-toast";

const Contacts = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing again
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    try {
      // Validate each field with appropriate validation
      if (!formData.name) {
        newErrors.name = "Имя обязательно для заполнения";
      } else {
        validateInput(formData.name, 'text');
      }
      
      if (!formData.email) {
        newErrors.email = "Email обязателен для заполнения";
      } else {
        try {
          validateInput(formData.email, 'email');
        } catch (error) {
          if (error instanceof Error) {
            newErrors.email = error.message;
          } else {
            newErrors.email = "Некорректный формат email";
          }
        }
      }
      
      if (!formData.subject) {
        newErrors.subject = "Тема обязательна для заполнения";
      }
      
      if (!formData.message) {
        newErrors.message = "Сообщение обязательно для заполнения";
      }
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Ошибка валидации",
          description: error.message,
          variant: "destructive"
        });
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    // Secure the form data before submission
    const securedData = secureFormData(formData);
    
    // Simulate form submission
    setTimeout(() => {
      console.log("Form submitted with secure data:", securedData);
      
      toast({
        title: "Успешно отправлено",
        description: "Ваше сообщение успешно отправлено. Мы свяжемся с вами в ближайшее время."
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <Badge variant="secondary" className="mb-3">
          Контакты
        </Badge>
        <h1 className="text-4xl font-bold mb-6">Свяжитесь с нами</h1>
        <p className="text-muted-foreground mb-12 text-lg">
          Есть вопросы или предложения? Мы всегда рады вам помочь.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="flex flex-col items-center text-center p-6 border rounded-lg">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Email</h3>
            <p className="text-muted-foreground">info@devtalk.ru</p>
            <p className="text-muted-foreground">support@devtalk.ru</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 border rounded-lg">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <Phone className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Телефон</h3>
            <p className="text-muted-foreground">+7 (495) 123-45-67</p>
            <p className="text-muted-foreground">Пн-Пт: 10:00 - 19:00</p>
          </div>
          
          <div className="flex flex-col items-center text-center p-6 border rounded-lg">
            <div className="bg-primary/10 p-3 rounded-full mb-4">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Адрес</h3>
            <p className="text-muted-foreground">г. Москва, ул. Программистов, д. 42</p>
            <p className="text-muted-foreground">БЦ "Код Плаза", 3 этаж</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-bold mb-6">Напишите нам</h2>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ваше имя" 
                  aria-invalid={!!errors.name}
                />
                {errors.name && (
                  <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Ваш email"
                  aria-invalid={!!errors.email}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
              <div>
                <Input
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="Тема"
                  aria-invalid={!!errors.subject}
                />
                {errors.subject && (
                  <p className="text-sm text-red-500 mt-1">{errors.subject}</p>
                )}
              </div>
              <div>
                <Textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Ваше сообщение"
                  className="min-h-[150px]"
                  aria-invalid={!!errors.message}
                />
                {errors.message && (
                  <p className="text-sm text-red-500 mt-1">{errors.message}</p>
                )}
              </div>
              <Button type="submit" disabled={loading}>
                {loading ? "Отправка..." : "Отправить сообщение"}
              </Button>
            </form>
          </div>
          
          <div className="h-[400px] bg-gray-200 rounded-lg overflow-hidden">
            {/* Using sandbox for the iframe to improve security */}
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2245.215570562365!2d37.6172!3d55.7522!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTXCsDQ1JzA4LjAiTiAzN8KwMzcnMDEuOSJF!5e0!3m2!1sru!2sru!4v1617356777694!5m2!1sru!2sru" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={false}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              sandbox="allow-scripts allow-same-origin"
              title="Карта"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;
