import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import NavbarUserMenu from "./NavbarUserMenu";
import NavbarLinks from "./NavbarLinks";
import Logo from "./Logo";
import { useTheme } from "@/hooks/useTheme";
const Navbar = () => {
  const {
    user
  } = useAuth();
  const {
    theme,
    toggleTheme
  } = useTheme(); // Fixed: use toggleTheme instead of setTheme
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
    console.log("Searching for:", searchQuery);
    // Implement search functionality
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
              <Logo /> {/* Removed className prop */}
              <span className="font-bold">DevTalk</span>
            </Link>
            <NavbarLinks isMobile={true} />
          </SheetContent>
        </Sheet>

        <Link to="/" className="mr-6 flex items-center gap-2">
          <Logo /> {/* Removed className prop */}
          <span className="font-bold hidden sm:inline-flex">DevTalk</span>
        </Link>

        <NavbarLinks />

        <div className="flex items-center space-x-2 ml-auto">
          

          <NavbarUserMenu />
        </div>
      </div>
    </header>;
};
export default Navbar;