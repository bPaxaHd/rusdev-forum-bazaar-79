
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Menu, 
  X, 
  Search, 
  Bell, 
  User,
  Monitor, 
  Database, 
  Layers,
  MessageCircle,
  Code,
  LogIn
} from "lucide-react";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const navLinks = [
    { path: "/", label: "Главная" },
    { path: "/frontend", label: "Frontend", icon: <Monitor size={16} /> },
    { path: "/backend", label: "Backend", icon: <Database size={16} /> },
    { path: "/fullstack", label: "Fullstack", icon: <Layers size={16} /> },
    { path: "/forum", label: "Форум", icon: <MessageCircle size={16} /> },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-lg shadow-sm border-b border-border/50"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <NavLink
            to="/"
            className="flex items-center gap-2 font-semibold text-xl"
          >
            <Code className="text-primary" />
            <span className="text-gradient">РусДев</span>
          </NavLink>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `nav-link flex items-center gap-1 ${isActive ? "active" : ""}`
              }
            >
              {link.icon && <span>{link.icon}</span>}
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Right Side Actions */}
        <div className="hidden md:flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full">
            <Search size={18} />
          </Button>

          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="rounded-full relative">
                <Bell size={18} />
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-primary"></span>
              </Button>
              <Avatar className="h-8 w-8 transition-transform duration-300 hover:scale-110">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary font-medium">РД</AvatarFallback>
              </Avatar>
            </div>
          ) : (
            <NavLink to="/login">
              <Button 
                variant="ghost" 
                className="gap-2 animate-fade-in"
              >
                <LogIn size={16} />
                Войти
              </Button>
            </NavLink>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white z-40 pt-16 animate-fade-in">
          <nav className="container mx-auto px-4 py-6 flex flex-col space-y-4">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 py-3 px-4 rounded-lg transition-colors ${
                    isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-secondary"
                  }`
                }
              >
                {link.icon && <span>{link.icon}</span>}
                <span className="font-medium">{link.label}</span>
              </NavLink>
            ))}
            <div className="mt-4 pt-4 border-t">
              {isLoggedIn ? (
                <div className="flex items-center gap-3 p-4">
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">РД</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Пользователь</p>
                    <p className="text-sm text-muted-foreground">user@example.com</p>
                  </div>
                </div>
              ) : (
                <NavLink to="/login">
                  <Button className="w-full gap-2">
                    <LogIn size={16} />
                    Войти в аккаунт
                  </Button>
                </NavLink>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
