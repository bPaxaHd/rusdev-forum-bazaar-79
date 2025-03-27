
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-background p-4 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-500 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-primary rounded-full blur-[100px]"></div>
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute bg-muted w-1 h-1 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 5}s`
            }}
          ></div>
        ))}
      </div>
      
      <div className="card-glass p-8 md:p-12 max-w-md mx-auto text-center rounded-2xl animate-fade-in relative z-10 border border-border/30 shadow-xl backdrop-blur-md">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="text-8xl font-extrabold text-red-500 animate-pulse">404</div>
            <AlertTriangle size={32} className="absolute top-0 right-0 text-red-500 animate-bounce" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold mb-2 text-foreground">Страница не найдена</h1>
        <p className="text-muted-foreground mb-8">
          Запрашиваемая страница не существует или была перемещена.
        </p>
        
        <div className="p-4 bg-background/50 rounded-lg mb-8 text-sm text-muted-foreground">
          <code>{location.pathname}</code>
        </div>
        
        <NavLink to="/">
          <Button className="gap-2 w-full">
            <Home size={18} />
            Вернуться на главную
          </Button>
        </NavLink>
      </div>
    </div>
  );
};

export default NotFound;
