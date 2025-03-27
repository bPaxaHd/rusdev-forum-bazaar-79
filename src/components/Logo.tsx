
import React from "react";
import { Terminal } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

const Logo = () => {
  const { theme } = useTheme();
  
  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Terminal size={28} className="text-primary animate-pulse-glow" />
        <div className="absolute inset-0 bg-primary/20 blur-lg rounded-full -z-10"></div>
      </div>
      <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
        РусДев
      </span>
    </div>
  );
};

export default Logo;
