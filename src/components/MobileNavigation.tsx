
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Home, MessageSquare, Bookmark, User, Crown, HelpCircle, Video, Briefcase, Info, BookOpen } from 'lucide-react';

const MobileNavigation: React.FC = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === path;
    }
    return location.pathname.includes(path);
  };

  return (
    <nav className="mobile-nav safe-bottom pb-safe overflow-x-auto">
      <div className="flex min-w-max">
        <Link to="/" className={`mobile-nav-item ${isActive('/') ? 'text-primary' : ''}`}>
          <Home className="mobile-nav-icon" />
          <span>Главная</span>
        </Link>
        <Link to="/forum" className={`mobile-nav-item ${isActive('/forum') ? 'text-primary' : ''}`}>
          <MessageSquare className="mobile-nav-icon" />
          <span>Форум</span>
        </Link>
        <Link to="/documentation" className={`mobile-nav-item ${isActive('/documentation') ? 'text-primary' : ''}`}>
          <BookOpen className="mobile-nav-icon" />
          <span>Документация</span>
        </Link>
        <Link to="/video-tutorials" className={`mobile-nav-item ${isActive('/video-tutorials') ? 'text-primary' : ''}`}>
          <Video className="mobile-nav-icon" />
          <span>Видео</span>
        </Link>
        <Link to="/jobs" className={`mobile-nav-item ${isActive('/jobs') ? 'text-primary' : ''}`}>
          <Briefcase className="mobile-nav-icon" />
          <span>Вакансии</span>
        </Link>
        <Link to="/premium" className={`mobile-nav-item ${isActive('/premium') ? 'text-primary' : ''}`}>
          <Crown className="mobile-nav-icon" />
          <span>Премиум</span>
        </Link>
        <Link to="/premium-help" className={`mobile-nav-item ${isActive('/premium-help') ? 'text-primary' : ''}`}>
          <HelpCircle className="mobile-nav-icon" />
          <span>Премиум помощь</span>
        </Link>
        <Link to="/profile" className={`mobile-nav-item ${isActive('/profile') ? 'text-primary' : ''}`}>
          <User className="mobile-nav-icon" />
          <span>Профиль</span>
        </Link>
        <Link to="/about-us" className={`mobile-nav-item ${isActive('/about-us') ? 'text-primary' : ''}`}>
          <Info className="mobile-nav-icon" />
          <span>О нас</span>
        </Link>
      </div>
    </nav>
  );
};

export default MobileNavigation;
