
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Shield, AlertCircle, CheckCircle2, XCircle } from "lucide-react";

const ForumRules = () => {
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <Badge variant="secondary" className="mb-3">
          Правила
        </Badge>
        <div className="flex items-center gap-2 mb-6">
          <Shield className="text-primary" size={28} />
          <h1 className="text-4xl font-bold">Правила форума DevTalk</h1>
        </div>
        <p className="text-muted-foreground mb-12 text-lg">
          Чтобы обеспечить комфортное и продуктивное общение на нашем форуме, мы разработали ряд правил, 
          которые просим всех участников соблюдать.
        </p>

        <div className="space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-6">Общие правила</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="shrink-0 pt-1">
                  <CheckCircle2 className="text-green-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Уважайте других участников форума</h3>
                  <p className="text-muted-foreground">
                    Общайтесь вежливо и с уважением к другим пользователям независимо от их уровня знаний или опыта. 
                    Любые формы оскорблений, унижений или дискриминации недопустимы.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="shrink-0 pt-1">
                  <CheckCircle2 className="text-green-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Публикуйте в соответствующих разделах</h3>
                  <p className="text-muted-foreground">
                    Размещайте свои темы и вопросы в соответствующих разделах форума. Это поможет другим пользователям 
                    быстрее найти интересующую их информацию и получить релевантные ответы.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="shrink-0 pt-1">
                  <CheckCircle2 className="text-green-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Используйте содержательные заголовки</h3>
                  <p className="text-muted-foreground">
                    При создании новой темы используйте заголовки, которые чётко отражают суть вопроса или проблемы. 
                    Избегайте заголовков вроде "Помогите", "Срочно", "Не работает" без дополнительной информации.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-bold mb-6">Что запрещено</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="shrink-0 pt-1">
                  <XCircle className="text-red-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Спам и реклама</h3>
                  <p className="text-muted-foreground">
                    Запрещено размещение нерелевантной рекламы, спама, реферальных ссылок и других материалов, не имеющих
                    отношения к тематике форума, без согласования с администрацией.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="shrink-0 pt-1">
                  <XCircle className="text-red-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Нарушение авторских прав</h3>
                  <p className="text-muted-foreground">
                    Запрещено размещение материалов, нарушающих авторские права. Если вы используете чужой код или контент, 
                    обязательно указывайте источник и автора.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="shrink-0 pt-1">
                  <XCircle className="text-red-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Оффтопик и флуд</h3>
                  <p className="text-muted-foreground">
                    Запрещено создание сообщений не по теме обсуждения (оффтопик) и многократное размещение 
                    однотипных сообщений или вопросов (флуд).
                  </p>
                </div>
              </div>
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-bold mb-6">Правила публикации кода</h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="shrink-0 pt-1">
                  <CheckCircle2 className="text-green-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Используйте форматирование кода</h3>
                  <p className="text-muted-foreground">
                    При публикации кода используйте специальное форматирование (теги &lt;code&gt; или &lt;pre&gt;), 
                    чтобы код был читаемым и удобным для анализа.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="shrink-0 pt-1">
                  <CheckCircle2 className="text-green-500" size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Публикуйте минимальный воспроизводимый пример</h3>
                  <p className="text-muted-foreground">
                    Если у вас возникла проблема с кодом, публикуйте минимальный воспроизводимый пример, который 
                    демонстрирует проблему, а не весь ваш проект.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="bg-muted/30 rounded-lg p-6 flex items-start gap-4">
            <div className="shrink-0 pt-1">
              <AlertCircle className="text-amber-500" size={24} />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Обратите внимание</h3>
              <p className="text-muted-foreground">
                Администрация форума оставляет за собой право удалять сообщения, нарушающие правила, без предупреждения, 
                а также временно или постоянно ограничивать доступ к форуму пользователям, регулярно нарушающим правила.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumRules;
