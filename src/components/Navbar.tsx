
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
    <header className="sticky top-0 z-50 w-full border-b bg-card backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center">
        <div className="flex w-full justify-between items-center">
          <Logo />
          
          <nav className="hidden md:flex mx-auto items-center justify-center gap-6">
            <Link to="/" className="nav-link">Главная</Link>
            <Link to="/frontend" className="nav-link">Frontend</Link>
            <Link to="/backend" className="nav-link">Backend</Link>
            <Link to="/fullstack" className="nav-link">Fullstack</Link>
            <Link to="/forum" className="nav-link">Форум</Link>
          </nav>
          
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
        </div>

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
    </header>
  );
};

export default Navbar;
