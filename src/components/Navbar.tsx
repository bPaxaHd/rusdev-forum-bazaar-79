
import React, { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
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
import NavbarUserMenu from "./NavbarUserMenu";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, loading } = useAuth();

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
              <NavLink
                key={item.path}
                to={item.path}
                className={({isActive}) => 
                  `py-2 px-3 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-secondary"
                  }`
                }
              >
                {item.name}
              </NavLink>
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
            
            {/* Вставляем NavbarUserMenu если пользователь авторизован, иначе показываем кнопки входа */}
            {loading ? (
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" disabled>
                  Загрузка...
                </Button>
              </div>
            ) : (
              user ? <NavbarUserMenu /> : (
                <>
                  <NavLink to="/login">
                    <Button variant="outline" size="sm">
                      Войти
                    </Button>
                  </NavLink>
                  <NavLink to="/register">
                    <Button variant="default" size="sm">
                      Регистрация
                    </Button>
                  </NavLink>
                </>
              )
            )}
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
            
            {!loading && user && (
              <div className="mr-2">
                <NavbarUserMenu />
              </div>
            )}
            
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
                    <NavLink
                      key={item.path}
                      to={item.path}
                      className={({isActive}) => 
                        `py-2 px-4 rounded-md transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-secondary"
                        }`
                      }
                    >
                      {item.name}
                    </NavLink>
                  ))}
                  {loading ? (
                    <div className="pt-4 mt-2 border-t border-border/50">
                      <Button disabled className="w-full">Загрузка...</Button>
                    </div>
                  ) : !user && (
                    <div className="pt-4 mt-2 border-t border-border/50">
                      <NavLink to="/login" className="block mb-2">
                        <Button variant="outline" className="w-full">Войти</Button>
                      </NavLink>
                      <NavLink to="/register">
                        <Button className="w-full">Регистрация</Button>
                      </NavLink>
                    </div>
                  )}
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
