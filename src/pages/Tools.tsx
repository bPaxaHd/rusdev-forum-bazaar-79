
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, Bug, Code, Wrench } from "lucide-react";
import DevTools from "./DevTools";
import DebugInjector from "./DebugInjector";

const Tools = () => {
  const { toast } = useToast();

  React.useEffect(() => {
    toast({
      title: "Внимание",
      description: "Инструменты разработчика должны использоваться только авторизованными пользователями",
    });
  }, [toast]);

  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-8">
        <Wrench className="h-6 w-6 text-primary" />
        <h1 className="text-3xl font-bold">Инструменты разработчика</h1>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Авторизованный доступ</CardTitle>
          <CardDescription>
            Этот раздел предназначен только для разработчиков и администраторов.
            Инструменты на этой странице могут повлиять на работу приложения.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 border rounded-md p-3">
              <Shield className="h-5 w-5 text-green-500" />
              <span>Безопасность</span>
            </div>
            <div className="flex items-center gap-2 border rounded-md p-3">
              <Bug className="h-5 w-5 text-amber-500" />
              <span>Отладка</span>
            </div>
            <div className="flex items-center gap-2 border rounded-md p-3">
              <Code className="h-5 w-5 text-blue-500" />
              <span>Разработка</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Tabs defaultValue="devtools" className="w-full">
        <TabsList className="grid grid-cols-2 w-full md:w-[400px] mb-8">
          <TabsTrigger value="devtools">Инструменты разработчика</TabsTrigger>
          <TabsTrigger value="injector">Инжектор скриптов</TabsTrigger>
        </TabsList>
        
        <TabsContent value="devtools" className="mt-0">
          <DevTools />
        </TabsContent>
        
        <TabsContent value="injector" className="mt-0">
          <DebugInjector />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Tools;
