import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Crown, Sparkles, Diamond, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
const PremiumDesktop = () => {
  const navigate = useNavigate();
  const handleGetPremium = () => {
    navigate("/premium");
  };
  return;
};
export default PremiumDesktop;