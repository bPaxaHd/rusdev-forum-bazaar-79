
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="card-glass p-8 md:p-12 max-w-md mx-auto text-center rounded-2xl animate-fade-in">
        <h1 className="text-6xl font-bold mb-4 text-primary">404</h1>
        <p className="text-xl text-foreground mb-2">Страница не найдена</p>
        <p className="text-muted-foreground mb-8">
          Запрашиваемая страница не существует или была перемещена.
        </p>
        <NavLink to="/">
          <Button className="gap-2">
            <Home size={18} />
            Вернуться на главную
          </Button>
        </NavLink>
      </div>
    </div>
  );
};

export default NotFound;
