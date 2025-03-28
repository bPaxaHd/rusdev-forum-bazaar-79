
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, Search, Sun, Moon, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import NavbarUserMenu from "./NavbarUserMenu";
import NavbarLinks from "./NavbarLinks";
import Logo from "./Logo";
import { useTheme } from "@/hooks/useTheme";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AdminPanel } from "./admin";

const Navbar = () => {
  const {
    user,
    canAccessAdmin
  } = useAuth();
  const {
    theme,
    toggleTheme
  } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      console.log("Searching for:", searchQuery);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return <header className={`sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur transition-shadow duration-200 ${isScrolled ? "shadow-sm" : ""}`}>
      <div className="container flex h-14 sm:h-16 items-center px-2 sm:px-4">
        {/* Кнопка мобильного меню - оставляем */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-1 sm:mr-2 md:hidden" aria-label="Toggle Menu">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[350px]">
            <Link to="/" className="flex items-center gap-2 mb-6 sm:mb-8">
              <Logo />
            </Link>
            <NavbarLinks isMobile={true} />
          </SheetContent>
        </Sheet>

        {/* Логотип - оставляем */}
        <Link to="/" className="mr-2 sm:mr-6 flex items-center gap-1 sm:gap-2">
          <Logo />
        </Link>

        {/* Центральные ссылки - скрываем на мобильных устройствах */}
        <div className="flex-1 hidden md:flex justify-center">
          <NavbarLinks />
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 ml-auto">
          {/* Поиск - скрываем на мобильных устройствах */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="mx-1 hidden md:flex">
                <Search className="h-5 w-5" />
                <span className="sr-only">Поиск</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] sm:w-80 p-0" align="end">
              <form onSubmit={handleSearch} className="flex p-1">
                <Input placeholder="Поиск по сайту..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 border-0 focus-visible:ring-0" />
                <Button type="submit" size="sm" className="ml-1">
                  Найти
                </Button>
              </form>
            </PopoverContent>
          </Popover>
          
          {/* Кнопка темной темы - скрываем на мобильных устройствах */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="mx-1 hidden md:flex">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Переключить тему</span>
          </Button>
          
          {/* Кнопка админ-панели - отображаем только для админов, но скрываем на мобильных */}
          {canAccessAdmin && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setShowAdminPanel(true)} 
              className="mx-1 hidden md:flex"
              title="Панель администратора"
            >
              <ShieldAlert className="h-5 w-5 text-purple-500" />
              <span className="sr-only">Админ панель</span>
            </Button>
          )}

          {/* Меню пользователя - оставляем */}
          <NavbarUserMenu />
        </div>
      </div>
      
      {/* Админ-панель */}
      <AdminPanel 
        open={showAdminPanel} 
        onOpenChange={setShowAdminPanel}
      />
    </header>;
};

export default Navbar;
