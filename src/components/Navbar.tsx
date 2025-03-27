
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Sheet, 
  SheetTrigger, 
  SheetContent, 
  SheetHeader
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu, Monitor, Moon, Sun } from "lucide-react";
import Logo from "./Logo";
import { useTheme } from "@/hooks/useTheme";

const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Эффект для обнаружения скролла
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navItems = [
    { name: "Главная", path: "/" },
    { name: "Frontend", path: "/frontend" },
    { name: "Backend", path: "/backend" },
    { name: "Fullstack", path: "/fullstack" },
    { name: "Форум", path: "/forum" }
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
      isScrolled ? 'bg-background/80 backdrop-blur-md shadow-md' : 'bg-transparent'
    }`}>
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Логотип */}
          <Link to="/" className="flex items-center hover:opacity-90 transition-opacity">
            <Logo />
          </Link>

          {/* Навигация для десктопа */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${
                  location.pathname === item.path ? "active" : ""
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Действия для десктопа */}
          <div className="hidden md:flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              className="rounded-full" 
              aria-label="Переключить тему"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button variant="default" size="sm">
              Войти
            </Button>
          </div>

          {/* Мобильное меню */}
          <div className="flex items-center md:hidden space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme} 
              className="rounded-full" 
              aria-label="Переключить тему"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="Меню">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader className="mb-4">
                  <Logo />
                </SheetHeader>
                <div className="flex flex-col space-y-3">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`py-2 px-4 rounded-md transition-colors ${
                        location.pathname === item.path
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-secondary"
                      }`}
                    >
                      {item.name}
                    </Link>
                  ))}
                  <Button className="mt-4">Войти</Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
