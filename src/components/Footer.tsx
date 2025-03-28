import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

const Footer: React.FC<FooterProps> = ({ className }) => {
  return (
    <footer className={cn("w-full border-t bg-card py-6", className)}>
      <div className="container flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
        <Link to="/" className="text-balance flex items-center gap-2 font-semibold">
          <span className="text-xl font-bold">RusDev</span>
          <span className="text-sm text-muted-foreground">v1.0</span>
        </Link>
        <nav className="flex gap-4 text-sm text-muted-foreground">
          <Link to="/about-us">О нас</Link>
          <Link to="/contacts">Контакты</Link>
          <Link to="/forum-rules">Правила форума</Link>
          <Link to="/help">Помощь</Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
