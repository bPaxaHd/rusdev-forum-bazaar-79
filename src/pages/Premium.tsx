
import React from "react";
import PremiumFeatures from "@/components/PremiumFeatures";
import { Helmet } from "react-helmet";

const Premium = () => {
  return (
    <>
      <Helmet>
        <title>Премиум возможности | RusDev</title>
      </Helmet>
      <div className="container mx-auto py-6 px-4">
        <div className="mb-10">
          <h1 className="text-4xl font-bold mb-4">Премиум возможности</h1>
          <p className="text-muted-foreground max-w-3xl">
            Расширьте свои возможности с премиум-аккаунтом на нашей платформе для разработчиков. 
            Получите доступ к эксклюзивному контенту, продвинутым инструментам и персональной поддержке.
          </p>
        </div>
        
        <PremiumFeatures />
        
        <div className="mt-16 bg-muted rounded-lg p-8">
          <h2 className="text-2xl font-bold mb-4">Часто задаваемые вопросы</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">Как оплатить премиум-подписку?</h3>
              <p>В настоящее время мы принимаем оплату картами, электронными кошельками и банковским переводом. После выбора плана вы будете перенаправлены на страницу оплаты.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Могу ли я отменить подписку?</h3>
              <p>Да, вы можете отменить подписку в любое время в настройках вашего аккаунта. После отмены вы продолжите пользоваться премиум-функциями до окончания оплаченного периода.</p>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-2">Есть ли пробный период?</h3>
              <p>Да, для новых пользователей доступен 7-дневный пробный период премиум-подписки. Вы можете отменить подписку в любой момент в течение пробного периода без списания средств.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Premium;
