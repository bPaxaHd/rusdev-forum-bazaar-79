import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, Search, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import NavbarUserMenu from "./NavbarUserMenu";
import NavbarLinks from "./NavbarLinks";
import Logo from "./Logo";
import { useTheme } from "@/hooks/useTheme";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
const Navbar = () => {
  const {
    user
  } = useAuth();
  const {
    theme,
    toggleTheme
  } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
      <div className="container flex h-16 items-center">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="mr-2 md:hidden" aria-label="Toggle Menu">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[350px]">
            <Link to="/" className="flex items-center gap-2 mb-8">
              <Logo />
              
            </Link>
            <NavbarLinks isMobile={true} />
          </SheetContent>
        </Sheet>

        <Link to="/" className="mr-6 flex items-center gap-2">
          <Logo />
          
        </Link>

        {/* Center the navbar links */}
        <div className="flex-1 flex justify-center">
          <NavbarLinks />
        </div>

        <div className="flex items-center space-x-2 ml-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="mx-1">
                <Search className="h-5 w-5" />
                <span className="sr-only">Поиск</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
              <form onSubmit={handleSearch} className="flex p-1">
                <Input placeholder="Поиск по сайту..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="flex-1 border-0 focus-visible:ring-0" />
                <Button type="submit" size="sm" className="ml-1">
                  Найти
                </Button>
              </form>
            </PopoverContent>
          </Popover>
          
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="mx-1">
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Переключить тему</span>
          </Button>

          <NavbarUserMenu />
        </div>
      </div>
    </header>;
};
export default Navbar;