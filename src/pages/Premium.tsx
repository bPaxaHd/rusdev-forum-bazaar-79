import React from "react";
import PremiumDesktop from "@/components/PremiumDesktop";
import PremiumFeatures from "@/components/PremiumFeatures";
const Premium = () => {
  return <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-10 text-center">Подписки DevTalk</h1>
      <PremiumDesktop />
      <div className="mt-16 pt-8 border-t">
        
        <PremiumFeatures />
      </div>
    </div>;
};
export default Premium;