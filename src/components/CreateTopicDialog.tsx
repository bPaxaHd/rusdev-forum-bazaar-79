
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

// Схема валидации формы
const formSchema = z.object({
  title: z.string().min(5, "Название должно содержать минимум 5 символов").max(100, "Слишком длинное название"),
  preview: z.string().min(20, "Описание должно содержать минимум 20 символов").max(500, "Слишком длинное описание"),
  category: z.enum(["frontend", "backend", "fullstack"]),
  tags: z.string().refine(value => {
    const tags = value.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
    return tags.length >= 1 && tags.length <= 5;
  }, {
    message: "Укажите от 1 до 5 тегов, разделенных запятыми"
  })
});

type FormValues = z.infer<typeof formSchema>;

// Функция для создания нового поста
const onCreateTopic = (
  values: FormValues, 
  authorName: string = "Пользователь",
  authorRole: string = "Разработчик",
  reset: () => void,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  // В реальном приложении здесь будет запрос к API
  console.log("Создан новый топик:", {
    ...values,
    author: authorName,
    authorRole: authorRole,
    repliesCount: 0,
    likesCount: 0,
    viewsCount: 0,
    lastActivity: new Date().toISOString()
  });
  
  // Сбросить форму и закрыть диалог
  reset();
  setOpen(false);
};

const CreateTopicDialog = () => {
  const [open, setOpen] = React.useState(false);
  const { theme } = useTheme();
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      preview: "",
      category: "frontend",
      tags: ""
    }
  });

  const onSubmit = (values: FormValues) => {
    onCreateTopic(values, "Аноним", "Разработчик", form.reset, setOpen);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus size={18} />
          Создать тему
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Создать новую тему</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Название темы</FormLabel>
                  <FormControl>
                    <Input placeholder="Введите название темы..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="preview"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Описание</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Опишите вашу тему подробнее..." 
                      className="min-h-[100px]" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Категория</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Выберите категорию" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="frontend">Frontend</SelectItem>
                        <SelectItem value="backend">Backend</SelectItem>
                        <SelectItem value="fullstack">Fullstack</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Теги</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Например: React, JavaScript..." 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Отмена
              </Button>
              <Button type="submit">Создать тему</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateTopicDialog;
