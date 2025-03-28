
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, MessageSquare, Bookmark, User, Crown } from 'lucide-react';

const MobileNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <nav className="mobile-nav safe-bottom">
      <Link to="/" className={`mobile-nav-item ${isActive('/') ? 'text-primary' : ''}`}>
        <Home className="mobile-nav-icon" />
        <span>Главная</span>
      </Link>
      <Link to="/forum" className={`mobile-nav-item ${isActive('/forum') ? 'text-primary' : ''}`}>
        <MessageSquare className="mobile-nav-icon" />
        <span>Форум</span>
      </Link>
      <Link to="/documentation" className={`mobile-nav-item ${isActive('/documentation') ? 'text-primary' : ''}`}>
        <Bookmark className="mobile-nav-icon" />
        <span>Документация</span>
      </Link>
      <Link to="/profile" className={`mobile-nav-item ${isActive('/profile') ? 'text-primary' : ''}`}>
        <User className="mobile-nav-icon" />
        <span>Профиль</span>
      </Link>
      <Link to="/premium" className={`mobile-nav-item ${location.pathname.includes('/premium') ? 'text-primary' : ''}`}>
        <Crown className="mobile-nav-icon" />
        <span>Премиум</span>
      </Link>
    </nav>
  );
};

export default MobileNavigation;
