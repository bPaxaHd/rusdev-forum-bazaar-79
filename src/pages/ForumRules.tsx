
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ForumRules = () => {
  return (
    <div className="container mx-auto px-4 py-12 animate-fade-in">
      <div className="max-w-4xl mx-auto">
        <Badge variant="secondary" className="mb-3">
          Правила форума
        </Badge>
        <h1 className="text-4xl font-bold mb-6">Правила форума DevTalk</h1>
        <p className="text-muted-foreground mb-12 text-lg">
          Пожалуйста, ознакомьтесь с правилами нашего сообщества для поддержания дружественной и профессиональной атмосферы.
        </p>

        <div className="space-y-8">
          <div>
            <h2 className="text-2xl font-bold mb-4">1. Общие правила</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Уважайте других участников форума и их мнения, даже если вы с ними не согласны.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Запрещается использование ненормативной лексики, оскорблений и личных нападок.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Не публикуйте контент, нарушающий законодательство Российской Федерации.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Запрещается размещение спама, рекламы без согласования с администрацией.</span>
              </li>
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <h2 className="text-2xl font-bold mb-4">2. Создание тем</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Заголовок темы должен отражать суть вопроса или обсуждения. Избегайте заголовков типа "Помогите!", "Срочно!" и т.п.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Перед созданием новой темы проверьте, не обсуждается ли уже этот вопрос на форуме.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Публикуйте темы в соответствующих разделах форума.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>При публикации кода используйте теги для форматирования кода.</span>
              </li>
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <h2 className="text-2xl font-bold mb-4">3. Ответы и комментарии</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Старайтесь давать содержательные ответы, которые помогут решить проблему или продвинуть обсуждение.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Не отклоняйтесь от темы обсуждения.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Если вы автор темы и получили удовлетворительный ответ, отметьте его как решение.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Не публикуйте несколько одинаковых ответов в разных темах (кросспостинг).</span>
              </li>
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <h2 className="text-2xl font-bold mb-4">4. Модерация</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Модераторы имеют право редактировать, перемещать или удалять контент, нарушающий правила форума.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>При нарушении правил модераторы могут выносить предупреждения, временно ограничивать доступ к форуму или полностью блокировать аккаунт.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Если вы считаете, что контент нарушает правила, пожалуйста, сообщите об этом с помощью кнопки "Пожаловаться".</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Решения модераторов обсуждаются в личной переписке, а не в публичных темах.</span>
              </li>
            </ul>
          </div>
          
          <Separator />
          
          <div>
            <h2 className="text-2xl font-bold mb-4">5. Авторские права</h2>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>При цитировании материалов из других источников указывайте источник информации.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Не публикуйте материалы, защищенные авторским правом, без разрешения автора или правообладателя.</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Публикуя свой контент на форуме, вы соглашаетесь с тем, что он может быть использован другими участниками в рамках форума.</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 p-6 border rounded-lg text-muted-foreground">
          <p className="mb-4">
            Администрация форума оставляет за собой право изменять правила в любое время. Продолжая использовать форум после изменения правил, вы соглашаетесь с новыми условиями.
          </p>
          <p>
            Последнее обновление правил: {new Date().toLocaleDateString('ru-RU')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForumRules;
